import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';
import { Customer } from './models.mjs';
import { authInput, CheckoutError, parse } from './input.mjs';

const derive = promisify(scrypt);
const cookie = 'sachhay_checkout';
const saltSize = 16;
const keySize = 64;
const emptyHash = Buffer.alloc(keySize + saltSize);
const jwtOptions = { issuer: 'sachhay-checkout', audience: 'sachhay-web' };

function cookieOptions() {
  return { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/api/checkout' };
}

function tokenSecret() {
  const secret = process.env.CHECKOUT_JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('CHECKOUT_JWT_SECRET must contain at least 32 characters');
  return secret;
}

export function customerSession(req, _res, next) {
  const token = (req.get('cookie') ?? '').split(';').map(value => value.trim())
    .find(value => value.startsWith(cookie + '='))?.slice(cookie.length + 1);
  if (token) {
    try {
      const claims = jwt.verify(token, tokenSecret(), { ...jwtOptions, algorithms: ['HS256'] });
      if (typeof claims.sub === 'string' && /^[0-9a-f]{24}$/.test(claims.sub)) req.customerId = claims.sub;
    } catch (error) {
      if (!(error instanceof jwt.JsonWebTokenError)) return next(error);
    }
  }
  next();
}

export const authenticate = action => async (req, res, next) => {
  try {
    const { email, password } = parse(authInput, req.body);
    let customer;
    if (action === 'register') {
      const salt = randomBytes(saltSize);
      const hash = await derive(password, salt, keySize);
      try {
        customer = await Customer.create({ email, passwordHash: Buffer.concat([salt, hash]).toString('hex') });
      } catch (error) {
        if (error.code === 11000) throw new CheckoutError(409, 'EMAIL_EXISTS', 'Email đã được đăng ký.');
        throw error;
      }
    } else {
      customer = await Customer.findOne({ email }).select('+passwordHash');
      const stored = customer ? Buffer.from(customer.passwordHash, 'hex') : emptyHash;
      const actual = await derive(password, stored.subarray(0, saltSize), keySize);
      if (!timingSafeEqual(actual, stored.subarray(saltSize)) || !customer) {
        throw new CheckoutError(401, 'BAD_LOGIN', 'Email hoặc mật khẩu không đúng.');
      }
    }
    const token = jwt.sign({}, tokenSecret(), { ...jwtOptions, subject: customer.id, expiresIn: '2h', algorithm: 'HS256' });
    res.cookie(cookie, token, { ...cookieOptions(), maxAge: 7_200_000 });
    res.status(action === 'register' ? 201 : 200).json({ email: customer.email });
  } catch (error) {
    next(error);
  }
};

export async function currentCustomer(req, res, next) {
  try {
    const user = req.customerId && await Customer.findById(req.customerId).select('email').lean();
    res.json({ email: user?.email ?? null });
  } catch (error) {
    next(error);
  }
}

export function logout(_req, res) {
  res.clearCookie(cookie, cookieOptions()).sendStatus(204);
}
