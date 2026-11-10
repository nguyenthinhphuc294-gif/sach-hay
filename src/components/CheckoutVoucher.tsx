import { useState, type FormEvent } from 'react';
import { checkoutFailure, signIn, signOut } from '../checkout/api';

type Props = {
  email: string | null;
  onSession: (email: string | null) => void;
  onApply: (code: string) => void;
  onRemove: () => void;
  appliedCode?: string;
  disabled: boolean;
};

const button = 'rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-[#C92127] disabled:opacity-50';
const field = 'rounded-lg border border-slate-300 px-3 py-2 text-sm';

export function CheckoutVoucher({ email, onSession, onApply, onRemove, appliedCode, disabled }: Props) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState('');

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setAuthError('');
    try {
      const session = await signIn(authMode, String(data.get('email')).trim(), String(data.get('password')));
      form.reset();
      onSession(session.email);
      setShowAuth(false);
    } catch (error) {
      setAuthError(checkoutFailure(error).message);
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    setPending(true);
    setAuthError('');
    try {
      await signOut();
      onSession(null);
      onRemove();
    } catch (error) {
      setAuthError(checkoutFailure(error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="checkout-voucher">
      <h2 id="checkout-voucher" className="mb-2 text-sm font-bold text-slate-900">Voucher thanh toán</h2>
      {email ? (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span>Tài khoản voucher: {email}</span>
            <button type="button" disabled={pending || disabled} className={button} onClick={logout}>Đăng xuất</button>
          </div>
          <form className="flex flex-wrap gap-2" onSubmit={event => {
            event.preventDefault();
            if (!disabled && code.trim()) onApply(code.trim().toUpperCase());
          }}>
            <input aria-label="Mã voucher" value={code} onChange={event => setCode(event.target.value)}
              placeholder="Nhập mã voucher" required maxLength={40} className={field} />
            <button className={button} disabled={disabled}>Áp dụng</button>
            {appliedCode && <button type="button" className={button} disabled={disabled} onClick={onRemove}>Bỏ mã</button>}
          </form>
          {appliedCode && <p className="mt-2 text-xs font-semibold text-emerald-700" role="status">Đã áp dụng {appliedCode}.</p>}
        </>
      ) : (
        <>
          <p className="mb-2 text-xs text-slate-600">Đăng nhập để áp dụng voucher cho tài khoản của bạn.</p>
          {!showAuth && <button type="button" className={button} disabled={disabled} onClick={() => setShowAuth(true)}>Đăng nhập để dùng voucher</button>}
          {showAuth && (
            <form className="flex flex-wrap items-center gap-2" method="post" onSubmit={authenticate}>
              <input type="email" name="email" aria-label="Email tài khoản voucher" placeholder="Email tài khoản" required className={field} autoComplete="username" />
              <input type="password" name="password" aria-label="Mật khẩu tài khoản voucher" placeholder="Mật khẩu (ít nhất 10 ký tự)"
                required minLength={10} maxLength={128} className={field} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} />
              <button className={button} disabled={pending || disabled}>{authMode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
              <button type="button" className={button} disabled={pending || disabled}
                onClick={() => { setAuthError(''); setAuthMode(authMode === 'login' ? 'register' : 'login'); }}>
                {authMode === 'login' ? 'Chưa có tài khoản' : 'Đã có tài khoản'}
              </button>
            </form>
          )}
        </>
      )}
      {authError && <p role="alert" className="mt-2 text-sm text-red-700">{authError}</p>}
    </section>
  );
}
