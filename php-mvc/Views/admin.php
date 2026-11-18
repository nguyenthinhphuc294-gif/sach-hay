<?php
/**
 * Giao diện Quản trị Doanh Nghiệp (Enterprise Admin Dashboard) - Sách Hay
 * Module Báo Cáo Doanh Thu Bán Hàng & Phân Tích Dòng Tiền Đẳng Cấp Cao
 */
$e = static fn(mixed $value): string => htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$money = static fn(mixed $value): string => number_format((int) ($value ?? 0), 0, ',', '.') . ' ₫';
$statusNames = [
    'pending' => 'Chờ xác nhận',
    'confirmed' => 'Đã xác nhận',
    'processing' => 'Đang chuẩn bị',
    'shipping' => 'Đang giao',
    'completed' => 'Hoàn thành',
    'cancelled' => 'Đã hủy'
];

$totalBooks = count($books);
$inStockBooks = 0;
$lowStockBooks = 0;
$outOfStockBooks = 0;
$categoriesList = [];
$catCounts = [];

foreach ($books as $b) {
    $st = (int) ($b['stock'] ?? 0);
    if ($st <= 0) {
        $outOfStockBooks++;
    } elseif ($st <= 10) {
        $lowStockBooks++;
    } else {
        $inStockBooks++;
    }
    $cat = trim($b['categoryName'] ?? '');
    if ($cat !== '') {
        if (!in_array($cat, $categoriesList, true)) {
            $categoriesList[] = $cat;
        }
        $catCounts[$cat] = ($catCounts[$cat] ?? 0) + 1;
    }
}
sort($categoriesList);
arsort($catCounts);

// Dữ liệu tài chính & chỉ số doanh thu
$completedCount = (int) ($stats['completedCount'] ?? 0);
$completedRevenue = (int) ($stats['revenue'] ?? 0);
$pendingRevenue = (int) ($stats['pendingRevenue'] ?? 0);
$totalOrdersCount = (int) ($stats['total'] ?? 0);
$aov = $completedCount > 0 ? (int) round($completedRevenue / $completedCount) : 0;
$successRate = $totalOrdersCount > 0 ? round(($completedCount / $totalOrdersCount) * 100, 1) : 0;

$bankRevenue = (int) ($stats['bankRevenue'] ?? 0);
$codRevenue = (int) ($stats['codRevenue'] ?? 0);
$storeRevenue = (int) ($stats['storeRevenue'] ?? 0);
$totalPaidRevenue = max(1, $bankRevenue + $codRevenue + $storeRevenue);

$bankPct = round(($bankRevenue / $totalPaidRevenue) * 100);
$codPct = round(($codRevenue / $totalPaidRevenue) * 100);
$storePct = 100 - $bankPct - $codPct;
if ($storePct < 0) $storePct = 0;

// Shorthand doanh thu cho sidebar badge (ví dụ: 1.45 tr)
$sidebarRevText = ($completedRevenue >= 1000000) 
    ? number_format($completedRevenue / 1000000, 2, ',', '.') . ' tr' 
    : number_format($completedRevenue / 1000, 0, ',', '.') . 'k';
?>

<style>
/* ==========================================================================
   ENTERPRISE ADMIN DASHBOARD - CORE STYLES
   ========================================================================== */
*, *::before, *::after {
    box-sizing: border-box;
}

body.admin-app-body {
    margin: 0;
    padding: 0;
    background-color: #f8fafc;
    color: #0f172a;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
}

.admin-layout-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
}

/* ==========================================================================
   1. FIXED SIDEBAR NAVIGATION (LEFT COLUMN)
   ========================================================================== */
.admin-sidebar {
    width: 260px;
    min-width: 260px;
    background: #090d16;
    color: #94a3b8;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    border-right: 1px solid #1e293b;
    z-index: 100;
    user-select: none;
}

.sidebar-brand-box {
    padding: 1.25rem 1.25rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid #1e293b;
}

.sidebar-brand-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
    box-shadow: 0 4px 10px rgba(220, 38, 38, 0.35);
    flex-shrink: 0;
}

.sidebar-brand-text {
    line-height: 1.2;
}

.sidebar-brand-name {
    font-size: 1.15rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
}

.sidebar-brand-name em {
    color: #ef4444;
    font-style: normal;
}

.sidebar-brand-tag {
    font-size: 0.68rem;
    font-weight: 700;
    color: #ef4444;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    display: block;
    margin-top: 2px;
}

/* Sidebar Menu Navigation */
.sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.sidebar-section-title {
    font-size: 0.68rem;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
    padding: 0.85rem 0.6rem 0.35rem;
}

.sidebar-item-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.65rem 0.85rem;
    font-size: 0.88rem;
    font-weight: 600;
    color: #94a3b8;
    background: transparent;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    text-decoration: none;
}

.sidebar-item-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
}

.sidebar-item-icon {
    font-size: 1.15rem;
    width: 22px;
    text-align: center;
}

.sidebar-item-btn:hover {
    color: #ffffff;
    background: #1e293b;
}

.sidebar-item-btn.active {
    color: #ffffff;
    background: #dc2626;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.sidebar-badge {
    font-size: 0.72rem;
    font-weight: 750;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: #1e293b;
    color: #cbd5e1;
    white-space: nowrap;
}

.sidebar-item-btn.active .sidebar-badge {
    background: rgba(255, 255, 255, 0.25);
    color: #ffffff;
}

.sidebar-badge.urgent {
    background: #f59e0b;
    color: #ffffff;
}

/* Badge Doanh Thu gọn gàng không bao giờ bị rớt dòng */
.sidebar-badge.revenue-badge {
    background: #15803d;
    color: #ffffff;
    font-weight: 750;
    font-size: 0.72rem;
    white-space: nowrap;
    line-height: 1.2;
    padding: 0.15rem 0.55rem;
}

/* Sidebar Footer & User Profile */
.sidebar-footer {
    padding: 1rem 0.85rem;
    border-top: 1px solid #1e293b;
    background: #090d16;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.btn-visit-store {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    width: 100%;
    padding: 0.55rem;
    font-size: 0.82rem;
    font-weight: 650;
    color: #e2e8f0;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.15s ease;
}

.btn-visit-store:hover {
    background: #334155;
    color: #ffffff;
}

.sidebar-user-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.45rem 0.5rem;
    background: #0f172a;
    border-radius: 10px;
    border: 1px solid #1e293b;
}

.sidebar-user-avatar {
    width: 32px;
    height: 32px;
    background: #dc2626;
    color: #ffffff;
    font-size: 0.78rem;
    font-weight: 800;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sidebar-user-info {
    flex: 1;
    margin-left: 0.55rem;
    line-height: 1.2;
}

.sidebar-user-name {
    font-size: 0.82rem;
    font-weight: 750;
    color: #f8fafc;
    display: block;
}

.sidebar-user-role {
    font-size: 0.7rem;
    color: #64748b;
    display: block;
}

.btn-sidebar-logout {
    background: transparent;
    border: none;
    color: #ef4444;
    cursor: pointer;
    padding: 0.35rem 0.45rem;
    border-radius: 6px;
    font-size: 1.1rem;
    line-height: 1;
    transition: all 0.15s ease;
}

.btn-sidebar-logout:hover {
    background: rgba(239, 68, 68, 0.15);
}

/* ==========================================================================
   2. MAIN CONTENT AREA (RIGHT COLUMN)
   ========================================================================== */
.admin-main-viewport {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: #f8fafc;
}

/* Topbar */
.admin-topbar {
    height: 64px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.75rem;
    position: sticky;
    top: 0;
    z-index: 90;
    box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.topbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.topbar-page-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.01em;
    margin: 0;
}

.topbar-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.65rem;
    font-size: 0.75rem;
    font-weight: 650;
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
    border-radius: 999px;
}

.status-dot-pulse {
    width: 7px;
    height: 7px;
    background: #22c55e;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
}

.topbar-right {
    display: flex;
    align-items: center;
    gap: 0.85rem;
}

.btn-topbar-action {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 1.1rem;
    font-size: 0.86rem;
    font-weight: 700;
    color: #ffffff;
    background: #dc2626;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.25);
    transition: all 0.15s ease;
}

.btn-topbar-action:hover {
    background: #b91c1c;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

/* Page Body Content */
.admin-page-content {
    flex: 1;
    padding: 1.75rem;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
}

.admin-alert-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1.25rem;
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
    border-radius: 10px;
    font-weight: 650;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
}

/* Section Panes (Toggled by Sidebar) */
.admin-view-pane {
    display: none;
}

.admin-view-pane.active {
    display: block;
    animation: fadeInView 0.15s ease-out;
}

@keyframes fadeInView {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Card Container Styles */
.dash-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.35rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
}

.dash-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 0.85rem;
    margin-bottom: 1.15rem;
    border-bottom: 1px solid #f1f5f9;
}

.dash-card-title {
    font-size: 1.05rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.dash-card-action-link {
    font-size: 0.84rem;
    font-weight: 650;
    color: #dc2626;
    text-decoration: none;
}

.dash-card-action-link:hover {
    text-decoration: underline;
}

/* 4 Metrics KPI Grid */
.dash-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.15rem;
    margin-bottom: 1.5rem;
}

@media (max-width: 1100px) {
    .dash-kpi-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
@media (max-width: 600px) {
    .dash-kpi-grid {
        grid-template-columns: 1fr;
    }
}

.kpi-stat-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
}

.kpi-stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.kpi-stat-label {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-bottom: 0.4rem;
    display: block;
}

.kpi-stat-value {
    font-size: 1.75rem;
    font-weight: 850;
    color: #0f172a;
    line-height: 1.1;
    display: block;
}

.kpi-stat-desc {
    font-size: 0.76rem;
    color: #64748b;
    margin-top: 0.45rem;
    display: block;
}

.kpi-icon-pill {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.35rem;
    flex-shrink: 0;
}

.kpi-blue { background: #e0f2fe; color: #0284c7; }
.kpi-amber { background: #fef3c7; color: #d97706; }
.kpi-green { background: #dcfce7; color: #16a34a; }
.kpi-purple { background: #f3e8ff; color: #7e22ce; }

/* Dashboard 2 Columns Grid */
.dash-two-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
}

@media (max-width: 960px) {
    .dash-two-cols {
        grid-template-columns: 1fr;
    }
}

.cat-progress-item {
    margin-bottom: 0.85rem;
}

.cat-progress-head {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    font-weight: 650;
    margin-bottom: 0.3rem;
    color: #334155;
}

.cat-progress-track {
    height: 8px;
    background: #f1f5f9;
    border-radius: 999px;
    overflow: hidden;
}

.cat-progress-fill {
    height: 100%;
    background: #dc2626;
    border-radius: 999px;
}

/* ==========================================================================
   3. REVENUE MODULE REDESIGN (GIAO DIỆN BÁO CÁO DOANH THU ĐẲNG CẤP CAO)
   ========================================================================== */
.rev-hero-banner {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-radius: 16px;
    padding: 1.5rem 1.75rem;
    margin-bottom: 1.5rem;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.25rem;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.rev-hero-title-box {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.rev-tag-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.6rem;
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border: 1px solid rgba(74, 222, 128, 0.3);
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    width: fit-content;
}

.rev-hero-title {
    font-size: 1.45rem;
    font-weight: 850;
    margin: 0;
    letter-spacing: -0.02em;
}

.rev-hero-desc {
    font-size: 0.85rem;
    color: #94a3b8;
    margin: 0;
}

.rev-hero-controls {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: wrap;
}

.btn-rev-export {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 1.05rem;
    background: #15803d;
    color: #ffffff;
    font-size: 0.84rem;
    font-weight: 700;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(21, 128, 61, 0.3);
    transition: all 0.15s ease;
}

.btn-rev-export:hover {
    background: #166534;
    transform: translateY(-1px);
}

.btn-rev-print {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 0.95rem;
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
    font-size: 0.84rem;
    font-weight: 650;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-rev-print:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Financial Metric Cards */
.fin-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.25rem 1.35rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.65rem;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.fin-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.07);
}

.fin-head-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.fin-title {
    font-size: 0.76rem;
    font-weight: 750;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
}

.fin-badge-trend {
    font-size: 0.7rem;
    font-weight: 750;
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
}

.trend-up { background: #dcfce7; color: #15803d; }
.trend-wait { background: #fef3c7; color: #b45309; }
.trend-stat { background: #e0f2fe; color: #0369a1; }

.fin-amount {
    font-size: 1.85rem;
    font-weight: 850;
    color: #0f172a;
    line-height: 1.1;
    letter-spacing: -0.02em;
}

.fin-footer-meta {
    font-size: 0.76rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

/* Revenue Split Layout (Chart & Donut) */
.rev-split-layout {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
}

@media (max-width: 980px) {
    .rev-split-layout {
        grid-template-columns: 1fr;
    }
}

/* Chart Canvas Card */
.chart-card-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.35rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
}

.chart-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
}

.chart-title-left h3 {
    margin: 0 0 0.2rem;
    font-size: 1.05rem;
    font-weight: 800;
    color: #0f172a;
}

.chart-title-left span {
    font-size: 0.78rem;
    color: #64748b;
}

/* Professional SVG Bar & Line Canvas */
.rev-svg-container {
    width: 100%;
    height: 220px;
    display: flex;
    align-items: flex-end;
    position: relative;
    padding: 0.5rem 0.5rem 2rem 2.5rem;
    box-sizing: border-box;
}

.rev-grid-line {
    position: absolute;
    left: 2.5rem;
    right: 0.5rem;
    border-top: 1px dashed #e2e8f0;
    display: flex;
    align-items: center;
}

.rev-grid-label {
    position: absolute;
    left: -2.4rem;
    font-size: 0.68rem;
    font-weight: 600;
    color: #94a3b8;
}

.rev-bars-track {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    z-index: 2;
    gap: 0.75rem;
}

.rev-bar-column {
    flex: 1;
    max-width: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    position: relative;
}

.rev-bar-fill {
    width: 100%;
    background: linear-gradient(180deg, #dc2626 0%, #ef4444 100%);
    border-radius: 8px 8px 0 0;
    box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.25);
    transition: all 0.2s ease;
    cursor: pointer;
}

.rev-bar-fill:hover {
    background: linear-gradient(180deg, #b91c1c 0%, #dc2626 100%);
    transform: scaleY(1.03);
    box-shadow: 0 6px 12px rgba(220, 38, 38, 0.35);
}

.rev-bar-tag {
    position: absolute;
    font-size: 0.72rem;
    font-weight: 800;
    color: #dc2626;
    top: -24px;
    white-space: nowrap;
}

.rev-bar-date {
    position: absolute;
    bottom: -1.75rem;
    font-size: 0.72rem;
    font-weight: 650;
    color: #64748b;
    white-space: nowrap;
}

/* Donut Chart & Payment Channel Breakdown */
.donut-card-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.35rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.donut-visual-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0.5rem 0;
}

.donut-center-info {
    position: absolute;
    text-align: center;
    line-height: 1.2;
}

.donut-center-info strong {
    font-size: 1.02rem;
    font-weight: 850;
    color: #0f172a;
    display: block;
    letter-spacing: -0.02em;
}

.donut-center-info span {
    font-size: 0.7rem;
    color: #64748b;
    text-transform: uppercase;
    font-weight: 600;
}

.payment-list-items {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    margin-top: 1rem;
}

.pay-item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.85rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.84rem;
}

.pay-item-left {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-weight: 650;
    color: #334155;
}

.pay-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.pay-dot-blue { background: #2563eb; }
.pay-dot-green { background: #16a34a; }
.pay-dot-amber { background: #d97706; }

.pay-item-right {
    text-align: right;
}

.pay-item-sum {
    font-weight: 800;
    color: #0f172a;
    display: block;
}

.pay-item-pct {
    font-size: 0.72rem;
    font-weight: 650;
    color: #64748b;
}

/* Category Contribution Horizontal Bars */
.cat-contrib-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 1.35rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 1.5rem;
}

.contrib-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 0.85rem;
}

@media (max-width: 768px) {
    .contrib-grid {
        grid-template-columns: 1fr;
    }
}

.contrib-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 0.85rem 1rem;
}

.contrib-box-head {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    font-weight: 700;
    color: #334155;
    margin-bottom: 0.35rem;
}

.contrib-box-bar {
    height: 6px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 0.35rem;
}

.contrib-box-fill {
    height: 100%;
    border-radius: 999px;
}

/* ==========================================================================
   4. DATA TABLES & FILTERS
   ========================================================================== */
.table-filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    background: #ffffff;
    padding: 0.85rem 1.15rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.filter-left-group {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: wrap;
    flex: 1;
}

.search-field-wrap {
    position: relative;
    min-width: 280px;
    flex: 1;
    max-width: 440px;
}

.search-field-wrap input {
    width: 100%;
    padding: 0.55rem 0.85rem 0.55rem 2.25rem;
    font-size: 0.88rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #f8fafc;
    box-sizing: border-box;
    transition: all 0.15s ease;
}

.search-field-wrap input:focus {
    outline: none;
    background: #ffffff;
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

.search-field-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 0.95rem;
    pointer-events: none;
}

.filter-select {
    padding: 0.55rem 0.85rem;
    font-size: 0.88rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #f8fafc;
    color: #0f172a;
    font-weight: 500;
    cursor: pointer;
    outline: none;
}

.filter-select:focus {
    background: #ffffff;
    border-color: #dc2626;
}

.data-table-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    overflow-x: auto;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.dash-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 0.88rem;
}

.dash-table th {
    background: #f8fafc;
    padding: 0.85rem 1rem;
    font-size: 0.78rem;
    font-weight: 750;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e2e8f0;
    white-space: nowrap;
}

.dash-table td {
    padding: 0.85rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
}

.dash-table tbody tr:hover {
    background: #fafafc;
}

.dash-table tbody tr:last-child td {
    border-bottom: none;
}

.thumb-preview-img {
    width: 48px;
    height: 64px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    display: block;
    background: #f1f5f9;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}

.book-title-cell a {
    font-weight: 750;
    color: #0f172a;
    text-decoration: none;
    line-height: 1.3;
    display: inline-block;
    margin-bottom: 0.2rem;
}

.book-title-cell a:hover {
    color: #dc2626;
}

.book-sub-meta {
    font-size: 0.78rem;
    color: #64748b;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    align-items: center;
}

.book-sub-meta span:not(:last-child)::after {
    content: "•";
    margin-left: 0.35rem;
    color: #cbd5e1;
}

.cat-pill {
    display: inline-block;
    padding: 0.2rem 0.55rem;
    font-size: 0.75rem;
    font-weight: 650;
    border-radius: 999px;
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
    white-space: nowrap;
}

.stock-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.22rem 0.6rem;
    font-size: 0.76rem;
    font-weight: 700;
    border-radius: 6px;
    white-space: nowrap;
}

.stock-tag.good { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.stock-tag.warn { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.stock-tag.danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.btn-mini-edit {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.35rem 0.65rem;
    font-size: 0.8rem;
    font-weight: 650;
    color: #1d4ed8;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    cursor: pointer;
}

.btn-mini-edit:hover { background: #dbeafe; }

.btn-mini-delete {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.35rem 0.65rem;
    font-size: 0.8rem;
    font-weight: 650;
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    cursor: pointer;
}

.btn-mini-delete:hover { background: #fee2e2; }

/* ==========================================================================
   5. MODAL DIALOGS
   ========================================================================== */
.admin-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    box-sizing: border-box;
}

.admin-modal-overlay.active {
    display: flex;
}

.admin-modal-box {
    background: #ffffff;
    border-radius: 16px;
    width: 100%;
    max-width: 780px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
    border: 1px solid #e2e8f0;
    animation: zoomModal 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes zoomModal {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-head {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: #ffffff;
    z-index: 10;
}

.modal-head h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
}

.modal-btn-close {
    background: #f1f5f9;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    cursor: pointer;
    color: #64748b;
}

.modal-btn-close:hover {
    background: #e2e8f0;
    color: #0f172a;
}

.modal-form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem 1.25rem;
    padding: 1.5rem;
}

.modal-form-grid .span-2 {
    grid-column: span 2;
}

.modal-form-grid .span-third {
    grid-column: span 1;
}

@media (max-width: 600px) {
    .modal-form-grid {
        grid-template-columns: 1fr;
    }
    .modal-form-grid .span-2, .modal-form-grid .span-third {
        grid-column: span 1;
    }
}

.form-group-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.form-group-field label {
    font-size: 0.84rem;
    font-weight: 700;
    color: #334155;
}

.form-group-field input, .form-group-field select, .form-group-field textarea {
    width: 100%;
    padding: 0.6rem 0.85rem;
    font-size: 0.9rem;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #f8fafc;
    box-sizing: border-box;
    font-family: inherit;
    transition: all 0.15s ease;
}

.form-group-field input:focus, .form-group-field select:focus, .form-group-field textarea:focus {
    outline: none;
    background: #ffffff;
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.12);
}

.modal-foot {
    padding: 1.15rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    background: #f8fafc;
    border-radius: 0 0 16px 16px;
}

.btn-modal-cancel {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 0.6rem 1.15rem;
    font-size: 0.88rem;
    font-weight: 650;
    color: #475569;
    border-radius: 8px;
    cursor: pointer;
}

.admin-bottom-footer {
    padding: 1rem 1.75rem;
    border-top: 1px solid #e2e8f0;
    background: #ffffff;
    font-size: 0.82rem;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: auto;
}

/* ==========================================================================
   4. VOUCHER MANAGEMENT REDESIGN STYLES
   ========================================================================== */
.voucher-ticket-code {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    background: #f8fafc;
    border: 1.5px dashed #cbd5e1;
    padding: 0.35rem 0.65rem;
    border-radius: 8px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 800;
    font-size: 0.88rem;
    color: #0f172a;
    cursor: pointer;
    transition: all 0.15s ease;
}

.voucher-ticket-code:hover {
    border-color: #dc2626;
    background: #fef2f2;
    color: #dc2626;
    transform: translateY(-1px);
}

.btn-copy-code {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.4rem;
    border-radius: 6px;
    font-size: 0.9rem;
    color: #64748b;
    transition: all 0.15s ease;
}

.btn-copy-code:hover {
    color: #dc2626;
    background: #fee2e2;
}

.voucher-kind-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    font-size: 0.76rem;
    font-weight: 700;
}

.voucher-kind-badge.shipping {
    background: #ccfbf1;
    color: #0f766e;
    border: 1px solid #99f6e4;
}

.voucher-kind-badge.percentage {
    background: #f3e8ff;
    color: #6d28d9;
    border: 1px solid #e9d5ff;
}

.voucher-kind-badge.fixed {
    background: #fef3c7;
    color: #b45309;
    border: 1px solid #fde68a;
}

.voucher-filter-pill {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #475569;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 650;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-rev-action {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 1.15rem;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 8px;
    color: #ffffff;
    font-size: 0.86rem;
    font-weight: 700;
    cursor: pointer;
    height: 38px;
    box-sizing: border-box;
    transition: all 0.15s ease;
}

.btn-rev-action:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
}

.voucher-filter-pill {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #475569;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 650;
    cursor: pointer;
    transition: all 0.15s ease;
}

.voucher-filter-pill:hover {
    background: #f8fafc;
    border-color: #94a3b8;
}

.voucher-filter-pill.active {
    background: #0f172a;
    color: #ffffff;
    border-color: #0f172a;
}

.btn-voucher-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #334155;
    font-size: 0.88rem;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    transition: all 0.15s ease;
}

.btn-voucher-action:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #0f172a;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.btn-voucher-action.delete:hover {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #dc2626;
}

.voucher-toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #0f172a;
    color: #ffffff;
    padding: 0.85rem 1.35rem;
    border-radius: 12px;
    font-size: 0.88rem;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    opacity: 0;
    transform: translateY(12px);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
}

.voucher-toast.show {
    opacity: 1;
    transform: translateY(0);
}

#vouchersTable {
    width: 100%;
    min-width: 1060px;
    border-collapse: collapse;
}

#vouchersTable th, #vouchersTable td {
    padding: 0.85rem 0.85rem;
    font-size: 0.84rem;
}

#vouchersTable th:first-child, #vouchersTable td:first-child {
    padding-left: 1.25rem;
}

#vouchersTable th:last-child, #vouchersTable td:last-child {
    padding-right: 1.25rem;
}
</style>

<div class="admin-layout-container">
    <!-- =====================================================================
         1. SIDEBAR NAVIGATION
         ===================================================================== -->
    <aside class="admin-sidebar">
        <!-- Logo & Brand Header -->
        <div class="sidebar-brand-box">
            <div class="sidebar-brand-icon">📚</div>
            <div class="sidebar-brand-text">
                <span class="sidebar-brand-name">Sách <em>Hay</em></span>
                <span class="sidebar-brand-tag">Hệ Thống Quản Trị</span>
            </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
            <span class="sidebar-section-title">TỔNG QUAN</span>
            <button type="button" class="sidebar-item-btn active" data-nav="dashboard" onclick="selectAdminSection('dashboard')">
                <span class="sidebar-item-left">
                    <span class="sidebar-item-icon">📊</span>
                    <span>Bảng điều khiển</span>
                </span>
            </button>

            <span class="sidebar-section-title">BÁN HÀNG & TÀI CHÍNH</span>
            <!-- Nút Báo Cáo Doanh Thu với Badge tinh gọn không bị rớt dòng -->
            <button type="button" class="sidebar-item-btn" data-nav="revenue" onclick="selectAdminSection('revenue')">
                <span class="sidebar-item-left">
                    <span class="sidebar-item-icon">💰</span>
                    <span>Báo Cáo Doanh Thu</span>
                </span>
                <span class="sidebar-badge revenue-badge"><?= $sidebarRevText ?></span>
            </button>

            <button type="button" class="sidebar-item-btn" data-nav="orders" onclick="selectAdminSection('orders')">
                <span class="sidebar-item-left">
                    <span class="sidebar-item-icon">📦</span>
                    <span>Quản lý Đơn hàng</span>
                </span>
                <span class="sidebar-badge <?= ($stats['pending'] ?? 0) > 0 ? 'urgent' : '' ?>"><?= $stats['total'] ?></span>
            </button>

            <button type="button" class="sidebar-item-btn" data-nav="books" onclick="selectAdminSection('books')">
                <span class="sidebar-item-left">
                    <span class="sidebar-item-icon">📚</span>
                    <span>Kho Sản Phẩm</span>
                </span>
                <span class="sidebar-badge"><?= $totalBooks ?></span>
            </button>

            <span class="sidebar-section-title">MARKETING & KHÁCH HÀNG</span>
            <button type="button" class="sidebar-item-btn" data-nav="vouchers" onclick="selectAdminSection('vouchers')">
                <span class="sidebar-item-left">
                    <span class="sidebar-item-icon">🎟️</span>
                    <span>Mã Giảm Giá</span>
                </span>
                <span class="sidebar-badge"><?= count($vouchers) ?></span>
            </button>

            <button type="button" class="sidebar-item-btn" data-nav="contacts" onclick="selectAdminSection('contacts')">
                <span class="sidebar-item-left">
                    <span class="sidebar-item-icon">💬</span>
                    <span>Tin Nhắn Liên Hệ</span>
                </span>
                <span class="sidebar-badge"><?= count($contacts) ?></span>
            </button>

            <span class="sidebar-section-title">HỆ THỐNG</span>
            <button type="button" class="sidebar-item-btn" data-nav="settings" onclick="selectAdminSection('settings')">
                <span class="sidebar-item-left">
                    <span class="sidebar-item-icon">⚙️</span>
                    <span>Cấu hình & Máy chủ</span>
                </span>
            </button>
        </nav>

        <!-- Sidebar Footer & Admin User Card -->
        <div class="sidebar-footer">
            <a href="/" target="_blank" class="btn-visit-store" title="Mở trang web bán sách trong tab mới">
                <span>🌐</span> Xem Cửa Hàng ↗
            </a>

            <div class="sidebar-user-card">
                <div class="sidebar-user-avatar">AD</div>
                <div class="sidebar-user-info">
                    <span class="sidebar-user-name">Quản trị viên</span>
                    <span class="sidebar-user-role">admin</span>
                </div>
                <button type="button" class="btn-sidebar-logout" data-admin-logout title="Đăng xuất khỏi phiên quản trị">
                    🚪
                </button>
            </div>
        </div>
    </aside>

    <!-- =====================================================================
         2. MAIN VIEWPORT
         ===================================================================== -->
    <main class="admin-main-viewport">
        <!-- Topbar -->
        <header class="admin-topbar">
            <div class="topbar-left">
                <h1 class="topbar-page-title" id="pageTitleText">Bảng Điều Khiển Tổng Quan</h1>
                <div class="topbar-status-badge">
                    <span class="status-dot-pulse"></span>
                    <span>Localhost:3000 · Sẵn sàng</span>
                </div>
            </div>

            <div class="topbar-right">
                <button type="button" class="btn-topbar-action" onclick="openBookModalDialog()">
                    <span>+</span>
                    <span>Thêm Sách Mới</span>
                </button>
            </div>
        </header>

        <!-- Body Content -->
        <div class="admin-page-content">
            <?php if ($flash): ?>
                <div class="admin-alert-banner">
                    <span>✓</span> <?= $e($flash) ?>
                </div>
            <?php endif; ?>

            <!-- =============================================================
                 PANE 1: BẢNG ĐIỀU KHIỂN TỔNG QUAN (DASHBOARD)
                 ============================================================= -->
            <section class="admin-view-pane active" id="pane-dashboard">
                <!-- 4 KPI Cards -->
                <div class="dash-kpi-grid">
                    <div class="kpi-stat-card" onclick="selectAdminSection('revenue')">
                        <div>
                            <span class="kpi-stat-label">Doanh thu hoàn tất</span>
                            <span class="kpi-stat-value" style="color: #16a34a;"><?= $money($completedRevenue) ?></span>
                            <span class="kpi-stat-desc">Xem phân tích tài chính &rarr;</span>
                        </div>
                        <div class="kpi-icon-pill kpi-green">💰</div>
                    </div>

                    <div class="kpi-stat-card" onclick="selectAdminSection('orders')">
                        <div>
                            <span class="kpi-stat-label">Tổng đơn hàng</span>
                            <span class="kpi-stat-value"><?= number_format($totalOrdersCount, 0, ',', '.') ?></span>
                            <span class="kpi-stat-desc">Xem toàn bộ đơn đặt &rarr;</span>
                        </div>
                        <div class="kpi-icon-pill kpi-blue">📦</div>
                    </div>

                    <div class="kpi-stat-card" onclick="selectAdminSection('orders')" style="<?= ($stats['pending'] ?? 0) > 0 ? 'border-color: #fde68a; background: #fffdf5;' : '' ?>">
                        <div>
                            <span class="kpi-stat-label">Chờ xác nhận</span>
                            <span class="kpi-stat-value" style="<?= ($stats['pending'] ?? 0) > 0 ? 'color: #d97706;' : '' ?>">
                                <?= number_format((int) ($stats['pending'] ?? 0), 0, ',', '.') ?>
                            </span>
                            <span class="kpi-stat-desc"><?= ($stats['pending'] ?? 0) > 0 ? '⚠️ Cần xử lý giao hàng' : 'Đã duyệt hết đơn chờ' ?></span>
                        </div>
                        <div class="kpi-icon-pill kpi-amber">⏳</div>
                    </div>

                    <div class="kpi-stat-card" onclick="selectAdminSection('books')">
                        <div>
                            <span class="kpi-stat-label">Đầu sách trong kho</span>
                            <span class="kpi-stat-value"><?= number_format($totalBooks, 0, ',', '.') ?></span>
                            <span class="kpi-stat-desc"><?= $inStockBooks ?> còn tốt · <?= $outOfStockBooks ?> hết hàng</span>
                        </div>
                        <div class="kpi-icon-pill kpi-purple">📚</div>
                    </div>
                </div>

                <!-- 2 Columns Grid -->
                <div class="dash-two-cols">
                    <!-- Col 1: Tình trạng tồn kho -->
                    <div class="dash-card">
                        <div class="dash-card-header">
                            <h3 class="dash-card-title"><span>📊</span> Phân Bổ Danh Mục Sách</h3>
                            <a href="javascript:void(0)" onclick="selectAdminSection('books')" class="dash-card-action-link">Chi tiết kho &rarr;</a>
                        </div>
                        <div>
                            <?php 
                            $topCats = array_slice($catCounts, 0, 5, true);
                            foreach ($topCats as $cName => $cCount): 
                                $pct = round(($cCount / max(1, $totalBooks)) * 100);
                            ?>
                                <div class="cat-progress-item">
                                    <div class="cat-progress-head">
                                        <span><?= $e($cName) ?></span>
                                        <strong><?= $cCount ?> tựa (<?= $pct ?>%)</strong>
                                    </div>
                                    <div class="cat-progress-track">
                                        <div class="cat-progress-fill" style="width: <?= $pct ?>%;"></div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <!-- Col 2: Đơn hàng mới nhất -->
                    <div class="dash-card">
                        <div class="dash-card-header">
                            <h3 class="dash-card-title"><span>⚡</span> Đơn Hàng Gần Đây</h3>
                            <a href="javascript:void(0)" onclick="selectAdminSection('orders')" class="dash-card-action-link">Xem tất cả &rarr;</a>
                        </div>
                        <?php if (empty($orders)): ?>
                            <div style="text-align: center; padding: 2rem 1rem; color: #64748b;">
                                <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📦</div>
                                <strong style="color: #334155; font-size: 0.95rem;">Chưa có đơn hàng nào</strong>
                                <p style="font-size: 0.84rem; margin: 0.25rem 0 0;">Khi có khách đặt mua sách, đơn hàng sẽ hiển thị tại đây.</p>
                            </div>
                        <?php else: ?>
                            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                                <?php foreach (array_slice($orders, 0, 4) as $ord): ?>
                                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.75rem; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; font-size: 0.85rem;">
                                        <div>
                                            <strong>#<?= $e($ord['orderCode']) ?></strong> · <?= $e($ord['customerName']) ?>
                                            <div style="font-size: 0.75rem; color: #64748b;"><?= $e(implode(', ', array_map(fn($it) => $it['title'] . ' ×' . $it['quantity'], array_slice($ord['items'], 0, 2)))) ?></div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-weight: 750; color: #dc2626;"><?= $money($ord['total']) ?></div>
                                            <span class="stock-tag <?= ($ord['status'] === 'completed') ? 'good' : (($ord['status'] === 'pending') ? 'warn' : 'good') ?>" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">
                                                <?= $e($statusNames[$ord['status']] ?? $ord['status']) ?>
                                            </span>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </section>

            <!-- =============================================================
                 PANE 2: BÁO CÁO DOANH THU & TÀI CHÍNH (REVENUE ANALYTICS REDESIGN)
                 ============================================================= -->
            <section class="admin-view-pane" id="pane-revenue">
                <!-- Executive Hero Banner -->
                <div class="rev-hero-banner">
                    <div class="rev-hero-title-box">
                        <span class="rev-tag-badge">
                            <span>●</span> Báo Cáo Tài Chính Thời Gian Thực
                        </span>
                        <h2 class="rev-hero-title">Báo Cáo Doanh Thu & Dòng Tiền</h2>
                        <p class="rev-hero-desc">Theo dõi doanh thu thực thu, đối soát phương thức thanh toán và lịch sử giao dịch.</p>
                    </div>

                    <div class="rev-hero-controls">
                        <button type="button" class="btn-rev-export" onclick="exportRevenueToCsv()" title="Tải file Excel / CSV có chuẩn UTF-8 BOM">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            <span>Xuất File Excel (CSV)</span>
                        </button>
                        <button type="button" class="btn-rev-print" onclick="window.print()" title="In báo cáo">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            <span>In Báo Cáo</span>
                        </button>
                    </div>
                </div>

                <!-- 4 Thẻ Chỉ Số Tài Chính Sang Trọng -->
                <div class="dash-kpi-grid">
                    <!-- Doanh thu thực thu -->
                    <div class="fin-card">
                        <div class="fin-head-row">
                            <span class="fin-title">Doanh thu thực thu</span>
                            <span class="fin-badge-trend trend-up">▲ Đã thu tiền</span>
                        </div>
                        <div class="fin-amount" style="color: #16a34a;"><?= $money($completedRevenue) ?></div>
                        <div class="fin-footer-meta">
                            <span>✓ Từ <?= $completedCount ?> đơn giao thành công</span>
                        </div>
                    </div>

                    <!-- Doanh thu đang chờ -->
                    <div class="fin-card">
                        <div class="fin-head-row">
                            <span class="fin-title">Doanh thu đang chờ</span>
                            <span class="fin-badge-trend trend-wait">⏳ Đang vận chuyển</span>
                        </div>
                        <div class="fin-amount" style="color: #d97706;"><?= $money($pendingRevenue) ?></div>
                        <div class="fin-footer-meta">
                            <span>Dự kiến thu hộ trong 24-48h</span>
                        </div>
                    </div>

                    <!-- Giá trị đơn trung bình (AOV) -->
                    <div class="fin-card">
                        <div class="fin-head-row">
                            <span class="fin-title">Giá trị TB / Đơn (AOV)</span>
                            <span class="fin-badge-trend trend-stat">Mức chi trả</span>
                        </div>
                        <div class="fin-amount" style="color: #0284c7;"><?= $money($aov) ?></div>
                        <div class="fin-footer-meta">
                            <span>Bình quân mỗi giỏ thanh toán</span>
                        </div>
                    </div>

                    <!-- Tỷ lệ hoàn thành -->
                    <div class="fin-card">
                        <div class="fin-head-row">
                            <span class="fin-title">Tỷ lệ hoàn thành</span>
                            <span class="fin-badge-trend trend-up">Chốt đơn</span>
                        </div>
                        <div class="fin-amount" style="color: #7c3aed;"><?= $successRate ?>%</div>
                        <div class="fin-footer-meta">
                            <span><?= $completedCount ?> / <?= $totalOrdersCount ?> đơn hoàn tất</span>
                        </div>
                    </div>
                </div>

                <!-- Layout 2 Cột: Biểu Đồ Cột Xu Hướng & Donut Kênh Thanh Toán -->
                <div class="rev-split-layout">
                    <!-- Cột 1: Biểu đồ doanh thu chuẩn đồ họa -->
                    <div class="chart-card-box">
                        <div class="chart-header-row">
                            <div class="chart-title-left">
                                <h3>📈 Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h3>
                                <span>Thống kê theo các đơn hàng thành công (Đơn vị: VNĐ)</span>
                            </div>
                            <div style="text-align: right;">
                                <strong style="color: #dc2626; font-size: 1.15rem;"><?= $money($completedRevenue) ?></strong>
                                <div style="font-size: 0.72rem; color: #64748b;">Tổng tuần này</div>
                            </div>
                        </div>

                        <?php 
                        $maxDayRev = 1;
                        foreach ($revenueDaily as $rd) {
                            if ((int) $rd['revenue'] > $maxDayRev) {
                                $maxDayRev = (int) $rd['revenue'];
                            }
                        }
                        // Làm tròn trần trần mốc trên biểu đồ (ví dụ 500k)
                        $chartCeil = max(500000, ceil($maxDayRev / 100000) * 100000);
                        ?>

                        <div class="rev-svg-container">
                            <!-- Horizontal Dotted Gridlines -->
                            <div class="rev-grid-line" style="bottom: 85%;">
                                <span class="rev-grid-label"><?= number_format($chartCeil / 1000, 0) ?>k</span>
                            </div>
                            <div class="rev-grid-line" style="bottom: 58%;">
                                <span class="rev-grid-label"><?= number_format(($chartCeil * 0.66) / 1000, 0) ?>k</span>
                            </div>
                            <div class="rev-grid-line" style="bottom: 30%;">
                                <span class="rev-grid-label"><?= number_format(($chartCeil * 0.33) / 1000, 0) ?>k</span>
                            </div>
                            <div class="rev-grid-line" style="bottom: 2px; border-top-style: solid; border-color: #cbd5e1;">
                                <span class="rev-grid-label">0</span>
                            </div>

                            <!-- Revenue Bars Track -->
                            <div class="rev-bars-track">
                                <?php if (empty($revenueDaily)): ?>
                                    <div style="margin: auto; color: #94a3b8; font-size: 0.88rem;">Chưa có dữ liệu giao dịch trong kỳ.</div>
                                <?php else: ?>
                                    <?php foreach ($revenueDaily as $rd): 
                                        $revVal = (int) $rd['revenue'];
                                        $barH = max(8, round(($revVal / $chartCeil) * 85));
                                        $dayLabel = date('d/m', strtotime($rd['day']));
                                    ?>
                                        <div class="rev-bar-column">
                                            <span class="rev-bar-tag" style="bottom: calc(<?= $barH ?>% + 4px);">
                                                <?= number_format($revVal / 1000, 0) ?>k
                                            </span>
                                            <div class="rev-bar-fill" style="height: <?= $barH ?>%;" title="Ngày <?= $rd['day'] ?>: <?= $money($revVal) ?> (<?= $rd['orderCount'] ?> đơn)"></div>
                                            <span class="rev-bar-date"><?= $dayLabel ?></span>
                                        </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Cột 2: Donut Chart Cơ Cấu Phương Thức Thanh Toán -->
                    <div class="donut-card-box">
                        <div class="chart-header-row">
                            <div class="chart-title-left">
                                <h3>💳 Kênh Thanh Toán</h3>
                                <span>Phân bổ dòng tiền đã đối soát</span>
                            </div>
                        </div>

                        <!-- SVG Donut Chart -->
                        <div class="donut-visual-wrap">
                            <svg width="170" height="170" viewBox="0 0 100 100">
                                <!-- Background Track -->
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" stroke-width="10"></circle>
                                
                                <!-- Segment 1: Bank / VietQR (Blue) -->
                                <?php 
                                $c = 2 * M_PI * 40; // ~251.33
                                $dashBank = round(($bankPct / 100) * $c, 2);
                                $dashCod = round(($codPct / 100) * $c, 2);
                                $offsetCod = -$dashBank;
                                ?>
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" stroke-width="10"
                                        stroke-dasharray="<?= $dashBank ?> <?= $c - $dashBank ?>"
                                        stroke-dashoffset="0"
                                        transform="rotate(-90 50 50)"
                                        stroke-linecap="round"></circle>

                                <!-- Segment 2: COD (Green) -->
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#16a34a" stroke-width="10"
                                        stroke-dasharray="<?= $dashCod ?> <?= $c - $dashCod ?>"
                                        stroke-dashoffset="<?= $offsetCod ?>"
                                        transform="rotate(-90 50 50)"
                                        stroke-linecap="round"></circle>
                            </svg>

                            <div class="donut-center-info">
                                <strong><?= $money($completedRevenue) ?></strong>
                                <span>Đã đối soát</span>
                            </div>
                        </div>

                        <!-- Channel Details List -->
                        <div class="payment-list-items">
                            <div class="pay-item-row">
                                <div class="pay-item-left">
                                    <span class="pay-dot pay-dot-blue"></span>
                                    <span>Chuyển khoản VietQR</span>
                                </div>
                                <div class="pay-item-right">
                                    <span class="pay-item-sum" style="color: #2563eb;"><?= $money($bankRevenue) ?></span>
                                    <span class="pay-item-pct"><?= $bankPct ?>% doanh thu</span>
                                </div>
                            </div>

                            <div class="pay-item-row">
                                <div class="pay-item-left">
                                    <span class="pay-dot pay-dot-green"></span>
                                    <span>Thu tiền khi giao (COD)</span>
                                </div>
                                <div class="pay-item-right">
                                    <span class="pay-item-sum" style="color: #16a34a;"><?= $money($codRevenue) ?></span>
                                    <span class="pay-item-pct"><?= $codPct ?>% doanh thu</span>
                                </div>
                            </div>

                            <div class="pay-item-row">
                                <div class="pay-item-left">
                                    <span class="pay-dot pay-dot-amber"></span>
                                    <span>Nhận tại cửa hàng</span>
                                </div>
                                <div class="pay-item-right">
                                    <span class="pay-item-sum"><?= $money($storeRevenue) ?></span>
                                    <span class="pay-item-pct"><?= $storePct ?>% doanh thu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Thống Kê Doanh Thu Theo Nhóm Danh Mục Sách Bán Chạy -->
                <div class="cat-contrib-card">
                    <div class="chart-header-row" style="margin-bottom: 0.5rem; padding-bottom: 0.5rem;">
                        <div class="chart-title-left">
                            <h3>📚 Cơ Cấu Doanh Số Theo Thể Loại Sách</h3>
                            <span>Tỷ trọng đóng góp doanh thu của các danh mục nổi bật</span>
                        </div>
                    </div>

                    <div class="contrib-grid">
                        <div class="contrib-box">
                            <div class="contrib-box-head">
                                <span>Sách Kinh Tế & Khởi Nghiệp</span>
                                <strong style="color: #dc2626;">744.500 ₫ (51.1%)</strong>
                            </div>
                            <div class="contrib-box-bar">
                                <div class="contrib-box-fill" style="width: 51.1%; background: #dc2626;"></div>
                            </div>
                            <span style="font-size: 0.72rem; color: #64748b;">Đóng góp lớn nhất tuần này</span>
                        </div>

                        <div class="contrib-box">
                            <div class="contrib-box-head">
                                <span>Tâm Lý & Kỹ Năng Sống</span>
                                <strong style="color: #2563eb;">476.000 ₫ (32.7%)</strong>
                            </div>
                            <div class="contrib-box-bar">
                                <div class="contrib-box-fill" style="width: 32.7%; background: #2563eb;"></div>
                            </div>
                            <span style="font-size: 0.72rem; color: #64748b;">Dòng sách bán chạy ổn định</span>
                        </div>

                        <div class="contrib-box">
                            <div class="contrib-box-head">
                                <span>Văn Học & Tiểu Thuyết</span>
                                <strong style="color: #16a34a;">236.000 ₫ (16.2%)</strong>
                            </div>
                            <div class="contrib-box-bar">
                                <div class="contrib-box-fill" style="width: 16.2%; background: #16a34a;"></div>
                            </div>
                            <span style="font-size: 0.72rem; color: #64748b;">Lượng đặt hàng đều đặn</span>
                        </div>
                    </div>
                </div>

                <!-- Bảng Kê Chi Tiết Giao Dịch & Đối Soát Doanh Thu -->
                <div class="dash-card">
                    <div class="dash-card-header">
                        <div>
                            <h3 class="dash-card-title"><span>📋</span> Chi Tiết Giao Dịch & Đối Soát Doanh Thu</h3>
                            <span style="font-size: 0.82rem; color: #64748b;">Danh sách giao dịch phát sinh từ đơn hàng thực tế</span>
                        </div>
                        <div class="search-field-wrap" style="max-width: 280px;">
                            <span class="search-field-icon">🔍</span>
                            <input type="text" id="searchRevenueOrder" placeholder="Tìm theo mã đơn, khách hàng..." oninput="filterRevenueTable()">
                        </div>
                    </div>

                    <div class="data-table-card">
                        <table class="dash-table" id="revenueDataTable">
                            <thead>
                                <tr>
                                    <th>Mã Đơn Hàng</th>
                                    <th>Thời Gian Đặt</th>
                                    <th>Khách Hàng</th>
                                    <th>Hình Thức</th>
                                    <th>Doanh Thu</th>
                                    <th>Trạng Thái Đơn</th>
                                    <th>Thanh Toán</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($revenueOrders as $rOrder): 
                                    $pData = json_decode($rOrder['payload'], true)['order'] ?? [];
                                    $ordStatus = $pData['status'] ?? 'pending';
                                    $methodName = match($rOrder['payment_method']) {
                                        'BANK_TRANSFER' => '🏦 VietQR',
                                        'COD' => '🚚 COD',
                                        'STORE_PICKUP' => '🏬 Tại shop',
                                        default => $rOrder['payment_method']
                                    };
                                ?>
                                <tr class="revenue-row-item"
                                    data-code="<?= mb_strtolower($rOrder['order_code']) ?>"
                                    data-customer="<?= mb_strtolower($pData['customerName'] ?? '') ?>">
                                    <td>
                                        <strong style="color: #0f172a; font-family: monospace;">#<?= $e($rOrder['order_code']) ?></strong>
                                    </td>
                                    <td style="font-size: 0.82rem; color: #64748b;">
                                        <?= date('d/m/Y H:i', strtotime($rOrder['created_at'])) ?>
                                    </td>
                                    <td>
                                        <strong style="color: #1e293b;"><?= $e($pData['customerName'] ?: 'Khách mua sách') ?></strong>
                                        <div style="font-size: 0.75rem; color: #64748b;"><?= $e($pData['phone'] ?? '') ?></div>
                                    </td>
                                    <td>
                                        <span class="cat-pill"><?= $methodName ?></span>
                                    </td>
                                    <td>
                                        <strong style="color: #dc2626; font-size: 0.95rem;"><?= $money($rOrder['total']) ?></strong>
                                    </td>
                                    <td>
                                        <span class="stock-tag <?= ($ordStatus === 'completed') ? 'good' : (($ordStatus === 'pending') ? 'warn' : 'good') ?>">
                                            <?= $e($statusNames[$ordStatus] ?? $ordStatus) ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?php if ($rOrder['payment_status'] === 'paid' || $ordStatus === 'completed'): ?>
                                            <span class="stock-tag good" style="font-size: 0.72rem;">✓ Đã thu tiền</span>
                                        <?php else: ?>
                                            <span class="stock-tag warn" style="font-size: 0.72rem;">Chờ thu tiền</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- =============================================================
                 PANE 3: QUẢN LÝ SẢN PHẨM & KHO SÁCH (BOOKS)
                 ============================================================= -->
            <section class="admin-view-pane" id="pane-books">
                <!-- Toolbar Filters -->
                <div class="table-filter-bar">
                    <div class="filter-left-group">
                        <div class="search-field-wrap">
                            <span class="search-field-icon">🔍</span>
                            <input type="text" id="liveSearchBook" placeholder="Tìm theo tên sách, tác giả, ISBN, NXB..." oninput="handleBookFiltering()">
                        </div>

                        <select class="filter-select" id="liveCategoryFilter" onchange="handleBookFiltering()">
                            <option value="">-- Tất cả danh mục (<?= count($categoriesList) ?>) --</option>
                            <?php foreach ($categoriesList as $cat): ?>
                                <option value="<?= $e($cat) ?>"><?= $e($cat) ?></option>
                            <?php endforeach; ?>
                        </select>

                        <select class="filter-select" id="liveStockFilter" onchange="handleBookFiltering()">
                            <option value="">-- Tình trạng kho --</option>
                            <option value="good">Còn hàng (>10)</option>
                            <option value="warn">Sắp hết hàng (1-10)</option>
                            <option value="danger">Hết hàng (0)</option>
                        </select>
                    </div>

                    <button type="button" class="btn-topbar-action" onclick="openBookModalDialog()">
                        <span>+</span>
                        <span>Thêm Sách Mới</span>
                    </button>
                </div>

                <!-- Book Counter -->
                <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.75rem; display: flex; justify-content: space-between;">
                    <span>Hiển thị <strong id="countFilteredBooks"><?= $totalBooks ?></strong> / <strong><?= $totalBooks ?></strong> tựa sách</span>
                </div>

                <!-- Books Table -->
                <div class="data-table-card">
                    <table class="dash-table" id="tableBooksList">
                        <thead>
                            <tr>
                                <th style="width: 54px;">Ảnh</th>
                                <th>Thông tin sách</th>
                                <th>Danh mục</th>
                                <th>Giá bán</th>
                                <th>Tồn kho</th>
                                <th style="text-align: right;">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($books as $product): 
                                $stk = (int) ($product['stock'] ?? 0);
                                $stkClass = ($stk <= 0) ? 'danger' : (($stk <= 10) ? 'warn' : 'good');
                                $stkLabel = ($stk <= 0) ? 'Hết hàng' : (($stk <= 10) ? 'Sắp hết (' . $stk . ')' : 'Còn ' . $stk);
                                $prodJson = json_encode($product, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE);
                            ?>
                            <tr class="book-data-row"
                                data-title="<?= mb_strtolower($product['title'] ?? '') ?>"
                                data-author="<?= mb_strtolower($product['author'] ?? '') ?>"
                                data-publisher="<?= mb_strtolower($product['publisher'] ?? '') ?>"
                                data-isbn="<?= mb_strtolower($product['isbn'] ?? '') ?>"
                                data-category="<?= $e($product['categoryName'] ?? '') ?>"
                                data-stock-state="<?= $stkClass ?>">

                                <td>
                                    <img src="<?= $e($product['coverImage'] ?: '/media/placeholder.png') ?>" 
                                         alt="<?= $e($product['title']) ?>" 
                                         class="thumb-preview-img"
                                         loading="lazy"
                                         onerror="this.src='https://placehold.co/100x140?text=S%C3%A1ch';">
                                </td>

                                <td class="book-title-cell" style="max-width: 360px;">
                                    <a href="/books/<?= $e($product['id']) ?>" target="_blank" title="Xem sách ngoài website">
                                        <?= $e($product['title']) ?> ↗
                                    </a>
                                    <div class="book-sub-meta">
                                        <span>Tác giả: <strong><?= $e($product['author'] ?? 'Đang cập nhật') ?></strong></span>
                                        <span>NXB: <?= $e($product['publisher'] ?? 'N/A') ?></span>
                                        <?php if (!empty($product['isbn'])): ?>
                                            <span>ISBN: <?= $e($product['isbn']) ?></span>
                                        <?php endif; ?>
                                    </div>
                                </td>

                                <td>
                                    <span class="cat-pill"><?= $e($product['categoryName'] ?? 'Chưa phân loại') ?></span>
                                </td>

                                <td>
                                    <div>
                                        <strong style="color: #dc2626; font-size: 0.95rem;"><?= $money($product['price']) ?></strong>
                                    </div>
                                    <?php if (($product['originalPrice'] ?? 0) > $product['price']): ?>
                                        <div style="font-size: 0.78rem; color: #94a3b8; text-decoration: line-through;">
                                            <?= $money($product['originalPrice']) ?>
                                        </div>
                                    <?php endif; ?>
                                </td>

                                <td>
                                    <span class="stock-tag <?= $stkClass ?>"><?= $stkLabel ?></span>
                                </td>

                                <td style="text-align: right;">
                                    <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.4rem;">
                                        <button type="button" class="btn-mini-edit" onclick='editBookModalDialog(<?= $prodJson ?>)'>
                                            <span>✏️</span> Sửa
                                        </button>
                                        <form action="/admin" method="post" onsubmit="return confirm('Bạn có chắc muốn ẩn tựa sách này?');" style="margin:0;">
                                            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                                            <input type="hidden" name="id" value="<?= $e($product['id']) ?>">
                                            <button type="submit" name="action" value="remove" class="btn-mini-delete" title="Ẩn sách">
                                                <span>👁️</span> Ẩn
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>

                    <div id="emptySearchNotice" style="display: none; text-align: center; padding: 3rem 1.5rem; color: #64748b;">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
                        <h4 style="margin: 0 0 0.25rem; font-size: 1.1rem; color: #334155;">Không tìm thấy tựa sách nào</h4>
                        <p style="margin: 0; font-size: 0.85rem;">Hãy thử từ khóa khác hoặc xóa bộ lọc danh mục.</p>
                    </div>
                </div>
            </section>

            <!-- =============================================================
                 PANE 4: QUẢN LÝ ĐƠN HÀNG (ORDERS)
                 ============================================================= -->
            <section class="admin-view-pane" id="pane-orders">
                <div class="table-filter-bar">
                    <div class="filter-left-group">
                        <span style="font-size: 0.88rem; font-weight: 700; color: #334155;">Lọc trạng thái:</span>
                        <select class="filter-select" id="orderStatusSelect" onchange="filterOrdersByStatus(this.value)">
                            <option value="all">Tất cả đơn (<?= count($orders) ?>)</option>
                            <option value="pending">⏳ Chờ xác nhận (<?= $stats['pending'] ?? 0 ?>)</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="processing">Đang chuẩn bị hàng</option>
                            <option value="shipping">Đang giao hàng</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>
                    <div style="font-size: 0.85rem; color: #64748b;">
                        Trang <strong><?= $page ?></strong>
                    </div>
                </div>

                <?php if (empty($orders)): ?>
                    <div class="dash-card" style="text-align: center; padding: 3.5rem 1.5rem; color: #64748b;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📦</div>
                        <h3 style="margin: 0 0 0.35rem; color: #334155;">Chưa có đơn hàng nào</h3>
                        <p style="margin: 0; font-size: 0.88rem;">Khi khách đặt mua sách trên cửa hàng, thông tin đơn sẽ xuất hiện đầy đủ ở đây.</p>
                    </div>
                <?php else: ?>
                    <div id="ordersListWrap">
                        <?php foreach ($orders as $order): 
                            $statusK = $order['status'] ?? 'pending';
                            $opts = [
                                'pending' => ['confirmed' => 'Xác nhận đơn', 'cancelled' => 'Hủy đơn'],
                                'confirmed' => ['processing' => 'Chuẩn bị hàng', 'cancelled' => 'Hủy đơn'],
                                'processing' => ['shipping' => 'Giao bưu tá', 'cancelled' => 'Hủy đơn'],
                                'shipping' => ['completed' => 'Giao thành công']
                            ][$statusK] ?? [];
                        ?>
                        <div class="dash-card order-item-card" data-order-state="<?= $e($statusK) ?>" style="margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; margin-bottom: 0.75rem;">
                                <div style="display: flex; align-items: center; gap: 0.65rem;">
                                    <strong style="font-size: 1.05rem;">#<?= $e($order['orderCode']) ?></strong>
                                    <span class="stock-tag <?= ($statusK === 'completed') ? 'good' : (($statusK === 'pending') ? 'warn' : 'good') ?>">
                                        <?= $e($statusNames[$statusK] ?? $statusK) ?>
                                    </span>
                                </div>
                                <span style="font-size: 0.8rem; color: #64748b;"><?= $e($order['created_at'] ?? 'Gần đây') ?></span>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.88rem; margin-bottom: 0.75rem;">
                                <div>
                                    <strong><?= $e($order['customerName'] ?: 'Khách hàng') ?></strong>
                                    <div>📞 <a href="tel:<?= $e($order['phone']) ?>" style="color: inherit;"><?= $e($order['phone']) ?></a></div>
                                    <?php if (!empty($order['email'])): ?>
                                        <div style="color: #64748b;">✉️ <?= $e($order['email']) ?></div>
                                    <?php endif; ?>
                                </div>
                                <div>
                                    <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Địa chỉ nhận hàng:</span>
                                    <div><?= $e(implode(', ', array_filter([$order['address'] ?? '', $order['ward'] ?? '', $order['district'] ?? '', $order['province'] ?? '']))) ?: 'Chưa nhập địa chỉ' ?></div>
                                </div>
                            </div>

                            <ul style="background: #f8fafc; border-radius: 8px; padding: 0.65rem 1rem; margin: 0.65rem 0; list-style: none; font-size: 0.86rem;">
                                <?php foreach ($order['items'] as $it): ?>
                                    <li style="display: flex; justify-content: space-between; padding: 0.2rem 0;">
                                        <span>📖 <?= $e($it['title']) ?></span>
                                        <strong>× <?= (int) $it['quantity'] ?></strong>
                                    </li>
                                <?php endforeach; ?>
                            </ul>

                            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 0.75rem; flex-wrap: wrap; gap: 0.65rem;">
                                <div>
                                    <span style="font-size: 0.82rem; color: #64748b;">Tổng cộng:</span>
                                    <strong style="font-size: 1.15rem; color: #dc2626; margin-left: 0.35rem;"><?= $money($order['total']) ?></strong>
                                </div>

                                <?php if (!empty($opts)): ?>
                                    <form method="post" action="/admin" style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                                        <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
                                        <input type="hidden" name="id" value="<?= $e($order['id']) ?>">
                                        <select name="status" class="filter-select" style="padding: 0.4rem 0.65rem; font-size: 0.82rem;">
                                            <?php foreach ($opts as $ov => $ol): ?>
                                                <option value="<?= $e($ov) ?>"><?= $e($ol) ?> (<?= $e($statusNames[$ov] ?? $ov) ?>)</option>
                                            <?php endforeach; ?>
                                        </select>
                                        <button type="submit" name="action" value="order" class="btn-topbar-action" style="padding: 0.45rem 0.85rem; font-size: 0.82rem;">
                                            Cập nhật
                                        </button>
                                    </form>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>

                    <!-- Pagination -->
                    <nav style="display: flex; justify-content: center; gap: 0.65rem; margin-top: 1.5rem;">
                        <?php if ($page > 1): ?>
                            <a href="/admin?page=<?= $page - 1 ?>#orders" class="btn-modal-cancel" style="text-decoration: none;">&larr; Trang trước</a>
                        <?php endif; ?>
                        <?php if ($hasNext): ?>
                            <a href="/admin?page=<?= $page + 1 ?>#orders" class="btn-topbar-action" style="text-decoration: none;">Trang sau &rarr;</a>
                        <?php endif; ?>
                    </nav>
                <?php endif; ?>
            </section>

            <!-- =============================================================
                 PANE 5: MÃ GIẢM GIÁ (VOUCHERS) REDESIGN
                 ============================================================= -->
            <section class="admin-view-pane" id="pane-vouchers">
                <!-- 1. Executive Banner -->
                <div class="rev-hero-banner" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);">
                    <div class="rev-hero-title-box">
                        <div style="display: flex; align-items: center; gap: 0.65rem;">
                            <span style="font-size: 1.6rem;">🎟️</span>
                            <h2 style="margin: 0; font-size: 1.45rem; font-weight: 850; letter-spacing: -0.02em;">Quản Lý Mã Giảm Giá & Khuyến Mãi</h2>
                            <span class="rev-tag-badge" style="background: rgba(255,255,255,0.15); color: #e0e7ff; border: 1px solid rgba(255,255,255,0.25);">
                                <?= count($vouchers) ?> mã đang kích hoạt
                            </span>
                        </div>
                        <p style="margin: 0; font-size: 0.86rem; color: #c7d2fe; max-width: 680px; line-height: 1.5;">
                            Quản lý các chương trình khuyến mãi, điều kiện áp dụng đơn hàng tối thiểu, mức chiết khấu tối đa và theo dõi lượt quy đổi thực tế.
                        </p>
                    </div>

                    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                        <button type="button" class="btn-rev-action" onclick="copyAllVoucherCodes()" title="Sao chép toàn bộ mã vào bộ nhớ tạm">
                            <span>📋</span>
                            <span>Copy Tất Cả Mã</span>
                        </button>
                        <button type="button" class="btn-topbar-action" onclick="openVoucherModal()" style="height: 38px; box-sizing: border-box; background: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);">
                            <span>+</span>
                            <span>Tạo Voucher Mới</span>
                        </button>
                    </div>
                </div>

                <!-- 2. KPI Summary 4 Cards -->
                <?php
                $countTotalV = count($vouchers);
                $countShipV = 0;
                $countPctV = 0;
                $countFixV = 0;
                $sumUsed = 0;
                $sumMax = 0;
                foreach ($vouchers as $vc) {
                    $k = $vc['kind'] ?? '';
                    if ($k === 'shipping') $countShipV++;
                    elseif ($k === 'percentage') $countPctV++;
                    elseif ($k === 'fixed') $countFixV++;
                    $sumUsed += (int) ($vc['used'] ?? 0);
                    $sumMax += (int) ($vc['max_uses'] ?? 1000);
                }
                ?>
                <div class="dash-kpi-grid">
                    <div class="kpi-stat-card" style="gap: 0.75rem;" onclick="setVoucherKindFilter('all', document.querySelector('.voucher-filter-pill[data-vkind=\'all\']'))">
                        <div style="min-width: 0; flex: 1;">
                            <span class="kpi-stat-label">Tổng Số Mã Voucher</span>
                            <span class="kpi-stat-value"><?= $countTotalV ?> <span style="font-size: 1rem; font-weight: 600; color: #64748b;">mã</span></span>
                            <span class="kpi-stat-desc">Đã dùng <?= number_format($sumUsed, 0, ',', '.') ?> lượt quy đổi</span>
                        </div>
                        <div class="kpi-icon-pill kpi-blue" style="flex-shrink: 0;">🎟️</div>
                    </div>

                    <div class="kpi-stat-card" style="gap: 0.75rem;" onclick="setVoucherKindFilter('shipping', document.querySelector('.voucher-filter-pill[data-vkind=\'shipping\']'))">
                        <div style="min-width: 0; flex: 1;">
                            <span class="kpi-stat-label">Freeship Vận Chuyển</span>
                            <span class="kpi-stat-value" style="color: #0f766e;"><?= $countShipV ?> <span style="font-size: 1rem; font-weight: 600; color: #64748b;">mã</span></span>
                            <span class="kpi-stat-desc">Trợ giá phí ship từ 20k - 40k</span>
                        </div>
                        <div class="kpi-icon-pill" style="background: #ccfbf1; color: #0f766e; flex-shrink: 0;">🚚</div>
                    </div>

                    <div class="kpi-stat-card" style="gap: 0.75rem;" onclick="setVoucherKindFilter('percentage', document.querySelector('.voucher-filter-pill[data-vkind=\'percentage\']'))">
                        <div style="min-width: 0; flex: 1;">
                            <span class="kpi-stat-label" style="white-space: nowrap;">Giảm Giá Theo %</span>
                            <span class="kpi-stat-value" style="color: #7e22ce;"><?= $countPctV ?> <span style="font-size: 1rem; font-weight: 600; color: #64748b;">mã</span></span>
                            <span class="kpi-stat-desc">Giảm từ 5% đến 30% giá trị</span>
                        </div>
                        <div class="kpi-icon-pill kpi-purple" style="flex-shrink: 0;">🏷️</div>
                    </div>

                    <div class="kpi-stat-card" style="gap: 0.75rem;" onclick="setVoucherKindFilter('fixed', document.querySelector('.voucher-filter-pill[data-vkind=\'fixed\']'))">
                        <div style="min-width: 0; flex: 1;">
                            <span class="kpi-stat-label">Giảm Tiền Mặt Trực Tiếp</span>
                            <span class="kpi-stat-value" style="color: #b45309;"><?= $countFixV ?> <span style="font-size: 1rem; font-weight: 600; color: #64748b;">mã</span></span>
                            <span class="kpi-stat-desc">Giảm trực tiếp 10k - 100.000 ₫</span>
                        </div>
                        <div class="kpi-icon-pill kpi-amber" style="flex-shrink: 0;">💵</div>
                    </div>
                </div>

                <!-- 3. Toolbar: Search, Pills & Min Spend Dropdown -->
                <div class="dash-card" style="padding: 1.15rem 1.35rem; margin-bottom: 1.25rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <!-- Filter Pills -->
                        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                            <button type="button" class="voucher-filter-pill active" data-vkind="all" onclick="setVoucherKindFilter('all', this)">
                                Tất cả (<?= $countTotalV ?>)
                            </button>
                            <button type="button" class="voucher-filter-pill" data-vkind="shipping" onclick="setVoucherKindFilter('shipping', this)">
                                🚚 Freeship (<?= $countShipV ?>)
                            </button>
                            <button type="button" class="voucher-filter-pill" data-vkind="percentage" onclick="setVoucherKindFilter('percentage', this)">
                                🏷️ Giảm % (<?= $countPctV ?>)
                            </button>
                            <button type="button" class="voucher-filter-pill" data-vkind="fixed" onclick="setVoucherKindFilter('fixed', this)">
                                💵 Tiền mặt (<?= $countFixV ?>)
                            </button>
                        </div>

                        <!-- Search & Spend filter -->
                        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                            <div style="position: relative; min-width: 250px;">
                                <input type="text" id="liveSearchVoucher" class="filter-input-search" placeholder="🔍 Tìm mã voucher..." oninput="filterVouchersTable()">
                            </div>
                            <select id="voucherMinSpendFilter" class="filter-select" onchange="filterVouchersTable()">
                                <option value="all">Tất cả mức chi tiêu</option>
                                <option value="0">Đơn từ 0 ₫ (Không điều kiện)</option>
                                <option value="50000">Đơn từ 50.000 ₫ trở lên</option>
                                <option value="150000">Đơn từ 150.000 ₫ trở lên</option>
                                <option value="250000">Đơn từ 250.000 ₫ trở lên</option>
                            </select>
                            <span style="font-size: 0.82rem; font-weight: 650; color: #64748b; margin-left: 0.25rem; white-space: nowrap;">
                                Hiển thị: <strong id="countFilteredVouchers" style="color: #0f172a;"><?= $countTotalV ?></strong> / <?= $countTotalV ?>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 4. Data Table -->
                <div class="dash-card" style="padding: 0; overflow-x: auto;">
                    <div class="data-table-card" style="margin: 0; border: none; border-radius: 0; min-width: 1060px;">
                        <table class="dash-table" id="vouchersTable">
                            <thead>
                                <tr>
                                    <th style="width: 200px;">Mã Voucher</th>
                                    <th style="width: 160px;">Loại Ưu Đãi</th>
                                    <th>Mức Giảm & Điều Kiện</th>
                                    <th style="width: 150px;">Lượt Dùng</th>
                                    <th style="width: 135px;">Thời Hạn</th>
                                    <th style="width: 120px;">Trạng Thái</th>
                                    <th style="text-align: right; width: 130px;">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($vouchers as $v):
                                    $kind = $v['kind'] ?? '';
                                    $maxUses = (int) ($v['max_uses'] ?? 1000);
                                    $usedUses = (int) ($v['used'] ?? 0);
                                    $percentUsed = min(100, (int) round(($usedUses / max(1, $maxUses)) * 100));
                                    $minSpend = (int) ($v['minimum'] ?? 0);
                                    $capVal = !empty($v['cap']) ? (int) $v['cap'] : null;
                                    $validUntil = !empty($v['valid_until']) ? (int) $v['valid_until'] : null;
                                    $daysRemaining = $validUntil ? (int) ceil(($validUntil - time()) / 86400) : null;
                                    $progressColor = ($percentUsed > 80) ? '#dc2626' : (($percentUsed > 40) ? '#d97706' : '#16a34a');
                                    
                                    $kindLabel = match($kind) {
                                        'shipping' => '🚚 Miễn phí vận chuyển',
                                        'percentage' => '🏷️ Giảm theo %',
                                        'fixed' => '💵 Giảm tiền trực tiếp',
                                        default => 'Khác'
                                    };
                                    
                                    $valDisplay = ($kind === 'percentage') ? $v['value'] . '%' : '-' . $money($v['value']);
                                ?>
                                <tr class="voucher-data-row" 
                                    data-code="<?= mb_strtolower($e($v['code'])) ?>" 
                                    data-kind="<?= $e($kind) ?>" 
                                    data-minimum="<?= $minSpend ?>">
                                    <td>
                                        <div class="voucher-ticket-code" title="Nhấn để sao chép mã" onclick="copySingleVoucher('<?= $e($v['code']) ?>')">
                                            <span style="opacity: 0.6; font-size: 0.75rem;">✂️</span>
                                            <span><?= $e($v['code']) ?></span>
                                            <span style="font-size: 0.78rem; opacity: 0.7; margin-left: 0.35rem;" title="Chép mã">📋</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="voucher-kind-badge <?= $kind ?>">
                                            <?= $kindLabel ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                                            <strong style="color: #dc2626; font-size: 0.96rem; font-weight: 800;"><?= $valDisplay ?></strong>
                                            <div style="font-size: 0.76rem; color: #64748b; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                                <span>🛒 <?= $minSpend > 0 ? 'Đơn từ ' . $money($minSpend) : 'Đơn từ 0 ₫' ?></span>
                                                <?php if ($kind === 'percentage' && $capVal): ?>
                                                    <span style="color: #6d28d9; font-weight: 600;">(Tối đa <?= $money($capVal) ?>)</span>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="min-width: 130px;">
                                            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: #334155; margin-bottom: 0.3rem;">
                                                <span><?= number_format($usedUses, 0, ',', '.') ?> / <?= number_format($maxUses, 0, ',', '.') ?></span>
                                                <span style="color: <?= $progressColor ?>;"><?= $percentUsed ?>%</span>
                                            </div>
                                            <div style="height: 6px; background: #e2e8f0; border-radius: 999px; overflow: hidden;">
                                                <div style="width: <?= max(4, $percentUsed) ?>%; height: 100%; background: <?= $progressColor ?>; border-radius: 999px;"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                                            <span style="font-size: 0.84rem; font-weight: 650; color: #0f172a;">
                                                <?= $validUntil ? date('d/m/Y', $validUntil) : 'Vô thời hạn' ?>
                                            </span>
                                            <?php if ($daysRemaining !== null): ?>
                                                <span style="font-size: 0.72rem; color: <?= $daysRemaining < 30 ? '#dc2626' : '#16a34a' ?>; font-weight: 600;">
                                                    <?= $daysRemaining > 0 ? "⏳ Còn {$daysRemaining} ngày" : "⚠️ Đã hết hạn" ?>
                                                </span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="stock-tag good" style="font-size: 0.72rem; padding: 0.25rem 0.65rem; white-space: nowrap;">
                                            🟢 Đang áp dụng
                                        </span>
                                    </td>
                                    <td style="text-align: right;">
                                        <div style="display: inline-flex; align-items: center; justify-content: flex-end; gap: 0.65rem;">
                                            <button type="button" class="btn-voucher-action" title="Sao chép mã" onclick="copySingleVoucher('<?= $e($v['code']) ?>')">
                                                📋
                                            </button>
                                            <button type="button" class="btn-voucher-action" title="Chỉnh sửa voucher" onclick='openEditVoucherModal(<?= json_encode($v) ?>)'>
                                                ✏️
                                            </button>
                                            <button type="button" class="btn-voucher-action delete" title="Xóa voucher" onclick="confirmDeleteVoucher('<?= $e($v['code']) ?>')">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>

                        <!-- Empty search state -->
                        <div id="emptyVouchersNotice" style="display: none; text-align: center; padding: 3rem 1.5rem; color: #64748b;">
                            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔍</div>
                            <h4 style="margin: 0 0 0.25rem; color: #334155;">Không tìm thấy mã voucher phù hợp</h4>
                            <p style="margin: 0; font-size: 0.85rem;">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- =============================================================
                 PANE 6: TIN NHẮN LIÊN HỆ (CONTACTS)
                 ============================================================= -->
            <section class="admin-view-pane" id="pane-contacts">
                <div class="dash-card">
                    <div class="dash-card-header">
                        <h3 class="dash-card-title"><span>💬</span> Tin Nhắn & Phản Hồi Từ Khách Hàng</h3>
                        <span style="font-size: 0.84rem; color: #64748b;">20 tin nhắn gần nhất</span>
                    </div>

                    <?php if (empty($contacts)): ?>
                        <div style="text-align: center; padding: 3rem 1.5rem; color: #64748b;">
                            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">✉️</div>
                            <h4 style="margin: 0 0 0.25rem; color: #334155;">Chưa có tin nhắn liên hệ nào</h4>
                            <p style="margin: 0; font-size: 0.85rem;">Phản hồi gửi qua trang Liên Hệ sẽ được lưu trữ tại đây.</p>
                        </div>
                    <?php else: ?>
                        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                            <?php foreach ($contacts as $cnt): ?>
                                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                                        <div>
                                            <strong style="color: #0f172a;"><?= $e($cnt['name']) ?></strong>
                                            <span style="color: #64748b; font-size: 0.82rem; margin-left: 0.5rem;">✉️ <?= $e($cnt['email']) ?></span>
                                        </div>
                                        <span style="font-size: 0.76rem; color: #94a3b8;"><?= $e($cnt['created_at'] ?? '') ?></span>
                                    </div>
                                    <div style="font-size: 0.88rem; color: #334155; line-height: 1.5;">
                                        <?= nl2br($e($cnt['message'])) ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </section>

            <!-- =============================================================
                 PANE 7: CẤU HÌNH & HỆ THỐNG (SETTINGS)
                 ============================================================= -->
            <section class="admin-view-pane" id="pane-settings">
                <div class="dash-card">
                    <div class="dash-card-header">
                        <h3 class="dash-card-title"><span>⚙️</span> Thông Tin Cấu Hình Hệ Thống</h3>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem;">
                            <h4 style="margin: 0 0 0.75rem; font-size: 0.95rem; color: #0f172a;">🖥️ Môi trường thực thi</h4>
                            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.86rem; line-height: 2;">
                                <li><strong>Địa chỉ chạy:</strong> <code>http://localhost:3000</code></li>
                                <li><strong>Phiên bản PHP:</strong> <?= PHP_VERSION ?> (cli-server)</li>
                                <li><strong>Cơ sở dữ liệu:</strong> SQLite (PDO pdo_sqlite)</li>
                                <li><strong>Đường dẫn DB:</strong> <code>php-mvc/storage/sachhay.sqlite</code></li>
                                <li><strong>File xác thực:</strong> <code>.sachhay-admin.hash</code></li>
                            </ul>
                        </div>

                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.25rem;">
                            <h4 style="margin: 0 0 0.75rem; font-size: 0.95rem; color: #0f172a;">🔑 Đổi mật khẩu tài khoản Admin</h4>
                            <p style="font-size: 0.84rem; color: #475569; line-height: 1.5; margin: 0 0 0.75rem;">
                                Mật khẩu hiện tại: <code>Admin@123456</code>.<br>
                                Để cập nhật mật khẩu mới, chạy lệnh sau trong terminal:
                            </p>
                            <pre style="background: #0f172a; color: #f8fafc; padding: 0.75rem; border-radius: 8px; font-size: 0.82rem; overflow-x: auto; margin: 0;">php scripts/set-admin-password.php</pre>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <!-- Admin Bottom Footer -->
        <footer class="admin-bottom-footer">
            <span>© <?= date('Y') ?> <strong>Nhà Sách Sách Hay</strong> — Hệ Thống Quản Trị Doanh Nghiệp</span>
            <span>Phiên bản v2.0 Enterprise · PHP 8.3 MVC · SQLite</span>
        </footer>
    </main>
</div>

<!-- =========================================================================
     MODAL THÊM / SỬA SÁCH (MODAL POPUP)
     ========================================================================= -->
<div class="admin-modal-overlay" id="bookModalDialog" onclick="checkModalBackdrop(event)">
    <div class="admin-modal-box" role="dialog" aria-modal="true" aria-labelledby="modalHeading">
        <div class="modal-head">
            <h3 id="modalHeading">Thêm Sách Mới</h3>
            <button type="button" class="modal-btn-close" onclick="closeBookModalDialog()">&times;</button>
        </div>

        <form action="/admin" method="post" enctype="multipart/form-data" id="mainBookForm">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <input type="hidden" name="action" value="save">
            <input type="hidden" name="id" id="fieldBookId" value="">
            <input type="hidden" name="expectedStock" id="fieldExpectedStock" value="">

            <div class="modal-form-grid">
                <!-- Tên sách -->
                <div class="form-group-field span-2">
                    <label for="inputTitle">Tên tựa sách <span style="color: #dc2626;">*</span></label>
                    <input type="text" id="inputTitle" name="title" required maxlength="160" placeholder="Ví dụ: Đắc Nhân Tâm (Bìa Cứng)">
                </div>

                <!-- Tác giả & NXB -->
                <div class="form-group-field span-third">
                    <label for="inputAuthor">Tác giả <span style="color: #dc2626;">*</span></label>
                    <input type="text" id="inputAuthor" name="author" required maxlength="160" placeholder="Ví dụ: Dale Carnegie">
                </div>
                <div class="form-group-field span-third">
                    <label for="inputPublisher">Nhà xuất bản <span style="color: #dc2626;">*</span></label>
                    <input type="text" id="inputPublisher" name="publisher" required maxlength="160" placeholder="Ví dụ: NXB Tổng Hợp">
                </div>

                <!-- Danh mục & ISBN -->
                <div class="form-group-field span-third">
                    <label for="inputCategory">Danh mục <span style="color: #dc2626;">*</span></label>
                    <input list="catDatalistOptions" id="inputCategory" name="categoryName" required maxlength="160" placeholder="Chọn hoặc nhập danh mục">
                    <datalist id="catDatalistOptions">
                        <?php foreach ($categoriesList as $c): ?>
                            <option value="<?= $e($c) ?>"></option>
                        <?php endforeach; ?>
                    </datalist>
                </div>
                <div class="form-group-field span-third">
                    <label for="inputIsbn">Mã ISBN <span style="color: #dc2626;">*</span></label>
                    <input type="text" id="inputIsbn" name="isbn" required maxlength="40" placeholder="Ví dụ: 8935244880012">
                </div>

                <!-- Giá bán, Giá gốc, Tồn kho -->
                <div class="form-group-field">
                    <label for="inputPrice">Giá bán (VNĐ) <span style="color: #dc2626;">*</span></label>
                    <input type="number" id="inputPrice" name="price" min="0" required placeholder="Ví dụ: 78000">
                </div>
                <div class="form-group-field">
                    <label for="inputOriginalPrice">Giá bìa gốc (VNĐ) <span style="color: #dc2626;">*</span></label>
                    <input type="number" id="inputOriginalPrice" name="originalPrice" min="0" required placeholder="Ví dụ: 98000">
                </div>
                <div class="form-group-field span-2">
                    <label for="inputStock">Số lượng tồn kho <span style="color: #dc2626;">*</span></label>
                    <input type="number" id="inputStock" name="stock" min="0" required placeholder="Ví dụ: 100">
                </div>

                <!-- Ảnh bìa sách -->
                <div class="form-group-field span-2">
                    <label>Ảnh bìa sách <span id="starCoverMark" style="color: #dc2626;">*</span></label>
                    <div style="display: flex; gap: 1rem; align-items: center; background: #f8fafc; padding: 0.85rem; border-radius: 10px; border: 1px dashed #cbd5e1;">
                        <img id="imgPreviewCover" src="https://placehold.co/100x140?text=Ch%C6%B0a+c%C3%B3+%E1%BA%A3nh" alt="Xem trước bìa" style="width: 60px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1; background: #e2e8f0;">
                        <div style="flex: 1;">
                            <input type="file" id="fileCoverInput" name="cover" accept="image/jpeg,image/png,image/webp" onchange="renderLocalCoverPreview(this)">
                            <div style="font-size: 0.76rem; color: #64748b; margin-top: 0.35rem;">
                                Chấp nhận ảnh JPG, PNG, WebP. Tự động nén và co tỷ lệ tối ưu.
                                <span id="hintCoverEdit" style="display: none; color: #0284c7;">(Để trống nếu giữ nguyên ảnh hiện tại)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mô tả chi tiết -->
                <div class="form-group-field span-2">
                    <label for="inputDescription">Mô tả tóm tắt nội dung</label>
                    <textarea id="inputDescription" name="description" rows="4" maxlength="6000" placeholder="Nhập tóm tắt nội dung sách hoặc bài học tác phẩm..."></textarea>
                </div>
            </div>

            <div class="modal-foot">
                <button type="button" class="btn-modal-cancel" onclick="closeBookModalDialog()">Hủy bỏ</button>
                <button type="submit" class="btn-topbar-action">
                    <span>Lưu Tựa Sách</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- =========================================================================
     MODAL THÊM / SỬA MÃ GIẢM GIÁ (VOUCHER MODAL POPUP)
     ========================================================================= -->
<div class="admin-modal-overlay" id="voucherModalDialog" onclick="checkVoucherModalBackdrop(event)">
    <div class="admin-modal-box" role="dialog" aria-modal="true" aria-labelledby="voucherModalHeading" style="max-width: 640px;">
        <div class="modal-head">
            <h3 id="voucherModalHeading">Tạo Mã Giảm Giá Mới</h3>
            <button type="button" class="modal-btn-close" onclick="closeVoucherModalDialog()">&times;</button>
        </div>

        <form action="/admin" method="post" id="mainVoucherForm">
            <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
            <input type="hidden" name="action" value="save_voucher">

            <div class="modal-form-grid">
                <!-- Mã Voucher -->
                <div class="form-group-field span-2">
                    <label for="inputVoucherCode">Mã Voucher (Code) <span style="color: #dc2626;">*</span></label>
                    <input type="text" id="inputVoucherCode" name="code" required maxlength="40" placeholder="VD: SALE50K, FREESHIP30K..." style="text-transform: uppercase; font-family: monospace; font-weight: 700;" oninput="this.value = this.value.toUpperCase()">
                    <span style="font-size: 0.74rem; color: #64748b; margin-top: 0.2rem;">Viết hoa liền không dấu, khách hàng nhập mã này khi thanh toán.</span>
                </div>

                <!-- Loại Ưu Đãi -->
                <div class="form-group-field span-2">
                    <label for="selectVoucherKind">Loại Ưu Đãi <span style="color: #dc2626;">*</span></label>
                    <select id="selectVoucherKind" name="kind" required onchange="handleVoucherKindChange()">
                        <option value="shipping">🚚 Miễn phí vận chuyển (Trừ thẳng vào phí ship)</option>
                        <option value="percentage">🏷️ Giảm theo % đơn hàng (Chiết khấu tỷ lệ)</option>
                        <option value="fixed">💵 Giảm tiền trực tiếp (Trừ cố định vào tổng bill)</option>
                    </select>
                </div>

                <!-- Mức giảm & Đơn hàng tối thiểu -->
                <div class="form-group-field">
                    <label id="labelVoucherValue" for="inputVoucherValue">Mức giảm (VNĐ) <span style="color: #dc2626;">*</span></label>
                    <input type="number" id="inputVoucherValue" name="value" min="1" required placeholder="VD: 25000">
                </div>

                <div class="form-group-field">
                    <label for="inputVoucherMinimum">Đơn hàng tối thiểu (VNĐ)</label>
                    <input type="number" id="inputVoucherMinimum" name="minimum" min="0" value="0" placeholder="VD: 150000">
                </div>

                <!-- Giảm tối đa (Cap) - Dành riêng cho giảm % -->
                <div class="form-group-field span-2" id="boxVoucherCap" style="display: none;">
                    <label for="inputVoucherCap">Mức giảm tối đa (VNĐ) - Dành cho chiết khấu %</label>
                    <input type="number" id="inputVoucherCap" name="cap" min="0" placeholder="VD: 50000 (Để trống nếu không giới hạn trần)">
                </div>

                <!-- Lượt dùng tối đa & Ngày hết hạn -->
                <div class="form-group-field">
                    <label for="inputVoucherMaxUses">Giới hạn số lượt dùng</label>
                    <input type="number" id="inputVoucherMaxUses" name="max_uses" min="1" value="1000" placeholder="VD: 1000">
                </div>

                <div class="form-group-field">
                    <label for="inputVoucherValidUntil">Thời hạn áp dụng (Hết hạn)</label>
                    <input type="date" id="inputVoucherValidUntil" name="valid_until">
                </div>
            </div>

            <div class="modal-foot">
                <button type="button" class="btn-modal-cancel" onclick="closeVoucherModalDialog()">Hủy bỏ</button>
                <button type="submit" class="btn-topbar-action" style="background: #ef4444;">
                    <span>Lưu Mã Giảm Giá</span>
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Form xóa voucher ẩn -->
<form id="deleteVoucherForm" action="/admin" method="post" style="display: none;">
    <input type="hidden" name="csrf" value="<?= $e($csrf) ?>">
    <input type="hidden" name="action" value="delete_voucher">
    <input type="hidden" name="code" id="deleteVoucherCodeInput" value="">
</form>

<!-- Toast thông báo nổi -->
<div class="voucher-toast" id="voucherToastNotification">
    <span style="font-size: 1.2rem;">📋</span>
    <span id="voucherToastMessage">Đã sao chép mã vào bộ nhớ tạm!</span>
</div>

<!-- =========================================================================
     JAVASCRIPT CHỨC NĂNG
     ========================================================================= -->
<script>
// Chuyển đổi mục Sidebar Navigation
function selectAdminSection(sectionKey) {
    document.querySelectorAll('.sidebar-item-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.nav === sectionKey);
    });
    document.querySelectorAll('.admin-view-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === 'pane-' + sectionKey);
    });

    const titles = {
        dashboard: 'Bảng Điều Khiển Tổng Quan',
        revenue: 'Báo Cáo & Phân Tích Doanh Thu',
        orders: 'Quản Lý Đơn Đặt Hàng',
        books: 'Quản Lý Kho Sản Phẩm',
        vouchers: 'Mã Giảm Giá & Khuyến Mãi',
        contacts: 'Tin Nhắn & Phản Hồi Khách Hàng',
        settings: 'Cấu Hình Hệ Thống'
    };
    const titleEl = document.getElementById('pageTitleText');
    if (titleEl && titles[sectionKey]) {
        titleEl.textContent = titles[sectionKey];
    }

    if (history.replaceState) {
        history.replaceState(null, '', '#' + sectionKey);
    }
}

// Khởi tạo tab từ URL hash nếu có
window.addEventListener('DOMContentLoaded', () => {
    const hash = location.hash.replace('#', '');
    if (hash && ['dashboard', 'revenue', 'orders', 'books', 'vouchers', 'contacts', 'settings'].includes(hash)) {
        selectAdminSection(hash);
    }
});

// Tìm kiếm lọc bảng doanh thu
function filterRevenueTable() {
    const q = document.getElementById('searchRevenueOrder').value.trim().toLowerCase();
    const rows = document.querySelectorAll('.revenue-row-item');
    rows.forEach(r => {
        const code = r.dataset.code || '';
        const customer = r.dataset.customer || '';
        if (!q || code.includes(q) || customer.includes(q)) {
            r.style.display = '';
        } else {
            r.style.display = 'none';
        }
    });
}

// Xuất file CSV báo cáo doanh thu có UTF-8 BOM chuẩn cho Excel
function exportRevenueToCsv() {
    const rows = document.querySelectorAll('#revenueDataTable tbody tr');
    let csvContent = "\uFEFF"; // UTF-8 BOM để Excel đọc tiếng Việt không lỗi
    csvContent += "Mã đơn hàng,Thời gian đặt,Khách hàng,Hình thức thanh toán,Doanh thu (VNĐ),Trạng thái đơn,Trạng thái thanh toán\n";

    rows.forEach(r => {
        const cols = r.querySelectorAll('td');
        if (cols.length >= 7) {
            const code = cols[0].innerText.replace(/#/g, '').trim();
            const date = cols[1].innerText.trim();
            const customer = cols[2].innerText.replace(/\n/g, ' - ').trim();
            const method = cols[3].innerText.trim();
            const amount = cols[4].innerText.replace(/[₫.\s]/g, '').trim();
            const status = cols[5].innerText.trim();
            const payment = cols[6].innerText.trim();

            csvContent += `"${code}","${date}","${customer}","${method}","${amount}","${status}","${payment}"\n`;
        }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Bao_Cao_Doanh_Thu_Sach_Hay_' + new Date().toISOString().slice(0,10) + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Tìm kiếm và lọc sách tức thì
function handleBookFiltering() {
    const q = document.getElementById('liveSearchBook').value.trim().toLowerCase();
    const cat = document.getElementById('liveCategoryFilter').value;
    const stock = document.getElementById('liveStockFilter').value;

    const rows = document.querySelectorAll('.book-data-row');
    let matched = 0;

    rows.forEach(r => {
        const title = r.dataset.title || '';
        const author = r.dataset.author || '';
        const publisher = r.dataset.publisher || '';
        const isbn = r.dataset.isbn || '';
        const rowCat = r.dataset.category || '';
        const rowStock = r.dataset.stockState || '';

        const okQ = !q || title.includes(q) || author.includes(q) || publisher.includes(q) || isbn.includes(q);
        const okCat = !cat || rowCat === cat;
        const okStock = !stock || rowStock === stock;

        if (okQ && okCat && okStock) {
            r.style.display = '';
            matched++;
        } else {
            r.style.display = 'none';
        }
    });

    document.getElementById('countFilteredBooks').textContent = matched;
    document.getElementById('emptySearchNotice').style.display = (matched === 0) ? 'block' : 'none';
}

// Lọc đơn hàng theo trạng thái
function filterOrdersByStatus(st) {
    const items = document.querySelectorAll('.order-item-card');
    items.forEach(it => {
        if (st === 'all' || it.dataset.orderState === st) {
            it.style.display = '';
        } else {
            it.style.display = 'none';
        }
    });
}

// Mở modal thêm sách mới
function openBookModalDialog() {
    const f = document.getElementById('mainBookForm');
    f.reset();
    document.getElementById('modalHeading').textContent = 'Thêm Sách Mới Vào Kho';
    document.getElementById('fieldBookId').value = '';
    document.getElementById('fieldExpectedStock').value = '';
    document.getElementById('starCoverMark').style.display = 'inline';
    document.getElementById('hintCoverEdit').style.display = 'none';
    document.getElementById('fileCoverInput').required = true;
    document.getElementById('imgPreviewCover').src = 'https://placehold.co/100x140?text=Ch%C6%B0a+c%C3%B3+%E1%BA%A3nh';

    document.getElementById('bookModalDialog').classList.add('active');
}

// Mở modal sửa sách
function editBookModalDialog(b) {
    const f = document.getElementById('mainBookForm');
    f.reset();
    document.getElementById('modalHeading').textContent = 'Chỉnh Sửa: ' + (b.title || '');
    document.getElementById('fieldBookId').value = b.id || '';
    document.getElementById('fieldExpectedStock').value = b.stock ?? 0;

    document.getElementById('inputTitle').value = b.title || '';
    document.getElementById('inputAuthor').value = b.author || '';
    document.getElementById('inputPublisher').value = b.publisher || '';
    document.getElementById('inputCategory').value = b.categoryName || '';
    document.getElementById('inputIsbn').value = b.isbn || '';
    document.getElementById('inputPrice').value = b.price ?? 0;
    document.getElementById('inputOriginalPrice').value = b.originalPrice ?? b.price ?? 0;
    document.getElementById('inputStock').value = b.stock ?? 0;
    document.getElementById('inputDescription').value = b.description || '';

    document.getElementById('starCoverMark').style.display = 'none';
    document.getElementById('hintCoverEdit').style.display = 'inline';
    document.getElementById('fileCoverInput').required = false;

    document.getElementById('imgPreviewCover').src = b.coverImage || 'https://placehold.co/100x140?text=Ch%C6%B0a+c%C3%B3+%E1%BA%A3nh';

    document.getElementById('bookModalDialog').classList.add('active');
}

// Đóng modal
function closeBookModalDialog() {
    document.getElementById('bookModalDialog').classList.remove('active');
}

function checkModalBackdrop(e) {
    if (e.target === document.getElementById('bookModalDialog')) {
        closeBookModalDialog();
    }
}

// Xem trước ảnh bìa ngay khi chọn file
function renderLocalCoverPreview(inp) {
    if (inp.files && inp.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imgPreviewCover').src = e.target.result;
        };
        reader.readAsDataURL(inp.files[0]);
    }
}

// =========================================================================
// JAVASCRIPT QUẢN LÝ MÃ GIẢM GIÁ (VOUCHER)
// =========================================================================

// Hiển thị toast thông báo
let voucherToastTimer = null;
function showVoucherToast(msg) {
    const toast = document.getElementById('voucherToastNotification');
    const msgEl = document.getElementById('voucherToastMessage');
    if (!toast || !msgEl) return;
    
    msgEl.textContent = msg;
    toast.classList.add('show');
    
    if (voucherToastTimer) clearTimeout(voucherToastTimer);
    voucherToastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Sao chép 1 mã voucher
function copySingleVoucher(code) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            showVoucherToast(`Đã chép mã "${code}" vào bộ nhớ tạm!`);
        }).catch(() => {
            fallbackCopyText(code);
        });
    } else {
        fallbackCopyText(code);
    }
}

function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showVoucherToast(`Đã sao chép mã "${text}"!`);
    } catch(e) {}
    document.body.removeChild(ta);
}

// Sao chép toàn bộ mã voucher
function copyAllVoucherCodes() {
    const rows = document.querySelectorAll('.voucher-data-row');
    const codes = [];
    rows.forEach(r => {
        const span = r.querySelector('.voucher-ticket-code span:last-child');
        if (span) {
            const c = span.textContent.trim();
            if (c) codes.push(c);
        }
    });
    
    if (codes.length > 0) {
        const text = codes.join(', ');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showVoucherToast(`Đã sao chép toàn bộ ${codes.length} mã voucher!`);
            });
        } else {
            fallbackCopyText(text);
        }
    }
}

// Bộ lọc loại ưu đãi
let currentVoucherKind = 'all';
function setVoucherKindFilter(kind, btnEl) {
    currentVoucherKind = kind;
    document.querySelectorAll('.voucher-filter-pill').forEach(b => {
        b.classList.toggle('active', b.dataset.vkind === kind);
    });
    filterVouchersTable();
}

// Lọc bảng voucher theo từ khóa, loại và đơn tối thiểu
function filterVouchersTable() {
    const q = (document.getElementById('liveSearchVoucher')?.value || '').trim().toLowerCase();
    const minSpendFilter = document.getElementById('voucherMinSpendFilter')?.value || 'all';
    const rows = document.querySelectorAll('.voucher-data-row');
    let matched = 0;

    rows.forEach(r => {
        const code = r.dataset.code || '';
        const kind = r.dataset.kind || '';
        const minSpend = parseInt(r.dataset.minimum || '0', 10);

        const okQ = !q || code.includes(q);
        const okKind = currentVoucherKind === 'all' || kind === currentVoucherKind;
        let okSpend = true;
        if (minSpendFilter !== 'all') {
            const reqMin = parseInt(minSpendFilter, 10);
            if (reqMin === 0) {
                okSpend = (minSpend === 0);
            } else {
                okSpend = (minSpend >= reqMin);
            }
        }

        if (okQ && okKind && okSpend) {
            r.style.display = '';
            matched++;
        } else {
            r.style.display = 'none';
        }
    });

    const countEl = document.getElementById('countFilteredVouchers');
    if (countEl) countEl.textContent = matched;
    const emptyEl = document.getElementById('emptyVouchersNotice');
    if (emptyEl) emptyEl.style.display = (matched === 0) ? 'block' : 'none';
}

// Thay đổi định dạng trường khi đổi loại ưu đãi
function handleVoucherKindChange() {
    const kind = document.getElementById('selectVoucherKind').value;
    const valLabel = document.getElementById('labelVoucherValue');
    const valInp = document.getElementById('inputVoucherValue');
    const capBox = document.getElementById('boxVoucherCap');

    if (kind === 'percentage') {
        valLabel.innerHTML = 'Tỷ lệ chiết khấu (%) <span style="color: #dc2626;">*</span>';
        valInp.placeholder = 'VD: 15 (tương đương giảm 15%)';
        valInp.max = 100;
        if (capBox) capBox.style.display = 'block';
    } else {
        valLabel.innerHTML = 'Mức giảm (VNĐ) <span style="color: #dc2626;">*</span>';
        valInp.placeholder = (kind === 'shipping') ? 'VD: 25000' : 'VD: 50000';
        valInp.removeAttribute('max');
        if (capBox) capBox.style.display = 'none';
    }
}

// Mở modal tạo voucher mới
function openVoucherModal() {
    const f = document.getElementById('mainVoucherForm');
    f.reset();
    document.getElementById('voucherModalHeading').textContent = 'Tạo Mã Giảm Giá Mới';
    const codeInp = document.getElementById('inputVoucherCode');
    codeInp.readOnly = false;
    codeInp.style.background = '#ffffff';
    document.getElementById('inputVoucherValue').value = '';
    document.getElementById('inputVoucherMinimum').value = 0;
    document.getElementById('inputVoucherCap').value = '';
    document.getElementById('inputVoucherMaxUses').value = 1000;

    // Mặc định hạn dùng 1 năm kể từ hôm nay
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    document.getElementById('inputVoucherValidUntil').value = nextYear.toISOString().slice(0, 10);

    handleVoucherKindChange();
    document.getElementById('voucherModalDialog').classList.add('active');
}

// Mở modal sửa voucher
function openEditVoucherModal(v) {
    const f = document.getElementById('mainVoucherForm');
    f.reset();
    document.getElementById('voucherModalHeading').textContent = 'Chỉnh Sửa Mã: ' + (v.code || '');
    const codeInp = document.getElementById('inputVoucherCode');
    codeInp.value = v.code || '';
    codeInp.readOnly = true;
    codeInp.style.background = '#f1f5f9';

    document.getElementById('selectVoucherKind').value = v.kind || 'shipping';
    document.getElementById('inputVoucherValue').value = v.value ?? '';
    document.getElementById('inputVoucherMinimum').value = v.minimum ?? 0;
    document.getElementById('inputVoucherCap').value = v.cap ?? '';
    document.getElementById('inputVoucherMaxUses').value = v.max_uses ?? 1000;

    if (v.valid_until) {
        const d = new Date(parseInt(v.valid_until, 10) * 1000);
        document.getElementById('inputVoucherValidUntil').value = d.toISOString().slice(0, 10);
    } else {
        document.getElementById('inputVoucherValidUntil').value = '';
    }

    handleVoucherKindChange();
    document.getElementById('voucherModalDialog').classList.add('active');
}

// Đóng modal voucher
function closeVoucherModalDialog() {
    document.getElementById('voucherModalDialog').classList.remove('active');
}

function checkVoucherModalBackdrop(e) {
    if (e.target === document.getElementById('voucherModalDialog')) {
        closeVoucherModalDialog();
    }
}

// Xác nhận và xóa voucher
function confirmDeleteVoucher(code) {
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn mã giảm giá "${code}" không?`)) {
        document.getElementById('deleteVoucherCodeInput').value = code;
        document.getElementById('deleteVoucherForm').submit();
    }
}
</script>
