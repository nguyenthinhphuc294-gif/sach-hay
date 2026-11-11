<p class="crumb"><a href="/">Trang chủ</a> / Tài khoản</p>

<?php if (!$email): ?>
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-header">
                <span class="auth-badge-icon"><?php $icon = 'user'; require __DIR__ . '/store-icon.php'; ?></span>
                <h2>Tài Khoản Sách Hay</h2>
                <p class="auth-subhead">Đăng nhập hoặc đăng ký để trải nghiệm mua sách tốt nhất</p>
            </div>

            <div class="auth-tabs" role="tablist">
                <button type="button" class="auth-tab active" id="tab-btn-login" onclick="switchAuthTab('login')" role="tab" aria-selected="true">
                    Đăng Nhập
                </button>
                <button type="button" class="auth-tab" id="tab-btn-register" onclick="switchAuthTab('register')" role="tab" aria-selected="false">
                    Đăng Ký
                </button>
            </div>

            <div class="auth-body">
                <!-- FORM ĐĂNG NHẬP -->
                <div id="auth-panel-login" class="auth-panel">
                    <form action="/account" method="post" class="auth-form">
                        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                        <input type="hidden" name="action" value="login">

                        <div class="form-group">
                            <label for="login-email">Địa chỉ Email</label>
                            <input type="email" id="login-email" name="email" required maxlength="254" autocomplete="email" placeholder="Ví dụ: nguyenvana@gmail.com">
                        </div>

                        <div class="form-group">
                            <div class="label-row">
                                <label for="login-password">Mật khẩu</label>
                                <a href="javascript:void(0)" onclick="alert('Quý khách vui lòng liên hệ hotline hoặc gửi tin nhắn tại trang Liên Hệ để được hỗ trợ khôi phục mật khẩu.');" class="sub-link">Quên mật khẩu?</a>
                            </div>
                            <div class="password-wrapper">
                                <input type="password" id="login-password" name="password" required minlength="6" maxlength="128" placeholder="Nhập mật khẩu của bạn">
                                <button type="button" class="toggle-password" onclick="togglePass('login-password', this)" aria-label="Xem mật khẩu" title="Xem/Ẩn mật khẩu">
                                    <span class="eye-icon">👁️</span>
                                </button>
                            </div>
                        </div>

                        <button type="submit" class="auth-btn-primary">
                            Đăng Nhập
                        </button>

                        <p class="auth-switch-text">
                            Chưa có tài khoản? <a href="javascript:void(0)" onclick="switchAuthTab('register')">Đăng ký tài khoản mới</a>
                        </p>
                    </form>
                </div>

                <!-- FORM ĐĂNG KÝ -->
                <div id="auth-panel-register" class="auth-panel" style="display: none;">
                    <form action="/account" method="post" class="auth-form" onsubmit="return validateRegister(this)">
                        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                        <input type="hidden" name="action" value="register">

                        <div class="form-group">
                            <label for="reg-email">Địa chỉ Email</label>
                            <input type="email" id="reg-email" name="email" required maxlength="254" autocomplete="email" placeholder="Ví dụ: nguyenvana@gmail.com">
                            <small class="form-hint">Email sẽ dùng để nhận thông tin đơn hàng và đăng nhập.</small>
                        </div>

                        <div class="form-group">
                            <label for="reg-password">Tạo Mật khẩu</label>
                            <div class="password-wrapper">
                                <input type="password" id="reg-password" name="password" required minlength="6" maxlength="128" placeholder="Tối thiểu 6 ký tự">
                                <button type="button" class="toggle-password" onclick="togglePass('reg-password', this)" aria-label="Xem mật khẩu" title="Xem/Ẩn mật khẩu">
                                    <span class="eye-icon">👁️</span>
                                </button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="reg-password-confirm">Xác nhận lại Mật khẩu</label>
                            <div class="password-wrapper">
                                <input type="password" id="reg-password-confirm" name="password_confirm" required minlength="6" maxlength="128" placeholder="Nhập lại mật khẩu vừa tạo">
                                <button type="button" class="toggle-password" onclick="togglePass('reg-password-confirm', this)" aria-label="Xem mật khẩu" title="Xem/Ẩn mật khẩu">
                                    <span class="eye-icon">👁️</span>
                                </button>
                            </div>
                            <small id="reg-match-error" class="form-error" style="display: none;">Mật khẩu xác nhận không khớp!</small>
                        </div>

                        <p class="policy-note">
                            Bằng việc nhấn Đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của Nhà sách Sách Hay.
                        </p>

                        <button type="submit" class="auth-btn-primary">
                            Tạo Tài Khoản
                        </button>

                        <p class="auth-switch-text">
                            Đã có tài khoản? <a href="javascript:void(0)" onclick="switchAuthTab('login')">Đăng nhập ngay</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
    function switchAuthTab(tab) {
        const loginBtn = document.getElementById('tab-btn-login');
        const regBtn = document.getElementById('tab-btn-register');
        const loginPanel = document.getElementById('auth-panel-login');
        const regPanel = document.getElementById('auth-panel-register');
        
        if (tab === 'register') {
            loginBtn.classList.remove('active');
            loginBtn.setAttribute('aria-selected', 'false');
            regBtn.classList.add('active');
            regBtn.setAttribute('aria-selected', 'true');
            loginPanel.style.display = 'none';
            regPanel.style.display = 'block';
            history.replaceState(null, '', '#register');
        } else {
            regBtn.classList.remove('active');
            regBtn.setAttribute('aria-selected', 'false');
            loginBtn.classList.add('active');
            loginBtn.setAttribute('aria-selected', 'true');
            regPanel.style.display = 'none';
            loginPanel.style.display = 'block';
            history.replaceState(null, '', '#login');
        }
    }

    function togglePass(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            btn.querySelector('.eye-icon').textContent = '🙈';
        } else {
            input.type = 'password';
            btn.querySelector('.eye-icon').textContent = '👁️';
        }
    }

    function validateRegister(form) {
        const pass = form.querySelector('#reg-password').value;
        const confirm = form.querySelector('#reg-password-confirm').value;
        const err = document.getElementById('reg-match-error');
        if (pass !== confirm) {
            err.style.display = 'block';
            form.querySelector('#reg-password-confirm').focus();
            return false;
        }
        err.style.display = 'none';
        return true;
    }

    // Tự động chuyển tab theo URL query hoặc hash
    (function () {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('tab') === 'register' || window.location.hash === '#register') {
            switchAuthTab('register');
        }
    })();
    </script>
<?php else: ?>
    <section class="profile-header-card">
        <div class="profile-avatar">
            <?= strtoupper(substr($email, 0, 1)) ?>
        </div>
        <div class="profile-info">
            <h1 class="profile-title">Tài Khoản Của Tôi</h1>
            <p class="profile-email"><?= $e($email) ?></p>
            <span class="profile-badge">Thành viên thân thiết</span>
        </div>
        <form class="profile-logout-form" action="/account" method="post">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <button class="secondary" name="action" value="logout">
                <?php $icon = 'user'; require __DIR__ . '/store-icon.php'; ?> Đăng xuất
            </button>
        </form>
    </section>
<?php endif; ?>

<section class="panel orders-section">
    <div class="section-head">
        <h2>Đơn hàng của bạn</h2>
        <span class="muted"><?= count($orders) ?> đơn hàng</span>
    </div>
    <?php if (!$orders): ?>
        <div class="empty-orders">
            <span class="empty-icon"><?php $icon = 'truck'; require __DIR__ . '/store-icon.php'; ?></span>
            <p class="muted">Bạn chưa có đơn hàng nào.</p>
            <a href="/books" class="button">Khám phá sách ngay</a>
        </div>
    <?php endif; ?>
    <?php foreach ($orders as $record): $order = $record['order']; $payment = $record['payment'] ?? null; ?>
        <details class="order"<?= $record === $orders[0] ? ' open' : '' ?>>
            <summary>
                <strong><?= $e($order['orderCode']) ?></strong> · 
                <span class="order-status-badge status-<?= $e($order['status']) ?>">
                    <?= $e($statusNames[$order['status']] ?? $order['status']) ?>
                </span> · 
                <span class="price"><?= $money($order['total']) ?></span>
            </summary>
            <ul><?php foreach ($order['items'] as $item): ?><li><?= $e($item['title']) ?> × <?= $item['quantity'] ?></li><?php endforeach; ?></ul>
            <?php if ($payment): ?>
                <?php if ($payment['status'] === 'pending'): ?>
                    <div class="payment" data-payment-url="/api/checkout/orders/<?= $e($order['orderCode']) ?>/payment" data-payment-token="<?= $e($payment['token']) ?>">
                        <img src="<?= $e($payment['qrUrl']) ?>" alt="Mã VietQR">
                        <p><?= $e($payment['bankName']) ?> · <?= $e($payment['accountNumber']) ?> · <?= $e($payment['accountName']) ?></p>
                        <p>Số tiền <?= $money($payment['amount']) ?>. Nội dung <?= $e($order['orderCode']) ?>.</p>
                        <p role="status">Đang chờ xác nhận thanh toán.</p>
                    </div>
                <?php elseif ($payment['status'] === 'paid'): ?><p class="notice">Đã thanh toán.</p><?php endif; ?>
            <?php endif; ?>
            <?php if ($order['status'] === 'pending' && ($payment['status'] ?? '') !== 'paid'): ?>
                <form action="/account" method="post" style="margin-top: .6rem;">
                    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>"><input type="hidden" name="id" value="<?= $e($order['id']) ?>">
                    <button class="secondary" name="action" value="cancel">Hủy đơn</button>
                </form>
            <?php endif; ?>
        </details>
    <?php endforeach; ?>
</section>
