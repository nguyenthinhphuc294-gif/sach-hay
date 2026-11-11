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
