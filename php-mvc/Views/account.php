<p class="crumb"><a href="/">Trang chủ</a> / Tài khoản</p>

<?php if (!empty($isAdmin)): ?>
    <section class="admin-banner-card">
        <div class="admin-banner-content">
            <span class="admin-shield-icon">🛡️</span>
            <div>
                <h2 class="admin-banner-title">Bạn đang đăng nhập phiên Quản Trị Viên (Admin)</h2>
                <p class="admin-banner-sub">Bạn có toàn quyền quản lý kho sách, xem và cập nhật trạng thái đơn hàng, doanh thu và tin nhắn khách hàng.</p>
            </div>
        </div>
        <div class="admin-banner-actions">
            <a href="/admin" class="button admin-enter-btn">Vào Bảng Quản Trị &rarr;</a>
            <button type="button" class="secondary" data-admin-logout>Đăng xuất Admin</button>
        </div>
    </section>
<?php endif; ?>

<?php if (!$email): ?>
    <!-- GIAO DIỆN KHI CHƯA ĐĂNG NHẬP -->
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
                <button type="button" class="auth-tab admin-tab-btn" id="tab-btn-admin" onclick="switchAuthTab('admin')" role="tab" aria-selected="false">
                    🛡️ Admin
                </button>
            </div>

            <div class="auth-body">
                <!-- FORM ĐĂNG NHẬP KHÁCH HÀNG -->
                <div id="auth-panel-login" class="auth-panel">
                    <form action="/account" method="post" class="auth-form">
                        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                        <input type="hidden" name="action" value="login">

                        <div class="form-group">
                            <label for="login-email">Địa chỉ Email</label>
                            <input type="email" id="login-email" name="email" required maxlength="254" autocomplete="email" placeholder="Ví dụ: khachhang@gmail.com">
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

                        <div class="auth-footer-links">
                            <p class="auth-switch-text">
                                Chưa có tài khoản? <a href="javascript:void(0)" onclick="switchAuthTab('register')">Đăng ký tài khoản mới</a>
                            </p>
                            <div class="admin-quick-link">
                                <span>Bạn là Quản trị viên?</span>
                                <a href="javascript:void(0)" onclick="switchAuthTab('admin')">Đăng nhập Admin tại đây 🛡️</a>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- FORM ĐĂNG KÝ KHÁCH HÀNG -->
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

                <!-- FORM ĐĂNG NHẬP QUẢN TRỊ VIÊN (ADMIN) -->
                <div id="auth-panel-admin" class="auth-panel" style="display: none;">
                    <form method="post" class="auth-form" data-admin-auth>
                        <div class="admin-auth-header-box">
                            <span class="admin-icon-large">🛡️</span>
                            <div>
                                <h3 style="margin:0 0 .2rem; font-size:1.05rem; font-weight:750;">Đăng Nhập Quản Trị Viên</h3>
                                <p class="muted" style="margin:0; font-size:.8rem;">Truy cập cổng quản lý kho hàng, đơn hàng và cấu hình.</p>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="admin-username">Tài khoản Admin</label>
                            <input id="admin-username" name="username" required maxlength="64" autocomplete="username" value="admin" placeholder="admin">
                        </div>

                        <div class="form-group">
                            <label for="admin-password">Mật khẩu Admin</label>
                            <div class="password-wrapper">
                                <input id="admin-password" name="password" type="password" required maxlength="72" autocomplete="current-password" placeholder="Nhập mật khẩu quản trị">
                                <button type="button" class="toggle-password" onclick="togglePass('admin-password', this)" aria-label="Xem mật khẩu" title="Xem/Ẩn mật khẩu">
                                    <span class="eye-icon">👁️</span>
                                </button>
                            </div>
                        </div>

                        <p role="alert" data-auth-message class="form-error" hidden style="margin: 0; padding: .4rem .6rem; background: #fee2e2; border-radius: .4rem;"></p>

                        <button type="submit" class="auth-btn-primary" style="background: #1f2420;">
                            Đăng Nhập Quản Trị &rarr;
                        </button>

                        <p class="auth-switch-text">
                            <a href="javascript:void(0)" onclick="switchAuthTab('login')">← Quay lại Đăng nhập Khách hàng</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>

        <!-- LỢI ÍCH KHI LÀ HỘI VIÊN -->
        <div class="auth-benefits-row">
            <div class="benefit-item">
                <span class="benefit-icon">🚚</span>
                <div>
                    <strong>Freeship Đơn Từ 250k</strong>
                    <p>Miễn phí giao hàng tiêu chuẩn trên toàn quốc</p>
                </div>
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">🎁</span>
                <div>
                    <strong>Tích Điểm Đổi Quà</strong>
                    <p>Nhận ngay 150 Sách Xu khi tạo tài khoản</p>
                </div>
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">🛡️</span>
                <div>
                    <strong>Bảo Hành 100% Chính Hãng</strong>
                    <p>Đổi trả miễn phí trong 7 ngày nếu lỗi in ấn</p>
                </div>
            </div>
        </div>
    </div>

<?php else: ?>
    <!-- GIAO DIỆN TÀI KHOẢN CHI TIẾT (KHI ĐÃ ĐĂNG NHẬP) -->
    <div class="account-dashboard">
        <!-- 1. PROFILE HERO CARD -->
        <section class="profile-hero-card">
            <div class="profile-main-meta">
                <div class="profile-avatar-wrap">
                    <div class="profile-avatar">
                        <?= strtoupper(substr($email, 0, 1)) ?>
                    </div>
                    <span class="vip-crown-badge" title="Hội viên thân thiết">⭐</span>
                </div>
                <div class="profile-info">
                    <div class="profile-name-row">
                        <h1 class="profile-title"><?= $e($customerName ?: 'Khách Hàng Sách Hay') ?></h1>
                        <span class="profile-tier-badge">Hạng Bạc · Thân thiết</span>
                    </div>
                    <p class="profile-email">
                        <span>✉️ <?= $e($email) ?></span>
                        <?php if ($customerPhone): ?>
                            <span>📞 <?= $e($customerPhone) ?></span>
                        <?php endif; ?>
                    </p>
                    <p class="profile-joined-text">Thành viên từ: 2026 · Sách Hay Online Club</p>
                </div>
            </div>
            <div class="profile-hero-actions">
                <button type="button" class="btn-edit-profile" onclick="switchPortalTab('profile')">
                    Chỉnh sửa hồ sơ
                </button>
                <form class="profile-logout-form" action="/account" method="post" style="display:inline;">
                    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                    <button class="secondary btn-logout" name="action" value="logout" title="Đăng xuất">
                        Đăng xuất
                    </button>
                </form>
            </div>
        </section>

        <!-- 2. THẺ 4 CHỈ SỐ THỐNG KÊ (STATS GRID) -->
        <div class="account-stats-grid">
            <div class="stat-card" onclick="switchPortalTab('orders')" style="cursor: pointer;">
                <div class="stat-icon-box blue">📦</div>
                <div class="stat-content">
                    <span class="stat-label">Đơn Hàng Của Tôi</span>
                    <strong class="stat-value"><?= count($orders) ?> đơn</strong>
                    <small class="stat-sub"><?= $completedCount ?> đơn hoàn tất</small>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-box green">💰</div>
                <div class="stat-content">
                    <span class="stat-label">Tổng Chi Tiêu</span>
                    <strong class="stat-value"><?= $money($totalSpent) ?></strong>
                    <small class="stat-sub">Tích lũy từ đơn đã mua</small>
                </div>
            </div>
            <div class="stat-card" onclick="switchPortalTab('membership')" style="cursor: pointer;">
                <div class="stat-icon-box amber">🪙</div>
                <div class="stat-content">
                    <span class="stat-label">Sách Xu Thưởng</span>
                    <strong class="stat-value"><?= number_format($points) ?> Xu</strong>
                    <small class="stat-sub">Quy đổi ~<?= $money($points * 100) ?></small>
                </div>
            </div>
            <div class="stat-card" onclick="switchPortalTab('vouchers')" style="cursor: pointer;">
                <div class="stat-icon-box red">🎟️</div>
                <div class="stat-content">
                    <span class="stat-label">Mã Giảm Giá</span>
                    <strong class="stat-value"><?= count($vouchers) ?> Voucher</strong>
                    <small class="stat-sub">Khả dụng áp dụng ngay</small>
                </div>
            </div>
        </div>

        <!-- 3. GIAO DIỆN TABS ĐIỀU HƯỚNG CHI TIẾT -->
        <div class="account-portal-layout">
            <!-- THANH ĐIỀU HƯỚNG BÊN TRÁI -->
            <aside class="account-sidebar-nav">
                <div class="sidebar-title">Menu Tài Khoản</div>
                <nav class="portal-nav-links">
                    <button type="button" class="portal-nav-item active" id="pnav-orders" onclick="switchPortalTab('orders')">
                        <span class="nav-icon">📦</span>
                        <span class="nav-label">Đơn Hàng Của Tôi</span>
                        <span class="nav-badge"><?= count($orders) ?></span>
                    </button>
                    <button type="button" class="portal-nav-item" id="pnav-vouchers" onclick="switchPortalTab('vouchers')">
                        <span class="nav-icon">🎟️</span>
                        <span class="nav-label">Kho Voucher &amp; Ưu Đãi</span>
                        <span class="nav-badge highlight"><?= count($vouchers) ?></span>
                    </button>
                    <button type="button" class="portal-nav-item" id="pnav-address" onclick="switchPortalTab('address')">
                        <span class="nav-icon">📍</span>
                        <span class="nav-label">Sổ Địa Chỉ Nhận Hàng</span>
                    </button>
                    <button type="button" class="portal-nav-item" id="pnav-profile" onclick="switchPortalTab('profile')">
                        <span class="nav-icon">👤</span>
                        <span class="nav-label">Thông Tin Cá Nhân</span>
                    </button>
                    <button type="button" class="portal-nav-item" id="pnav-security" onclick="switchPortalTab('security')">
                        <span class="nav-icon">🔒</span>
                        <span class="nav-label">Đổi Mật Khẩu &amp; Bảo Mật</span>
                    </button>
                    <button type="button" class="portal-nav-item" id="pnav-membership" onclick="switchPortalTab('membership')">
                        <span class="nav-icon">⭐</span>
                        <span class="nav-label">Đặc Quyền Hội Viên</span>
                    </button>
                </nav>
            </aside>

            <!-- NỘI DUNG TỪNG TAB -->
            <main class="account-main-content">
                <!-- TAB 1: ĐƠN HÀNG CỦA TÔI -->
                <div id="ptab-orders" class="portal-tab-pane active">
                    <div class="tab-pane-header">
                        <h2>Đơn Hàng Của Bạn</h2>
                        <span class="muted">Hiển thị lịch sử mua sách</span>
                    </div>

                    <!-- BỘ LỌC ĐƠN HÀNG -->
                    <div class="order-filter-bar">
                        <button type="button" class="filter-chip active" onclick="filterOrderList('all', this)">Tất cả (<?= count($orders) ?>)</button>
                        <button type="button" class="filter-chip" onclick="filterOrderList('pending', this)">Chờ xử lý</button>
                        <button type="button" class="filter-chip" onclick="filterOrderList('confirmed', this)">Đã xác nhận</button>
                        <button type="button" class="filter-chip" onclick="filterOrderList('shipping', this)">Đang giao</button>
                        <button type="button" class="filter-chip" onclick="filterOrderList('completed', this)">Hoàn thành</button>
                        <button type="button" class="filter-chip" onclick="filterOrderList('cancelled', this)">Đã hủy</button>
                    </div>

                    <?php if (!$orders): ?>
                        <div class="empty-orders-card">
                            <div class="empty-orders-illustration">📦</div>
                            <h3>Bạn chưa có đơn hàng nào</h3>
                            <p class="muted">Hàng ngàn tựa sách hay đang chờ đón bạn khám phá với nhiều ưu đãi hấp dẫn!</p>
                            <a href="/books" class="button btn-browse-books">Khám phá sách ngay &rarr;</a>
                        </div>
                    <?php else: ?>
                        <div class="order-cards-list">
                            <?php foreach ($orders as $record): 
                                $order = $record['order']; 
                                $payment = $record['payment'] ?? null; 
                                $status = $order['status'] ?? 'pending';
                            ?>
                                <article class="order-ticket-card" data-order-status="<?= $e($status) ?>">
                                    <div class="order-card-header">
                                        <div class="order-meta-info">
                                            <span class="order-id-tag">#<?= $e($order['orderCode']) ?></span>
                                            <span class="order-date-text">📅 <?= date('d/m/Y H:i', strtotime($order['created_at'] ?? 'now')) ?></span>
                                            <span class="order-payment-method">Thanh toán: <?= $e($order['paymentMethod']) ?></span>
                                        </div>
                                        <span class="order-status-pill status-<?= $e($status) ?>">
                                            <?= $e($statusNames[$status] ?? $status) ?>
                                        </span>
                                    </div>

                                    <div class="order-items-summary">
                                        <ul class="order-item-rows">
                                            <?php foreach ($order['items'] as $item): ?>
                                                <li class="order-item-row">
                                                    <span class="item-name">📚 <?= $e($item['title']) ?></span>
                                                    <span class="item-qty">x<?= $item['quantity'] ?></span>
                                                    <span class="item-price"><?= $money($item['price']) ?></span>
                                                </li>
                                            <?php endforeach; ?>
                                        </ul>
                                    </div>

                                    <?php if ($payment && $payment['status'] === 'pending' && !empty($payment['qrUrl'])): ?>
                                        <div class="order-vietqr-box">
                                            <img src="<?= $e($payment['qrUrl']) ?>" alt="Mã VietQR" class="vietqr-img">
                                            <div class="vietqr-info">
                                                <strong>Chuyển khoản VietQR tự động xác nhận</strong>
                                                <p><?= $e($payment['bankName']) ?> · STK: <code><?= $e($payment['accountNumber']) ?></code></p>
                                                <p>Chủ TK: <b><?= $e($payment['accountName']) ?></b> · Số tiền: <span class="price"><?= $money($payment['amount']) ?></span></p>
                                                <p>Nội dung CK: <code><?= $e($order['orderCode']) ?></code></p>
                                            </div>
                                        </div>
                                    <?php endif; ?>

                                    <div class="order-card-footer">
                                        <div class="order-total-block">
                                            <span class="total-label">Tổng thanh toán:</span>
                                            <strong class="total-amount"><?= $money($order['total']) ?></strong>
                                        </div>
                                        <div class="order-card-actions">
                                            <?php if ($status === 'pending' && ($payment['status'] ?? '') !== 'paid'): ?>
                                                <form action="/account" method="post" style="display:inline;" onsubmit="return confirm('Bạn có chắc chắn muốn hủy đơn hàng này?');">
                                                    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                                                    <input type="hidden" name="id" value="<?= $e($order['id']) ?>">
                                                    <button class="secondary btn-cancel-order" name="action" value="cancel">Hủy đơn</button>
                                                </form>
                                            <?php endif; ?>
                                            <a href="/books" class="button secondary btn-reorder">Mua thêm sách</a>
                                        </div>
                                    </div>
                                </article>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- TAB 2: KHO VOUCHER & ƯU ĐÃI -->
                <div id="ptab-vouchers" class="portal-tab-pane" style="display: none;">
                    <div class="tab-pane-header">
                        <h2>Kho Voucher &amp; Mã Giảm Giá</h2>
                        <span class="muted">Áp dụng mã tại bước thanh toán</span>
                    </div>

                    <div class="vouchers-grid">
                        <?php foreach ($vouchers as $v): 
                            $valText = $v['kind'] === 'percentage' ? ($v['value'] . '%') : $money($v['value']);
                            $kindLabel = $v['kind'] === 'shipping' ? 'Miễn phí vận chuyển' : ($v['kind'] === 'percentage' ? 'Giảm phần trăm' : 'Giảm tiền mặt');
                        ?>
                            <div class="voucher-ticket-card">
                                <div class="voucher-ticket-left">
                                    <span class="voucher-icon"><?= $v['kind'] === 'shipping' ? '🚚' : '🏷️' ?></span>
                                    <strong class="voucher-amount"><?= $valText ?></strong>
                                    <span class="voucher-badge-type"><?= $kindLabel ?></span>
                                </div>
                                <div class="voucher-ticket-right">
                                    <h3 class="voucher-title">Mã: <code><?= $e($v['code']) ?></code></h3>
                                    <p class="voucher-desc">Đơn tối thiểu <?= $money($v['minimum']) ?><?= $v['cap'] ? (' · Tối đa ' . $money($v['cap'])) : '' ?></p>
                                    <p class="voucher-date">HSD: <?= date('d/m/Y', $v['valid_until']) ?></p>
                                    <button type="button" class="btn-copy-code" onclick="copyVoucher('<?= $e($v['code']) ?>', this)">
                                        Sao chép mã
                                    </button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- TAB 3: SỔ ĐỊA CHỈ NHẬN HÀNG -->
                <div id="ptab-address" class="portal-tab-pane" style="display: none;">
                    <div class="tab-pane-header">
                        <h2>Sổ Địa Chỉ Giao Hàng</h2>
                        <span class="muted">Quản lý địa chỉ giao sách tận nơi</span>
                    </div>

                    <div class="address-cards-wrapper">
                        <div class="address-card default-address">
                            <div class="address-card-header">
                                <span class="address-tag-default">Địa chỉ mặc định</span>
                                <span class="address-icon">🏠</span>
                            </div>
                            <div class="address-card-body">
                                <h3 class="recipient-name"><?= $e($customerName ?: 'Nguyễn Văn Khách') ?></h3>
                                <p class="recipient-phone">📞 <?= $e($customerPhone ?: '0912 345 678') ?></p>
                                <p class="recipient-location">📍 <?= $e($customerAddress ?: 'Phước Tân, Thành phố Biên Hòa, Tỉnh Đồng Nai') ?></p>
                            </div>
                            <div class="address-card-footer">
                                <button type="button" class="btn-text-action" onclick="document.getElementById('edit-address-form-box').scrollIntoView({behavior:'smooth'});">Chỉnh sửa</button>
                            </div>
                        </div>

                        <!-- FORM CẬP NHẬT ĐỊA CHỈ -->
                        <div id="edit-address-form-box" class="portal-form-card">
                            <h3>Cập Nhật Địa Chỉ Mới</h3>
                            <form action="/account" method="post" class="standard-portal-form">
                                <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                                <input type="hidden" name="action" value="update_profile">

                                <div class="form-row-2">
                                    <div class="form-group">
                                        <label for="addr-name">Họ và tên người nhận</label>
                                        <input type="text" id="addr-name" name="name" required value="<?= $e($customerName ?: '') ?>" placeholder="Ví dụ: Nguyễn Văn Khách">
                                    </div>
                                    <div class="form-group">
                                        <label for="addr-phone">Số điện thoại liên hệ</label>
                                        <input type="tel" id="addr-phone" name="phone" required value="<?= $e($customerPhone ?: '') ?>" placeholder="Ví dụ: 0912345678">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="addr-address">Địa chỉ chi tiết (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP)</label>
                                    <textarea id="addr-address" name="address" rows="3" required placeholder="Ví dụ: Số 123 Đường Nguyễn Ái Quốc, Phước Tân, Biên Hòa, Đồng Nai"><?= $e($customerAddress ?: '') ?></textarea>
                                </div>

                                <button type="submit" class="button btn-save-profile">Lưu địa chỉ giao hàng</button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- TAB 4: THÔNG TIN CÁ NHÂN -->
                <div id="ptab-profile" class="portal-tab-pane" style="display: none;">
                    <div class="tab-pane-header">
                        <h2>Hồ Sơ Cá Nhân</h2>
                        <span class="muted">Cập nhật thông tin để nhận hỗ trợ tốt nhất</span>
                    </div>

                    <div class="portal-form-card">
                        <form action="/account" method="post" class="standard-portal-form">
                            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                            <input type="hidden" name="action" value="update_profile">

                            <div class="form-group">
                                <label for="prof-email">Địa chỉ Email (Cố định theo tài khoản)</label>
                                <input type="email" id="prof-email" value="<?= $e($email) ?>" readonly disabled class="input-disabled">
                                <small class="form-hint">Email đăng nhập không thể thay đổi để bảo vệ tài khoản.</small>
                            </div>

                            <div class="form-row-2">
                                <div class="form-group">
                                    <label for="prof-name">Họ và tên</label>
                                    <input type="text" id="prof-name" name="name" value="<?= $e($customerName ?: '') ?>" placeholder="Nhập họ và tên của bạn">
                                </div>
                                <div class="form-group">
                                    <label for="prof-phone">Số điện thoại</label>
                                    <input type="tel" id="prof-phone" name="phone" value="<?= $e($customerPhone ?: '') ?>" placeholder="09xxxxxxxx">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="prof-address">Địa chỉ thường trú</label>
                                <input type="text" id="prof-address" name="address" value="<?= $e($customerAddress ?: '') ?>" placeholder="Địa chỉ giao sách mặc định">
                            </div>

                            <button type="submit" class="button btn-save-profile">Lưu thay đổi hồ sơ</button>
                        </form>
                    </div>
                </div>

                <!-- TAB 5: ĐỔI MẬT KHẨU & BẢO MẬT -->
                <div id="ptab-security" class="portal-tab-pane" style="display: none;">
                    <div class="tab-pane-header">
                        <h2>Đổi Mật Khẩu &amp; Bảo Mật</h2>
                        <span class="muted">Tăng cường bảo mật cho tài khoản của bạn</span>
                    </div>

                    <div class="portal-form-card">
                        <form action="/account" method="post" class="standard-portal-form" onsubmit="return validateChangePass(this);">
                            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                            <input type="hidden" name="action" value="change_password">

                            <div class="form-group">
                                <label for="cp-old">Mật khẩu hiện tại</label>
                                <div class="password-wrapper">
                                    <input type="password" id="cp-old" name="old_password" required placeholder="Nhập mật khẩu hiện tại">
                                    <button type="button" class="toggle-password" onclick="togglePass('cp-old', this)">
                                        <span class="eye-icon">👁️</span>
                                    </button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="cp-new">Mật khẩu mới</label>
                                <div class="password-wrapper">
                                    <input type="password" id="cp-new" name="new_password" required minlength="6" placeholder="Tối thiểu 6 ký tự">
                                    <button type="button" class="toggle-password" onclick="togglePass('cp-new', this)">
                                        <span class="eye-icon">👁️</span>
                                    </button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="cp-confirm">Xác nhận mật khẩu mới</label>
                                <div class="password-wrapper">
                                    <input type="password" id="cp-confirm" name="confirm_password" required minlength="6" placeholder="Nhập lại mật khẩu mới">
                                    <button type="button" class="toggle-password" onclick="togglePass('cp-confirm', this)">
                                        <span class="eye-icon">👁️</span>
                                    </button>
                                </div>
                                <small id="cp-match-error" class="form-error" style="display: none;">Mật khẩu xác nhận không khớp!</small>
                            </div>

                            <button type="submit" class="button btn-save-profile">Cập nhật mật khẩu mới</button>
                        </form>
                    </div>
                </div>

                <!-- TAB 6: ĐẶC QUYỀN HỘI VIÊN -->
                <div id="ptab-membership" class="portal-tab-pane" style="display: none;">
                    <div class="tab-pane-header">
                        <h2>Đặc Quyền Hội Viên Sách Hay Club</h2>
                        <span class="muted">Tích điểm nâng hạng và nhận quyền lợi VIP</span>
                    </div>

                    <div class="membership-level-card">
                        <div class="level-badge-header">
                            <span class="level-crown">👑</span>
                            <div>
                                <h3>Hạng Hiện Tại: HỘI VIÊN BẠC</h3>
                                <p>Tích lũy thêm 350 Sách Xu để nâng lên <b>Hội Viên Vàng (VIP)</b></p>
                            </div>
                        </div>
                        <div class="level-progress-bar">
                            <div class="level-progress-fill" style="width: 30%;"></div>
                        </div>
                        <div class="level-progress-labels">
                            <span>0 Xu (Mới)</span>
                            <span><b><?= number_format($points) ?> Xu</b> (Hiện tại)</span>
                            <span>500 Xu (Hạng Vàng)</span>
                        </div>
                    </div>

                    <div class="membership-perks-grid">
                        <div class="perk-card">
                            <span class="perk-icon">🪙</span>
                            <strong>Tích Điểm Mua Sắm</strong>
                            <p>Tích lũy 2% giá trị trên mỗi đơn hàng thành Sách Xu để trừ tiền cho đơn kế tiếp.</p>
                        </div>
                        <div class="perk-card">
                            <span class="perk-icon">🚚</span>
                            <strong>Ưu Đãi Vận Chuyển</strong>
                            <p>Freeship đơn từ 250k và giảm 25.000đ phí giao nhanh cho thành viên.</p>
                        </div>
                        <div class="perk-card">
                            <span class="perk-icon">🎁</span>
                            <strong>Quà Tặng Sinh Nhật</strong>
                            <p>Voucher giảm 25% tối đa 100.000đ dành tặng riêng trong tháng sinh nhật của bạn.</p>
                        </div>
                        <div class="perk-card">
                            <span class="perk-icon">⚡</span>
                            <strong>Quyền Truy Cập Sớm</strong>
                            <p>Được đặt mua trước các bộ truyện Hot, sách bản giới hạn có chữ ký tác giả.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- SCRIPT CHUYỂN TABS PORTAL VÀ TIỆN ÍCH -->
    <script>
    function switchPortalTab(tabName) {
        const navItems = document.querySelectorAll('.portal-nav-item');
        const tabPanes = document.querySelectorAll('.portal-tab-pane');

        navItems.forEach(item => item.classList.remove('active'));
        tabPanes.forEach(pane => pane.style.display = 'none');

        const activeNav = document.getElementById('pnav-' + tabName);
        const activePane = document.getElementById('ptab-' + tabName);

        if (activeNav) activeNav.classList.add('active');
        if (activePane) activePane.style.display = 'block';

        history.replaceState(null, '', '#' + tabName);
    }

    function filterOrderList(status, btn) {
        const chips = document.querySelectorAll('.filter-chip');
        chips.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');

        const orderCards = document.querySelectorAll('.order-ticket-card');
        orderCards.forEach(card => {
            if (status === 'all' || card.getAttribute('data-order-status') === status) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    function copyVoucher(code, btn) {
        navigator.clipboard.writeText(code).then(() => {
            const original = btn.textContent;
            btn.textContent = 'Đã chép! ✓';
            btn.style.background = '#15803d';
            btn.style.color = '#fff';
            setTimeout(() => {
                btn.textContent = original;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });
    }

    function validateChangePass(form) {
        const newP = form.querySelector('#cp-new').value;
        const confirmP = form.querySelector('#cp-confirm').value;
        const err = document.getElementById('cp-match-error');
        if (newP !== confirmP) {
            err.style.display = 'block';
            form.querySelector('#cp-confirm').focus();
            return false;
        }
        err.style.display = 'none';
        return true;
    }

    // Tự động mở tab theo hash URL
    (function () {
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById('ptab-' + hash)) {
            switchPortalTab(hash);
        }
    })();
    </script>
<?php endif; ?>
