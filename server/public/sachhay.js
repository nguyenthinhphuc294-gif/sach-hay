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
