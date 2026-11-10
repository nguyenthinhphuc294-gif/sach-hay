import { useState, type FormEvent } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function AdminLogin() {
  const { loginAdmin, setActiveView } = useStore();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setError('');
    setPending(true);
    try {
      await loginAdmin(String(fields.get('username') ?? ''), String(fields.get('password') ?? ''));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Đăng nhập thất bại.');
      form.querySelector<HTMLInputElement>('input[name=password]')?.select();
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="inline-flex rounded-xl bg-red-50 p-3 text-[#C92127]">
          <LockKeyhole aria-hidden="true" className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Đăng nhập quản trị</h1>
        <p className="mt-1 text-sm text-slate-600">Nhập tài khoản và mật khẩu để vào trang quản trị Sách Hay.</p>
        <form method="post" onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Tài khoản
            <input name="username" autoComplete="username" required maxLength={64}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal focus:outline-[#C92127]" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Mật khẩu
            <input type="password" name="password" autoComplete="current-password" required maxLength={72}
              className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal focus:outline-[#C92127]" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          <button type="submit" disabled={pending}
            className="w-full rounded-lg bg-[#C92127] py-2.5 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60">
            {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
          <button type="button" onClick={() => setActiveView('home')}
            className="w-full text-sm font-semibold text-slate-600 hover:text-[#C92127]">Về trang chủ</button>
        </form>
      </div>
    </section>
  );
}
