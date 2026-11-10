import type { Book } from './types';

export type ProductInput = Pick<Book, 'title' | 'author' | 'publisher' | 'isbn' | 'categoryId'
  | 'categoryName' | 'description' | 'price' | 'originalPrice' | 'stock'> & { cover?: string; expectedStock?: number };

const adminBooks = '/api/admin-session.php/books';

export async function catalogBooks(signal: AbortSignal): Promise<Book[]> {
  const response = await fetch('/api/catalog/books', { signal });
  if (!response.ok) throw new Error('Không tải được danh mục sản phẩm.');
  const products = await response.json();
  if (!Array.isArray(products)) throw new Error('Không tải được danh mục sản phẩm.');
  return products;
}

async function changeProduct(id: string | undefined, method: string, product?: ProductInput): Promise<Book | undefined> {
  const response = await fetch(id ? adminBooks + '/' + encodeURIComponent(id) : adminBooks, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-SachHay-Request': '1' },
    body: product ? JSON.stringify(product) : undefined,
  });
  if (response.status === 204) return undefined;
  if (!response.headers.get('Content-Type')?.includes('application/json')) {
    throw new Error('Chưa kết nối được máy chủ quản lý sản phẩm.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Chưa lưu được sản phẩm.');
  return data;
}

export function saveProduct(product: ProductInput, id?: string) {
  return changeProduct(id, id ? 'PATCH' : 'POST', product);
}

export function removeProduct(id: string) {
  return changeProduct(id, 'DELETE');
}

export async function prepareBookCover(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Vui lòng chọn ảnh JPG, PNG hoặc WebP.');
  }
  if (file.size > 12 * 1024 * 1024) throw new Error('Ảnh gốc tối đa 12 MB.');
  let image: ImageBitmap;
  try {
    image = await createImageBitmap(file);
  } catch {
    throw new Error('Không đọc được ảnh. Vui lòng chọn tệp khác.');
  }

  try {
    const scale = Math.min(1, 900 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Trình duyệt chưa xử lý được ảnh.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const preview = canvas.toDataURL('image/jpeg', 0.82);
    if (!preview.startsWith('data:image/jpeg;base64,') || preview.length > 600_023) {
      throw new Error('Ảnh sau khi xử lý vẫn quá lớn. Vui lòng chọn ảnh nhẹ hơn.');
    }
    return { preview, cover: preview.split(',')[1] };
  } finally {
    image.close();
  }
}
