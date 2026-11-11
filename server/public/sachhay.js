async function adminSession(body, button) {
    const message = document.querySelector('[data-auth-message]');
    button.disabled = true;
    try {
        const response = await fetch('/api/admin-session.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'X-SachHay-Request': '1'},
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Thao tác chưa thành công.');
        location.replace('/admin');
    } catch (error) {
        message.textContent = error instanceof SyntaxError ? 'Không kết nối được máy chủ quản trị.' : error.message;
        message.hidden = false;
        button.disabled = false;
    }
}

const adminForm = document.querySelector('[data-admin-auth]');
adminForm?.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(adminForm));
    adminSession({action: 'login', ...data}, adminForm.querySelector('button'));
});
document.querySelector('[data-admin-logout]')?.addEventListener('click', event => adminSession({action: 'logout'}, event.currentTarget));

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const flashClock = document.querySelector('[data-flash-end]');
if (flashClock) {
    const digits = flashClock.querySelectorAll('[data-flash-digit]');
    const end = Number(flashClock.dataset.flashEnd);
    function updateClock() {
        const seconds = Math.max(0, end - Math.floor(Date.now() / 1000));
        const parts = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60];
        digits.forEach((digit, index) => { digit.textContent = String(parts[index]).padStart(2, '0'); });
    }
    updateClock();
    setInterval(updateClock, 1000);
}

const hero = document.querySelector('[data-hero-slider]');
if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    function showSlide(index) {
        slides[current].hidden = true;
        dots[current].setAttribute('aria-pressed', 'false');
        current = (index + slides.length) % slides.length;
        slides[current].hidden = false;
        dots[current].setAttribute('aria-pressed', 'true');
    }
    for (const button of hero.querySelectorAll('[data-hero-step]')) {
        button.addEventListener('click', () => showSlide(current + Number(button.dataset.heroStep)));
    }
    dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
    if (!motion.matches) setInterval(() => {
        if (!document.hidden && !hero.matches(':hover, :focus-within')) showSlide(current + 1);
    }, 5000);
}

const showcase = document.querySelector('[data-showcase]');
if (showcase && !motion.matches) {
    const slides = Array.from(showcase.querySelectorAll('img'));
    let index = 0;
    setInterval(() => {
        if (document.hidden) return;
        slides[index].hidden = true;
        index = (index + 1) % slides.length;
        slides[index].hidden = false;
    }, 2000);
}

const promo = document.querySelector('[data-promo]');
if (promo && !motion.matches) {
    const video = promo.querySelector('video');
    const key = 'sachhay-promo-dismissed-at';
    let closedAt = 0;
    try { closedAt = Number(localStorage.getItem(key)); } catch {}
    if (Date.now() - closedAt >= 86400000) {
        video.src = video.dataset.src;
        promo.showModal();
        promo.querySelector('[data-close-promo]').addEventListener('click', () => promo.close());
        promo.addEventListener('click', event => { if (event.target === promo) promo.close(); });
        promo.addEventListener('close', () => {
            video.pause();
            try { localStorage.setItem(key, String(Date.now())); } catch {}
        });
    }
}

for (const payment of document.querySelectorAll('[data-payment-url]')) {
    async function poll() {
        try {
            const response = await fetch(payment.dataset.paymentUrl, {
                headers: {'X-SachHay-Payment-Token': payment.dataset.paymentToken},
                cache: 'no-store',
            });
            if (response.ok && (await response.json()).status !== 'pending') {
                location.reload();
                return;
            }
        } catch {}
        setTimeout(poll, 5000);
    }
    setTimeout(poll, 5000);
}


// ==========================================================================
// AJAX ADD TO CART HANDLER
// ==========================================================================
document.addEventListener('submit', async event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const actionInput = form.querySelector('input[name="action"]');
    if (!actionInput || actionInput.value !== 'add') return;

    const formAction = form.getAttribute('action') || '';
    if (!formAction.endsWith('/cart')) return;

    event.preventDefault();
    const button = form.querySelector('button');
    const originalText = button ? button.innerHTML : '';
    if (button) button.disabled = true;

    try {
        const formData = new FormData(form);
        const response = await fetch('/cart', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không thể thêm vào giỏ hàng.');

        // 1. Update header cart badge
        const badges = document.querySelectorAll('[data-cart-badge]');
        badges.forEach(badge => {
            badge.textContent = data.cartCount || 0;
            if (data.cartCount > 0) {
                badge.style.display = 'flex';
                badge.classList.remove('badge-pop');
                void badge.offsetWidth;
                badge.classList.add('badge-pop');
            } else {
                badge.style.display = 'none';
            }
        });

        // 2. Temporary button success state
        if (button) {
            button.classList.add('added');
            button.innerHTML = '✓ Đã thêm';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('added');
                button.disabled = false;
            }, 1200);
        }

        // 3. Floating toast notification
        showToast(data.message || 'Đã thêm sản phẩm vào giỏ hàng!');
    } catch (err) {
        alert(err.message || 'Lỗi thêm vào giỏ hàng');
        if (button) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }
});

function showToast(text) {
    let toast = document.getElementById('sachhay-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'sachhay-toast';
        toast.className = 'sachhay-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = '<span class="toast-icon">✓</span> <span>' + text + '</span>';
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}


// ==========================================================================
// NOTIFICATION DROPDOWN POPUP
// ==========================================================================
(function() {
    function initNotif() {
        const box = document.getElementById('notification-box');
        const btn = document.getElementById('notif-bell-btn');
        const pop = document.getElementById('notif-popover');
        if (!box || !btn || !pop) return;

        // Toggle popover
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = pop.hasAttribute('hidden');
            if (isHidden) {
                pop.removeAttribute('hidden');
                btn.setAttribute('aria-expanded', 'true');
            } else {
                pop.setAttribute('hidden', '');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!box.contains(e.target)) {
                pop.setAttribute('hidden', '');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !pop.hasAttribute('hidden')) {
                pop.setAttribute('hidden', '');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        // Restore read state from localStorage
        try {
            const readNotifs = JSON.parse(localStorage.getItem('sachhay_read_notifs') || '[]');
            if (readNotifs && readNotifs.length > 0) {
                readNotifs.forEach(id => {
                    const item = pop.querySelector('[data-id="' + id + '"]');
                    if (item) {
                        item.classList.remove('unread');
                        const dot = item.querySelector('.notif-dot');
                        if (dot) dot.remove();
                    }
                });
                updateNotifBadge();
            }
        } catch (e) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNotif);
    } else {
        initNotif();
    }
})();

function markSingleNotifRead(item) {
    if (item.classList.contains('unread')) {
        item.classList.remove('unread');
        const dot = item.querySelector('.notif-dot');
        if (dot) dot.remove();

        const id = item.dataset.id;
        if (id) {
            try {
                const readNotifs = JSON.parse(localStorage.getItem('sachhay_read_notifs') || '[]');
                if (!readNotifs.includes(id)) {
                    readNotifs.push(id);
                    localStorage.setItem('sachhay_read_notifs', JSON.stringify(readNotifs));
                }
            } catch (e) {}
        }
        updateNotifBadge();
    }
}

function markAllNotifsRead(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const items = document.querySelectorAll('.notif-item');
    const ids = [];
    items.forEach(item => {
        item.classList.remove('unread');
        const dot = item.querySelector('.notif-dot');
        if (dot) dot.remove();
        if (item.dataset.id) ids.push(item.dataset.id);
    });
    try {
        localStorage.setItem('sachhay_read_notifs', JSON.stringify(ids));
    } catch (e) {}
    updateNotifBadge();
}

function updateNotifBadge() {
    const unread = document.querySelectorAll('.notif-item.unread').length;
    const badge = document.getElementById('notif-badge-dot');
    const tag = document.getElementById('notif-unread-tag');
    if (badge) {
        if (unread > 0) {
            badge.textContent = unread;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
    if (tag) {
        tag.textContent = unread > 0 ? (unread + ' mới') : '0 mới';
        if (unread === 0) {
            tag.style.background = '#e5e7eb';
            tag.style.color = '#6b7280';
        }
    }
}

function filterNotifCategory(cat, btn) {
    const chips = document.querySelectorAll('.ntab-chip');
    chips.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');

    const items = document.querySelectorAll('.notif-item');
    items.forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}
