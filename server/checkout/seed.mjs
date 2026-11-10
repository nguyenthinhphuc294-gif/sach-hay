import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { connectCheckout } from './app.mjs';
import { StockBook, Voucher } from './models.mjs';

const demoBooks = JSON.parse(await readFile(new URL('./demo-books.json', import.meta.url), 'utf8'));

export async function seedCheckout() {
  const now = new Date();
  const validUntil = new Date(now.getTime() + 365 * 86_400_000);
  const vouchers = [
    { code: 'SACHHAY20K', kind: 'fixed', value: 20_000, minimum: 150_000 },
    { code: 'GIAM15', kind: 'percentage', value: 15, minimum: 300_000, cap: 60_000 },
    { code: 'FREESHIP', kind: 'shipping', value: 25_000, minimum: 100_000 },
  ];
  // Seeding is additive: re-running cannot replenish sold books or reset voucher usage.
  for (const { id: _id, ...book } of demoBooks) {
    await StockBook.updateOne({ _id }, { $setOnInsert: book }, { upsert: true });
  }
  for (const { code, ...voucher } of vouchers) {
    await Voucher.updateOne({ code }, { $setOnInsert: {
      ...voucher, validFrom: now, validUntil, maxUses: 100, maxPerUser: 1, used: 0,
    } }, { upsert: true });
  }
  return { books: demoBooks.length, vouchers: vouchers.length };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    await connectCheckout(process.env.CHECKOUT_MONGODB_URI);
    console.log(await seedCheckout());
  } finally {
    await mongoose.disconnect();
  }
}
