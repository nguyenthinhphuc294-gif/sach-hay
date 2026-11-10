import { randomUUID } from 'node:crypto';
import express from 'express';
import { z } from 'zod';
import { StockBook } from './checkout/models.mjs';
import { CheckoutError } from './checkout/input.mjs';

const maxImageBytes = 450_000;
const shortText = z.string().trim().min(1).max(160);
const productInput = z.object({
  title: shortText,
  author: shortText,
  publisher: shortText,
  isbn: z.string().trim().min(1).max(40),
  categoryId: z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/),
  categoryName: shortText,
  description: z.string().trim().max(6000),
  price: z.number().int().min(0).max(100_000_000),
  originalPrice: z.number().int().min(0).max(100_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  expectedStock: z.number().int().min(0).max(1_000_000).optional(),
  cover: z.string().max(4 * Math.ceil(maxImageBytes / 3)).optional(),
}).strict();
const productId = /^book-[a-f0-9-]{36}$/;
const managedBook = { active: true, 'catalog.createdAt': { $exists: true } };

async function verifyAdmin(req, _res, next) {
  if (req.get('X-SachHay-Request') !== '1') return next(new CheckoutError(403, 'INVALID_REQUEST', 'Yêu cầu không hợp lệ.'));
  const cookie = req.get('Cookie')?.match(/(?:^|;\s*)SachHayAdmin=([a-zA-Z0-9,-]{1,128})(?:;|$)/)?.[1];
  if (!cookie) return next(new CheckoutError(401, 'ADMIN_REQUIRED', 'Vui lòng đăng nhập lại trang quản trị.'));

  try {
    const checkUrl = process.env.ADMIN_SESSION_CHECK_URL || 'http://127.0.0.1:8787/api/admin-session.php';
    const response = await fetch(checkUrl, {
      headers: { Cookie: 'SachHayAdmin=' + cookie },
      redirect: 'error',
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error('Admin session check failed');
    const session = await response.json();
    if (session.authenticated === true && session.expiresAt * 1000 > Date.now()) return next();
    return next(new CheckoutError(401, 'ADMIN_REQUIRED', 'Vui lòng đăng nhập lại trang quản trị.'));
  } catch {
    return next(new CheckoutError(503, 'ADMIN_UNAVAILABLE', 'Chưa kiểm tra được phiên quản trị. Vui lòng thử lại.'));
  }
}

function parseProduct(body) {
  const parsed = productInput.safeParse(body);
  if (!parsed.success) throw new CheckoutError(400, 'INVALID_PRODUCT', 'Vui lòng kiểm tra thông tin sản phẩm và ảnh bìa.');
  const { title, price, stock, expectedStock, cover, ...catalog } = parsed.data;
  const coverData = cover === undefined ? undefined : Buffer.from(cover, 'base64');
  if (coverData && (coverData.length < 5 || coverData.length > maxImageBytes
    || coverData.toString('base64') !== cover
    || coverData[0] !== 0xff || coverData[1] !== 0xd8 || coverData[2] !== 0xff
    || coverData[coverData.length - 2] !== 0xff || coverData[coverData.length - 1] !== 0xd9)) {
    throw new CheckoutError(400, 'INVALID_COVER', 'Ảnh bìa không hợp lệ. Vui lòng chọn lại ảnh.');
  }
  return { title, price, stock, expectedStock, coverData, catalog };
}

function showProduct({ _id, title, price, stock, soldCount, coverImage, catalog }) {
  const { author, publisher, isbn, originalPrice, categoryId, categoryName, description, createdAt } = catalog;
  return {
    id: _id, slug: _id, title, author, authorId: _id, publisher, supplier: publisher, isbn, price, originalPrice,
    discountPercent: originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0,
    coverImage, thumbnails: [coverImage], categoryId, categoryName, stock, soldCount,
    rating: 0, reviewCount: 0, format: 'Bìa mềm', publicationYear: createdAt.getUTCFullYear(),
    pages: 0, language: 'Tiếng Việt', dimensions: '', weight: 0, description,
    shortDescription: description.slice(0, 100), isNewRelease: true, source: 'catalog-api',
  };
}

export function mountCatalog(app) {
  app.get('/api/catalog/books', async (_req, res, next) => {
    try {
      const products = await StockBook.find(managedBook).sort({ 'catalog.createdAt': -1 }).lean();
      res.set('Cache-Control', 'no-store').json(products.map(showProduct));
    } catch (error) { next(error); }
  });
  app.get('/api/catalog/books/:id/cover', async (req, res, next) => {
    try {
      const book = productId.test(req.params.id) && await StockBook.findById(req.params.id).select('coverData');
      if (!book?.coverData) return res.sendStatus(404);
      res.set('X-Content-Type-Options', 'nosniff').set('Cache-Control', 'no-cache')
        .type('jpeg').send(book.coverData);
    } catch (error) { next(error); }
  });

  // Keep the existing PHP admin cookie scoped to the admin-session URL.
  const adminPath = '/api/admin-session.php/books';
  const body = express.json({ limit: '640kb' });
  app.post(adminPath, verifyAdmin, body, async (req, res, next) => {
    try {
      const { coverData, catalog, title, price, stock } = parseProduct(req.body);
      if (!coverData) throw new CheckoutError(400, 'COVER_REQUIRED', 'Vui lòng chọn ảnh bìa.');
      const _id = 'book-' + randomUUID();
      const product = await StockBook.create({
        _id, title, price, stock, coverData, coverImage: `/api/catalog/books/${_id}/cover`,
        catalog: { ...catalog, createdAt: new Date() },
      });
      res.status(201).json(showProduct(product));
    } catch (error) { next(error); }
  });
  app.patch(adminPath + '/:id', verifyAdmin, body, async (req, res, next) => {
    try {
      const { coverData, catalog, title, price, stock, expectedStock } = parseProduct(req.body);
      if (!productId.test(req.params.id)) throw new CheckoutError(404, 'PRODUCT_NOT_FOUND', 'Không tìm thấy sản phẩm.');
      if (expectedStock === undefined) throw new CheckoutError(400, 'INVALID_PRODUCT', 'Vui lòng mở lại sản phẩm để chỉnh sửa.');
      const filter = { ...managedBook, _id: req.params.id };
      const changes = { title, price };
      if (stock !== expectedStock) {
        filter.stock = expectedStock;
        changes.stock = stock;
      }
      for (const [key, value] of Object.entries(catalog)) changes['catalog.' + key] = value;
      if (coverData) {
        changes.coverData = coverData;
        changes.coverImage = `/api/catalog/books/${req.params.id}/cover?v=${randomUUID()}`;
      }
      const product = await StockBook.findOneAndUpdate(
        filter, { $set: changes }, { returnDocument: 'after', runValidators: true },
      );
      if (!product && stock !== expectedStock && await StockBook.exists({ ...managedBook, _id: req.params.id })) {
        throw new CheckoutError(409, 'STOCK_CHANGED', 'Tồn kho đã thay đổi. Hãy tải lại trang trước khi sửa tồn kho.');
      }
      if (!product) throw new CheckoutError(404, 'PRODUCT_NOT_FOUND', 'Không tìm thấy sản phẩm.');
      res.json(showProduct(product));
    } catch (error) { next(error); }
  });
  app.delete(adminPath + '/:id', verifyAdmin, async (req, res, next) => {
    try {
      const result = productId.test(req.params.id) && await StockBook.updateOne(
        { ...managedBook, _id: req.params.id }, { $set: { active: false } },
      );
      if (!result?.matchedCount) throw new CheckoutError(404, 'PRODUCT_NOT_FOUND', 'Không tìm thấy sản phẩm.');
      res.sendStatus(204);
    } catch (error) { next(error); }
  });
}
