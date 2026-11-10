import 'dotenv/config';
import { checkoutApp, connectCheckout } from './app.mjs';

if ((process.env.CHECKOUT_JWT_SECRET ?? '').length < 32) {
  throw new Error('CHECKOUT_JWT_SECRET must contain at least 32 characters');
}

await connectCheckout(process.env.CHECKOUT_MONGODB_URI);
const port = Number(process.env.CHECKOUT_PORT ?? 8788);
checkoutApp().listen(port, '127.0.0.1', () => console.log(`Checkout API on http://127.0.0.1:${port}`));
