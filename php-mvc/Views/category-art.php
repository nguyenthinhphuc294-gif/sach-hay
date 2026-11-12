<?php
/**
 * Modern High-Detail 3D Vector Art Icons for Sách Hay Categories
 * Crafted for vibrant aesthetics, clear visual storytelling, and rich depth
 */
$catKey = $catKey ?? ($icon ?? '');
?>
<?php if ($catKey === 'van-hoc' || $catKey === 'book_vh'): ?>
<!-- 1. VĂN HỌC (Literature): Cuốn sách tinh hoa mở ra, ruy-băng đỏ ruby, sao hoàng kim -->
<svg class="cat-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vh-cover" x1="8" y1="12" x2="56" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="vh-pages" x1="12" y1="14" x2="52" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="vh-ribbon" x1="32" y1="18" x2="38" y2="46" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
    <linearGradient id="vh-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="vh-shadow" x="-10%" y="-10%" width="125%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#1e3a8a" flood-opacity="0.25"/>
    </filter>
  </defs>
  <path d="M10 44c6-2 15-2 22 2 7-4 16-4 22-2v-26c-6-2-15-2-22 2-7-4-16-4-22-2z" fill="url(#vh-cover)" filter="url(#vh-shadow)"/>
  <path d="M10 44v3c6-2 15-2 22 2 7-4 16-4 22-2v-3c-6-2-15-2-22 2-7-4-16-4-22-2z" fill="#1e3a8a"/>
  <path d="M12 41c6-2 14-2 20 2V18c-6-2-14-2-20 2z" fill="url(#vh-pages)"/>
  <path d="M32 43c6-4 14-4 20-2V18c-6-2-14-2-20 2z" fill="#f8fafc"/>
  <path d="M16 25h12M16 30h10M16 35h8M36 25h12M36 30h12M36 35h10" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M31.5 18v25h1V18z" fill="#cbd5e1"/>
  <path d="M30 17v22l3.5-3 3.5 3V17z" fill="url(#vh-ribbon)"/>
  <path d="M49 10l1.2 2.5L53 13.7l-2.1 2 .5 2.8-2.4-1.3-2.4 1.3.5-2.8-2.1-2 2.8-1.2z" fill="url(#vh-gold)"/>
  <circle cx="14" cy="14" r="1.5" fill="#fde047"/>
</svg>

<?php elseif ($catKey === 'kinh-te' || $catKey === 'trending'): ?>
<!-- 2. KINH TẾ (Economics): Biểu đồ cột 3D tăng trưởng bứt phá, mũi tên xanh ngọc, đồng xu vàng -->
<svg class="cat-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="kt-bar1" x1="12" y1="36" x2="20" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="kt-bar2" x1="24" y1="26" x2="32" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="kt-bar3" x1="36" y1="18" x2="44" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
    <linearGradient id="kt-arrow" x1="10" y1="38" x2="52" y2="12" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#6ee7b7"/>
    </linearGradient>
    <linearGradient id="kt-gold" x1="42" y1="8" x2="56" y2="22" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="kt-shadow" x="-10%" y="-10%" width="125%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#064e3b" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect x="8" y="50" width="48" height="4" rx="2" fill="#a7f3d0"/>
  <rect x="12" y="34" width="9" height="16" rx="3" fill="url(#kt-bar1)" filter="url(#kt-shadow)"/>
  <rect x="25" y="24" width="9" height="26" rx="3" fill="url(#kt-bar2)" filter="url(#kt-shadow)"/>
  <rect x="38" y="16" width="9" height="34" rx="3" fill="url(#kt-bar3)" filter="url(#kt-shadow)"/>
  <path d="M14 36h2v12h-2zM27 26h2v22h-2zM40 18h2v30h-2z" fill="#ffffff" opacity="0.4"/>
  <path d="M10 38l14-12 11 8 16-18" stroke="url(#kt-arrow)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M43 16h8v8" stroke="url(#kt-arrow)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <g filter="url(#kt-shadow)">
    <circle cx="50" cy="14" r="8" fill="url(#kt-gold)"/>
    <circle cx="50" cy="14" r="6.2" fill="#fbbf24"/>
    <text x="50" y="17.5" font-size="9" font-weight="900" fill="#78350f" text-anchor="middle" font-family="sans-serif">₫</text>
  </g>
</svg>

<?php elseif ($catKey === 'ky-nang-song' || $catKey === 'smile'): ?>
<!-- 3. KỸ NĂNG SỐNG (Life Skills): Bóng đèn trí tuệ phát sáng, trái tim khai phóng tâm hồn -->
<svg class="cat-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="kn-bulb" x1="18" y1="10" x2="46" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="kn-heart" x1="26" y1="20" x2="38" y2="32" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <linearGradient id="kn-base" x1="26" y1="44" x2="38" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <filter id="kn-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#f59e0b" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M32 6v4M16 14l3 3M48 14l-3 3M10 28h4M50 28h4" stroke="#f59e0b" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M22 36c-4-4-6-9-6-14 0-8.8 7.2-16 16-16s16 7.2 16 16c0 5-2 10-6 14-2 2-3 4-3 7H25c0-3-1-5-3-7z" fill="url(#kn-bulb)" filter="url(#kn-glow)"/>
  <path d="M24 16c3-3 7-4 12-4" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
  <path d="M32 30s-6-3.5-6-7.5c0-2.2 1.8-4 4-4 1.5 0 2.8.8 3.5 2 .7-1.2 2-2 3.5-2 2.2 0 4 1.8 4 4 0 4-6 7.5-6 7.5z" fill="url(#kn-heart)"/>
  <rect x="25" y="44" width="14" height="3" rx="1.5" fill="url(#kn-base)"/>
  <rect x="26" y="48" width="12" height="3" rx="1.5" fill="url(#kn-base)"/>
  <path d="M28 52h8c0 2-1.8 3.5-4 3.5s-4-1.5-4-3.5z" fill="#475569"/>
</svg>

<?php elseif ($catKey === 'truyen-tranh' || $catKey === 'layers'): ?>
<!-- 4. TRUYỆN TRANH (Manga & Comics): Khung thoại manga bùng nổ năng lượng, ngôi sao năng động -->
<svg class="cat-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tt-bubble" x1="12" y1="8" x2="52" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <linearGradient id="tt-inner" x1="16" y1="12" x2="48" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#fff1f2"/>
    </linearGradient>
    <filter id="tt-shadow" x="-10%" y="-10%" width="125%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#be185d" flood-opacity="0.3"/>
    </filter>
  </defs>
  <path d="M32 8c12 0 22 8 22 18 0 6-4 12-11 15l4 9-11-5c-1.3.3-2.6.4-4 .4-12 0-22-8-22-18s10-18 22-18z" fill="url(#tt-bubble)" filter="url(#tt-shadow)"/>
  <path d="M32 11c10.5 0 19 7 19 15.5 0 5.2-3.5 10.3-9.5 12.9l3.5 7.8-9.6-4.3c-1.1.2-2.3.3-3.4.3-10.5 0-19-7-19-15.5S21.5 11 32 11z" fill="url(#tt-inner)"/>
  <path d="M32 17l2.5 5 5.5 1-4 4 1 5.5-5-2.5-5 2.5 1-5.5-4-4 5.5-1z" fill="#ec4899"/>
  <circle cx="21" cy="23" r="1.8" fill="#f43f5e"/>
  <circle cx="43" cy="23" r="1.8" fill="#f43f5e"/>
  <path d="M26 31q6 4 12 0" stroke="#be185d" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M52 10l1.2 2.5 2.8.5-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.5z" fill="#facc15"/>
</svg>

<?php elseif ($catKey === 'thieu-nhi' || $catKey === 'sparkles'): ?>
<!-- 5. THIẾU NHI (Children's Books): Khinh khí cầu sắc màu mơ ước, bồng bềnh mây trắng -->
<svg class="cat-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tn-balloon1" x1="18" y1="8" x2="46" y2="38" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
    <linearGradient id="tn-balloon2" x1="26" y1="8" x2="38" y2="38" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
    <linearGradient id="tn-basket" x1="28" y1="44" x2="36" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <filter id="tn-shadow" x="-10%" y="-10%" width="125%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#b45309" flood-opacity="0.25"/>
    </filter>
  </defs>
  <path d="M12 52c-2.2 0-4-1.8-4-4 0-2 1.5-3.7 3.5-4 1-3.5 4.2-6 8-6 3.2 0 6 1.8 7.2 4.6 1.4-.4 2.8-.2 3.8.6 1.5-1.4 3.5-2.2 5.5-2.2 4.4 0 8 3.6 8 8 0 .4 0 .7-.1 1.1 2.3.8 3.9 3 3.9 5.6 0 3.3-2.7 6-6 6H12z" fill="#ffffff" opacity="0.95"/>
  <g filter="url(#tn-shadow)">
    <path d="M32 8c-9 0-16 7-16 16 0 7 6 12 11 16h10c5-4 11-9 11-16 0-9-7-16-16-16z" fill="url(#tn-balloon1)"/>
    <path d="M32 8c-4.5 0-8 7-8 16 0 7 3 12 5.5 16h5c2.5-4 5.5-9 5.5-16 0-9-3.5-16-8-16z" fill="url(#tn-balloon2)"/>
    <path d="M21 13c-3 3-5 7-5 11 0 5 3 9 7 13-2-3-4-7-4-11 0-5 2-9 4-13h-2z" fill="#06b6d4"/>
    <path d="M43 13c3 3 5 7 5 11 0 5-3 9-7 13 2-3 4-7 4-11 0-5-2-9-4-13h2z" fill="#06b6d4"/>
  </g>
  <path d="M27 40l1 5M37 40l-1 5" stroke="#78350f" stroke-width="1.8"/>
  <rect x="27" y="45" width="10" height="7" rx="2" fill="url(#tn-basket)"/>
  <path d="M48 8l1 2 2.2.4-1.6 1.6.4 2.2L48 13l-2 1.2.4-2.2-1.6-1.6 2.2-.4z" fill="#fbbf24"/>
  <circle cx="14" cy="18" r="1.8" fill="#facc15"/>
</svg>

<?php elseif ($catKey === 'giao-khoa' || $catKey === 'book_gk'): ?>
<!-- 6. GIÁO KHOA (Textbooks): Mũ cử nhân tốt nghiệp vinh danh, văn bằng danh dự thắt nơ đỏ -->
<svg class="cat-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gk-cap" x1="10" y1="18" x2="54" y2="38" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="gk-gold" x1="32" y1="20" x2="52" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="gk-scroll" x1="14" y1="42" x2="50" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <filter id="gk-shadow" x="-10%" y="-10%" width="125%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#0f172a" flood-opacity="0.3"/>
    </filter>
  </defs>
  <g filter="url(#gk-shadow)">
    <rect x="15" y="44" width="34" height="8" rx="4" fill="url(#gk-scroll)"/>
    <rect x="29" y="43" width="6" height="10" rx="1.5" fill="#ef4444"/>
    <path d="M29 53l3-2 3 2v4l-3-1.5-3 1.5z" fill="#dc2626"/>
  </g>
  <path d="M22 28v6c0 4.4 4.5 8 10 8s10-3.6 10-8v-6" fill="#1e3a8a" filter="url(#gk-shadow)"/>
  <path d="M32 14l22 9-22 9-22-9z" fill="url(#gk-cap)" filter="url(#gk-shadow)"/>
  <path d="M32 14l22 9-22 9" stroke="#475569" stroke-width="1.2" opacity="0.6"/>
  <circle cx="32" cy="23" r="2.5" fill="url(#gk-gold)"/>
  <path d="M32 23q12 4 15 12" stroke="url(#gk-gold)" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="44.5" y="34" width="5.5" height="8" rx="2" fill="url(#gk-gold)"/>
  <path d="M44.5 41h5.5" stroke="#92400e" stroke-width="1.5"/>
</svg>

<?php elseif ($catKey === 'ngoai-van' || $catKey === 'globe'): ?>
<!-- 7. NGOẠI VĂN (Foreign Literature): Quả địa cầu 3D đa sắc, quỹ đạo ngôn ngữ thế giới A - 文 -->
<svg class="cat-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="nv-ocean" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="nv-land" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="nv-orbit" x1="6" y1="16" x2="58" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="nv-shadow" x="-10%" y="-10%" width="125%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0369a1" flood-opacity="0.3"/>
    </filter>
  </defs>
  <circle cx="32" cy="32" r="18" fill="url(#nv-ocean)" filter="url(#nv-shadow)"/>
  <g clip-path="url(#nv-clip)">
    <clipPath id="nv-clip">
      <circle cx="32" cy="32" r="18"/>
    </clipPath>
    <path d="M22 20c2-3 6-2 8 0 2 2 1 5-1 7-3 2-2 6-5 7-3 1-4-2-4-5s0-7 2-9z" fill="url(#nv-land)"/>
    <path d="M36 22c4-2 9-1 10 3 1 3-2 5-4 7s-1 5-4 5-3-3-3-6 0-7 1-9z" fill="url(#nv-land)"/>
    <path d="M26 38c2-1 5 0 6 2s1 5-2 6-5 0-5-3 0-4 1-5z" fill="url(#nv-land)"/>
    <path d="M38 36c3 0 5 2 5 4s-2 4-5 4-4-2-4-4 2-4 4-4z" fill="url(#nv-land)"/>
    <path d="M18 20a16 16 0 0 1 20-5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
  </g>
  <path d="M10 38c6 8 26 12 38 4 6-4 8-10 4-13-4-3-12-1-20 4" stroke="url(#nv-orbit)" stroke-width="3" stroke-linecap="round"/>
  <g filter="url(#nv-shadow)">
    <circle cx="49" cy="18" r="6" fill="#ffffff"/>
    <circle cx="49" cy="18" r="6" stroke="#0284c7" stroke-width="1.2"/>
    <text x="49" y="21.5" font-size="7.5" font-weight="900" fill="#0284c7" text-anchor="middle" font-family="sans-serif">A</text>
  </g>
</svg>

<?php else: ?>
<!-- 8. VĂN PHÒNG PHẨM (Stationery): Cặp bút chì gỗ & bút máy nghệ thuật sắc màu -->
<svg class="cat-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vp-pencil" x1="16" y1="12" x2="32" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <linearGradient id="vp-brush" x1="36" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="vp-eraser" x1="16" y1="46" x2="22" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>
    <filter id="vp-shadow" x="-10%" y="-10%" width="125%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#312e81" flood-opacity="0.25"/>
    </filter>
  </defs>
  <g filter="url(#vp-shadow)" transform="rotate(-28 32 32)">
    <rect x="28" y="14" width="8" height="28" fill="url(#vp-pencil)"/>
    <path d="M30 14h1.5v28H30z" fill="#fde047"/>
    <rect x="28" y="42" width="8" height="4" fill="#cbd5e1"/>
    <path d="M28 46h8v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" fill="url(#vp-eraser)"/>
    <path d="M28 14l4-8 4 8z" fill="#fed7aa"/>
    <path d="M30 10l2-4 2 4z" fill="#1e293b"/>
  </g>
  <g filter="url(#vp-shadow)" transform="rotate(28 32 32)">
    <rect x="28" y="18" width="8" height="28" rx="2" fill="url(#vp-brush)"/>
    <rect x="28" y="15" width="8" height="3" fill="#fbbf24"/>
    <path d="M28 15l4-7 4 7z" fill="#f59e0b"/>
    <path d="M31.5 15v-4" stroke="#78350f" stroke-width="1"/>
  </g>
  <circle cx="16" cy="18" r="3" fill="#ec4899"/>
  <circle cx="48" cy="18" r="2.5" fill="#3b82f6"/>
  <circle cx="50" cy="46" r="2" fill="#10b981"/>
</svg>
<?php endif; ?>
