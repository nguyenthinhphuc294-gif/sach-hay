require('dotenv/config');

async function start() {
  if ((process.env.CHECKOUT_JWT_SECRET ?? '').length < 32) {
    throw new Error('Set CHECKOUT_JWT_SECRET to at least 32 characters.');
  }
  const express = require('express');
  const { checkoutApp, connectCheckout } = await import('./server/checkout/app.mjs');
  await connectCheckout(process.env.CHECKOUT_MONGODB_URI);
  if (process.env.CHECKOUT_SEED_ON_START === '1') {
    const { seedCheckout } = await import('./server/checkout/seed.mjs');
    await seedCheckout();
  }

  const app = express();
  app.disable('x-powered-by');
  const api = checkoutApp();
  api.get('/health', (_req, res) => res.set('Cache-Control', 'no-store').json({ status: 'ok' }));
  // Passenger may preserve the application prefix or pass an already scoped URL.
  app.use('/sachhay-backend', api);
  app.use(api);
  app.listen(Number(process.env.PORT ?? process.env.CHECKOUT_PORT ?? 8788), '127.0.0.1');
}

start().catch(error => {
  console.error('Sách Hay backend failed to start. Check the Node.js logs and the database and session settings.', {
    type: error.name, code: error.code,
  });
  process.exit(1);
});
