type AdminRequest = { action: 'login'; username: string; password: string } | { action: 'logout' };

export async function requestAdminSession(request?: AdminRequest): Promise<number> {
  const unavailable = 'Không kết nối được máy chủ đăng nhập quản trị.';
  const response = await fetch('/api/admin-session.php', {
    method: request ? 'POST' : 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: request ? { 'Content-Type': 'application/json', 'X-SachHay-Request': '1' } : undefined,
    body: request ? JSON.stringify(request) : undefined,
  }).catch(() => { throw new Error(unavailable); });

  if (!response.headers.get('Content-Type')?.includes('application/json')) throw new Error(unavailable);
  const result = await response.json();
  if (!response.ok) throw new Error(typeof result?.error === 'string' ? result.error : unavailable);
  if (result?.authenticated === false) return 0;
  if (result?.authenticated === true && Number.isFinite(result.expiresAt)) return result.expiresAt * 1000;
  throw new Error(unavailable);
}
