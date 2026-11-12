<p class="crumb"><a href="/">Trang chủ</a> / <span>Đăng nhập Quản trị</span></p>

<div class="admin-auth-page">
    <div class="admin-auth-container">
        <!-- CARD QUẢN TRỊ VIÊN -->
        <div class="admin-auth-card">
            <!-- HEADER THẺ QUẢN TRỊ -->
            <div class="admin-auth-header">
                <div class="admin-shield-emblem">
                    <span class="shield-glyph">🛡️</span>
                </div>
                <div class="admin-portal-badge">
                    <span class="pulse-indicator"></span>
                    <span>CỔNG QUẢN TRỊ NỘI BỘ · SSL 256-BIT</span>
                </div>
                <h1 class="admin-title">Đăng Nhập Quản Trị</h1>
                <p class="admin-subtitle">Hệ thống quản lý kho sách, kiểm soát đơn hàng &amp; doanh thu Sách Hay</p>
            </div>

            <!-- BODY THẺ QUẢN TRỊ -->
            <div class="admin-auth-body">
                <form method="post" class="admin-form-stack" data-admin-auth>
                    <!-- TÀI KHOẢN -->
                    <div class="admin-field-group">
                        <label for="admin-username" class="admin-label">
                            <span class="icon">👤</span> Tên đăng nhập Admin
                        </label>
                        <div class="admin-input-box">
                            <input id="admin-username" name="username" required maxlength="64" autocomplete="username" value="admin" placeholder="Nhập tên đăng nhập quản trị" class="admin-input">
                        </div>
                    </div>

                    <!-- MẬT KHẨU -->
                    <div class="admin-field-group">
                        <div class="admin-label-flex">
                            <label for="admin-password" class="admin-label">
                                <span class="icon">🔑</span> Mật khẩu quản trị
                            </label>
                            <span class="security-chip">Bảo mật cấp cao</span>
                        </div>
                        <div class="admin-input-box password-box">
                            <input id="admin-password" name="password" type="password" required maxlength="72" autocomplete="current-password" placeholder="Nhập mật khẩu quản trị" class="admin-input">
                            <button type="button" class="btn-toggle-eye" onclick="toggleAdminPass(this)" aria-label="Xem mật khẩu" title="Xem/Ẩn mật khẩu">
                                <span class="eye-symbol">👁️</span>
                            </button>
                        </div>
                    </div>

                    <!-- KHỐI HỖ TRỢ ĐĂNG NHẬP NHANH (MẪU) -->
                    <div class="admin-autofill-card">
                        <div class="autofill-info">
                            <span class="sparkle-icon">💡</span>
                            <div class="autofill-text">
                                <span class="info-label">Tài khoản mặc định:</span>
                                <code class="credential-tag">admin</code> / <code class="credential-tag">Admin@123456</code>
                            </div>
                        </div>
                        <button type="button" class="btn-autofill-action" onclick="fillAdminCredentials()">
                            Điền nhanh ⚡
                        </button>
                    </div>

                    <!-- THÔNG BÁO LỖI -->
                    <p role="alert" data-auth-message class="admin-error-box" hidden></p>

                    <!-- NÚT ĐĂNG NHẬP CHÍNH -->
                    <button type="submit" class="btn-admin-submit" id="btn-admin-submit">
                        <span class="btn-lock-icon">🔒</span>
                        <span class="btn-label">Đăng Nhập Quản Trị Hệ Thống</span>
                        <span class="btn-arrow">&rarr;</span>
                    </button>

                    <!-- CHÚ THÍCH AN TOÀN -->
                    <div class="admin-security-footer">
                        <span class="sec-badge-icon">🛡️</span>
                        <p class="sec-text">
                            <strong>Khu vực hạn chế:</strong> Cổng quản trị này chỉ dành cho người quản lý và nhân viên vận hành hệ thống Sách Hay. Mọi lượt truy cập đều được giám sát và lưu nhật ký an toàn.
                        </p>
                    </div>

                    <!-- ĐIỀU HƯỚNG TRỞ VỀ -->
                    <div class="admin-nav-back-row">
                        <a href="/" class="nav-back-link">
                            <span>&larr;</span> Trở về Trang Chủ
                        </a>
                        <span class="sep-bullet">&bull;</span>
                        <a href="/account" class="nav-back-link">
                            Tài Khoản Khách Hàng <span>&rarr;</span>
                        </a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<style>
/* ADMIN AUTH PAGE STYLING */
.admin-auth-page {
    padding: 1rem 0 3.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.admin-auth-container {
    width: 100%;
    max-width: 490px;
    margin: 0 auto;
}

.admin-auth-card {
    background: #ffffff;
    border-radius: 1.25rem;
    box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.07);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.admin-auth-header {
    background: linear-gradient(135deg, #111827 0%, #1e293b 50%, #0f172a 100%);
    padding: 2.2rem 2rem 2rem;
    text-align: center;
    position: relative;
    border-bottom: 3px solid var(--red, #c81826);
}

.admin-shield-emblem {
    position: relative;
    width: 70px;
    height: 70px;
    margin: 0 auto 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(200, 24, 38, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%);
    border: 2px solid rgba(239, 68, 68, 0.45);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(200, 24, 38, 0.35), inset 0 0 15px rgba(255, 255, 255, 0.1);
}

.shield-glyph {
    font-size: 2.2rem;
    line-height: 1;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

.admin-portal-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.3rem 0.85rem;
    border-radius: 9999px;
    color: #cbd5e1;
    font-size: 0.72rem;
    font-weight: 750;
    letter-spacing: 0.75px;
    text-transform: uppercase;
    margin-bottom: 0.85rem;
}

.pulse-indicator {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
}

.admin-title {
    margin: 0;
    font-size: 1.65rem;
    font-weight: 850;
    color: #ffffff;
    letter-spacing: -0.3px;
    line-height: 1.25;
}

.admin-subtitle {
    margin: 0.55rem auto 0;
    color: #94a3b8;
    font-size: 0.875rem;
    line-height: 1.45;
    max-width: 380px;
}

.admin-auth-body {
    padding: 2rem 2.2rem 2.2rem;
}

.admin-form-stack {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.admin-field-group {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}

.admin-label, .admin-label-flex label {
    font-size: 0.88rem;
    font-weight: 750;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

.admin-label-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.security-chip {
    font-size: 0.72rem;
    font-weight: 700;
    color: #047857;
    background: #d1fae5;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
}

.admin-input-box {
    position: relative;
    width: 100%;
}

.admin-input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.85rem 1rem;
    font-size: 0.95rem;
    border: 1.5px solid #d1d5db;
    border-radius: 0.65rem;
    background: #f8fafc;
    color: #0f172a;
    transition: all 0.2s ease;
    font-family: inherit;
}

.admin-input:focus {
    outline: none;
    background: #ffffff;
    border-color: var(--red, #c81826);
    box-shadow: 0 0 0 3px rgba(200, 24, 38, 0.15);
}

.password-box .admin-input {
    padding-right: 2.8rem;
}

.btn-toggle-eye {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.btn-toggle-eye:hover {
    opacity: 1;
}

/* AUTOFILL HELPER CARD */
.admin-autofill-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 0.9rem;
    background: #f0fdf4;
    border: 1px dashed #86efac;
    border-radius: 0.65rem;
}

.autofill-info {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.82rem;
    color: #166534;
}

.sparkle-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
}

.credential-tag {
    background: rgba(22, 101, 52, 0.12);
    color: #14532d;
    padding: 0.15rem 0.35rem;
    border-radius: 4px;
    font-weight: 750;
    font-family: monospace;
    font-size: 0.82rem;
}

.btn-autofill-action {
    background: #166534;
    color: #ffffff !important;
    border: none;
    padding: 0.38rem 0.75rem;
    border-radius: 0.45rem;
    font-size: 0.78rem;
    font-weight: 750;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;
}

.btn-autofill-action:hover {
    background: #14532d;
}

/* ERROR MESSAGE BOX */
.admin-error-box {
    margin: 0;
    padding: 0.75rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-left: 4px solid #dc2626;
    border-radius: 0.5rem;
    color: #991b1b;
    font-size: 0.88rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.admin-error-box:before {
    content: "⚠️";
    font-size: 1rem;
}

/* SUBMIT BUTTON */
.btn-admin-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    width: 100%;
    padding: 0.95rem 1.5rem;
    background: linear-gradient(135deg, var(--red, #c81826) 0%, #a1121d 100%);
    color: #ffffff !important;
    border: none;
    border-radius: 0.65rem;
    font-size: 1.02rem;
    font-weight: 800;
    letter-spacing: 0.2px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(200, 24, 38, 0.35);
    transition: all 0.2s ease;
    margin-top: 0.35rem;
}

.btn-admin-submit:hover:not(:disabled) {
    background: linear-gradient(135deg, #a1121d 0%, #7f0d16 100%);
    box-shadow: 0 6px 18px rgba(200, 24, 38, 0.45);
    transform: translateY(-1px);
}

.btn-admin-submit:active:not(:disabled) {
    transform: translateY(0);
}

.btn-admin-submit:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.btn-admin-submit .btn-arrow {
    transition: transform 0.2s;
}

.btn-admin-submit:hover:not(:disabled) .btn-arrow {
    transform: translateX(3px);
}

/* SECURITY FOOTER NOTE */
.admin-security-footer {
    display: flex;
    gap: 0.65rem;
    padding: 0.85rem 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    margin-top: 0.35rem;
}

.sec-badge-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
    line-height: 1.3;
}

.sec-text {
    margin: 0;
    font-size: 0.775rem;
    color: #64748b;
    line-height: 1.45;
}

.sec-text strong {
    color: #334155;
}

/* BACK LINKS */
.admin-nav-back-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    padding-top: 0.75rem;
    border-top: 1px solid #f1f5f9;
}

.nav-back-link {
    color: #64748b;
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}

.nav-back-link:hover {
    color: var(--red, #c81826);
    text-decoration: underline;
}

.sep-bullet {
    color: #cbd5e1;
    font-size: 0.8rem;
}
</style>

<script>
function toggleAdminPass(btn) {
    var input = document.getElementById('admin-password');
    if (!input) return;
    var isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    var eye = btn.querySelector('.eye-symbol');
    if (eye) eye.textContent = isPass ? '🙈' : '👁️';
}

function fillAdminCredentials() {
    var u = document.getElementById('admin-username');
    var p = document.getElementById('admin-password');
    if (u) u.value = 'admin';
    if (p) {
        p.value = 'Admin@123456';
        p.focus();
    }
}
</script>
