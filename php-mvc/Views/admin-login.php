<p class="crumb"><a href="/">Trang chủ</a> / Quản trị viên</p>

<!-- GIAO DIỆN ĐĂNG NHẬP QUẢN TRỊ (CHUẨN FORM TÀI KHOẢN) -->
<div class="auth-wrapper">
    <div class="auth-card">
        <div class="auth-header">
            <span class="auth-badge-icon"><?php $icon = 'shield'; require __DIR__ . '/store-icon.php'; ?></span>
            <h2>Tài Khoản Quản Trị</h2>
            <p class="auth-subhead">Đăng nhập để vào hệ thống quản lý Nhà sách Sách Hay</p>
        </div>

        <div class="auth-body">
            <form method="post" class="auth-form" data-admin-auth>
                <div class="form-group">
                    <label for="admin-username">Tài khoản</label>
                    <input type="text" id="admin-username" name="username" required maxlength="64" autocomplete="username" value="admin" placeholder="Ví dụ: admin">
                </div>

                <div class="form-group">
                    <div class="label-row">
                        <label for="admin-password">Mật khẩu</label>
                        <a href="javascript:void(0)" onclick="alert('Mật khẩu quản trị mặc định: Admin@123456\nNếu bạn đã đổi mật khẩu, vui lòng kiểm tra lại cấu hình máy chủ.');" class="sub-link">Quên mật khẩu?</a>
                    </div>
                    <div class="password-wrapper">
                        <input type="password" id="admin-password" name="password" required minlength="6" maxlength="72" autocomplete="current-password" placeholder="Nhập mật khẩu của bạn">
                        <button type="button" class="toggle-password" onclick="togglePass('admin-password', this)" aria-label="Xem mật khẩu" title="Xem/Ẩn mật khẩu">
                            <span class="eye-icon">👁️</span>
                        </button>
                    </div>
                </div>

                <p role="alert" data-auth-message class="form-error" hidden style="margin: 0; padding: .5rem .75rem; background: #fee2e2; border-radius: .45rem; font-size: .84rem; font-weight: 600;"></p>

                <button type="submit" class="auth-btn-primary">
                    Đăng Nhập
                </button>

                <div class="auth-footer-links">
                    <p class="auth-switch-text">
                        Bạn là khách hàng? <a href="/account">Quay lại đăng nhập tài khoản</a>
                    </p>
                    <div class="admin-quick-link">
                        <span>Quay lại trang chủ?</span>
                        <a href="/">Về Trang Chủ Sách Hay 🏠</a>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function togglePass(inputId, btn) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    var eye = btn.querySelector('.eye-icon');
    if (eye) eye.textContent = isPass ? '🙈' : '👁️';
}
</script>
