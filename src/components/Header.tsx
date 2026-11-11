import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useMatch } from 'react-router';
import { useStore } from '../context/StoreContext';
import { storeContact, storePhoneHref } from '../data/storeContact';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Bell,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  Phone,
  Truck,
  ShieldCheck,
  Heart,
  Settings,
  LogOut,
  Sparkles,
  Layers,
  Smile,
  TrendingUp,
  Globe,
  PenTool,
  GraduationCap
} from 'lucide-react';
import { Book } from '../types';

interface HeaderProps {
  onOpenOrderLookup: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOrderLookup }) => {
  const isAboutPage = Boolean(useMatch('/about'));
  const {
    activeView,
    setActiveView,
    categories,
    cart,
    totalCartItemCount,
    currentUser,
    logoutAdmin,
    books,
    openBookDetail,
    searchQuery,
    setSearchQuery,
    selectedCategorySlug,
    setSelectedCategorySlug,
    wishlist
  } = useStore();
  const isCatalog = !isAboutPage && activeView === 'catalog';
  const isAllBooks = isCatalog && !selectedCategorySlug && !searchQuery.trim();
  const isCurrentCategory = (slug: string) => isCatalog && selectedCategorySlug === slug;
  const catalogTabClass = 'whitespace-nowrap border-b-2 border-transparent pb-1 text-slate-700 transition-colors hover:text-slate-950 aria-[current=page]:border-[#C92127] aria-[current=page]:font-bold aria-[current=page]:text-[#C92127]';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<Book[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchInput.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      const query = searchInput.toLowerCase().trim();
      const matches = books.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.isbn.toLowerCase().includes(query) ||
          b.categoryName.toLowerCase().includes(query)
      );
      setSuggestions(matches.slice(0, 5));
    }, 200);

    return () => clearTimeout(timer);
  }, [searchInput, books]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      setSelectedCategorySlug(null);
      setActiveView('catalog');
      setIsSearchOpen(false);
    }
  };

  const handleSelectSuggestion = (book: Book) => {
    setIsSearchOpen(false);
    setSearchInput('');
    openBookDetail(book);
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategorySlug(slug);
    setSearchQuery('');
    setActiveView('catalog');
    setIsCategoryDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-[#C92127]" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-[#C92127]" />;
      case 'Smile':
        return <Smile className="w-4 h-4 text-[#C92127]" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-[#C92127]" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-[#C92127]" />;
      case 'Globe':
        return <Globe className="w-4 h-4 text-[#C92127]" />;
      case 'PenTool':
        return <PenTool className="w-4 h-4 text-[#C92127]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-[#C92127]" />;
      default:
        return <BookOpen className="w-4 h-4 text-[#C92127]" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md bg-white">
      {/* 1. TOPBAR */}
      <div className="bg-[#8C1014] text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 opacity-90 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Hội Sách Sách Hay 2026: Giảm đến 50% + Freeship đơn từ 250.000đ
            </span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={onOpenOrderLookup}
              className="flex items-center gap-1.5 hover:text-amber-200 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Tra cứu đơn hàng</span>
            </button>

            <span className="opacity-40">|</span>

            {storePhoneHref ? (
              <a href={storePhoneHref} className="flex items-center gap-1.5 hover:text-amber-200 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span>Hotline: {storeContact.phone}</span>
              </a>
            ) : (
              <Link to="/about" className="hover:text-amber-200 transition-colors">Liên hệ</Link>
            )}

          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="bg-[#C92127] text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Sách Hay LOGO */}
          <button
            onClick={() => {
              setActiveView('home');
              setSelectedCategorySlug(null);
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-[#C92127]" />
            </div>
            <div className="leading-tight">
              <span className="text-2xl font-black tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
                Sách <span className="text-amber-300">Hay</span>
              </span>
              <span className="hidden sm:block text-[10px] text-white/80 tracking-widest uppercase font-medium">
                Nhà Sách Trực Tuyến
              </span>
            </div>
          </button>

          {/* LARGE SEARCH BAR WITH DEBOUNCE & DROPDOWN */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sách, tác giả, ISBN hoặc nhà xuất bản..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full bg-white text-slate-800 placeholder:text-slate-400 pl-4 pr-12 py-2.5 rounded-lg text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1.5 bg-[#C92127] text-white rounded-md hover:bg-[#A5181E] transition-colors flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* SEARCH SUGGESTIONS POPOVER */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in">
                {suggestions.length > 0 ? (
                  <div className="p-2">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Gợi ý kết quả phù hợp
                    </div>
                    {suggestions.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => handleSelectSuggestion(book)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md transition-colors text-left"
                      >
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded shadow-sm shrink-0 border border-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">
                            {book.title}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{book.author}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-[#C92127]">
                              {book.price.toLocaleString('vi-VN')}đ
                            </span>
                            {book.originalPrice > book.price && (
                              <span className="text-[11px] text-slate-400 line-through">
                                {book.originalPrice.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                    <div className="p-2 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full text-center text-xs font-semibold text-[#C92127] hover:underline"
                      >
                        Xem tất cả kết quả cho &quot;{searchInput}&quot; →
                      </button>
                    </div>
                  </div>
                ) : searchInput.trim().length > 1 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Không tìm thấy cuốn sách nào khớp với từ khóa &quot;{searchInput}&quot;.
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Từ khóa tìm kiếm phổ biến
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Cây Cam Ngọt Của Tôi', 'Đắc Nhân Tâm', 'One Piece', 'Paulo Coelho', 'Sách Kinh Tế'].map(
                        (tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSearchInput(tag);
                              setSearchQuery(tag);
                              setActiveView('catalog');
                              setIsSearchOpen(false);
                            }}
                            className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-[#C92127] hover:text-white rounded-md text-slate-700 transition-colors"
                          >
                            {tag}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTION BUTTONS (NOTIFICATION, CART, USER ACCOUNT) */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* NOTIFICATION */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
                title="Thông báo khuyến mãi"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 p-3 z-50">
                  <div className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                    <span>Thông báo mới</span>
                    <span className="text-[11px] text-[#C92127] font-semibold">Mới nhất</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2 bg-red-50 rounded border border-red-100">
                      <p className="font-semibold text-[#C92127]">Flash Sale 12:00 hôm nay!</p>
                      <p className="text-slate-600 mt-0.5">Giảm đến 50% top 100 tựa sách bán chạy nhất.</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <p className="font-semibold text-slate-800">Mã giảm 20.000đ đã sẵn sàng</p>
                      <p className="text-slate-600 mt-0.5">Nhập mã SACHHAY20K cho đơn hàng từ 150k.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CART ICON WITH BADGE */}
            <button
              onClick={() => {
                setActiveView('cart');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="relative flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors group"
              title="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-white" />
                {totalCartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-900 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                    {totalCartItemCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <span className="block text-white/80">Giỏ hàng</span>
                <span className="font-bold text-white">
                  {cart.length > 0 ? `${cart.length} sản phẩm` : 'Trống'}
                </span>
              </div>
            </button>

            {/* USER ACCOUNT DROPDOWN */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Tài khoản"
                aria-expanded={isUserMenuOpen}
                className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="hidden lg:block text-xs leading-tight">
                  <span className="block text-white/80">Tài khoản</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    {currentUser?.role === 'admin' && 'Quản Trị Viên'}
                    <ChevronDown className="w-3 h-3 text-white/80" />
                  </span>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">{currentUser ? 'Đang đăng nhập' : 'Chưa đăng nhập'}</p>
                    {currentUser && (
                      <>
                        <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-[#C92127] rounded">
                          Quản trị viên (Admin)
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setActiveView('account');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    Hồ sơ & Đơn hàng của tôi
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('account');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-slate-500" />
                    Sách yêu thích ({wishlist.length})
                  </button>

                  <button
                    onClick={() => {
                      onOpenOrderLookup();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Truck className="w-4 h-4 text-slate-500" />
                    Tra cứu tiến độ đơn
                  </button>

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      onClick={() => {
                        setActiveView('admin');
                        setIsUserMenuOpen(false);
                        window.scrollTo(0, 0);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {currentUser?.role === 'admin' ? 'Trang quản trị' : 'Đăng nhập quản trị'}
                    </button>
                    {currentUser?.role === 'admin' && (
                      <button onClick={() => { setIsUserMenuOpen(false); void logoutAdmin(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                        <LogOut className="w-4 h-4" /> Đăng xuất quản trị
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH BAR */}
        <div className="mt-2.5 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm tên sách, tác giả..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white text-slate-800 placeholder:text-slate-400 pl-3 pr-10 py-2 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="absolute right-1 px-2.5 py-1 bg-[#C92127] text-white rounded text-xs"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. NAVIGATION BAR (CATEGORIES & TABS) */}
      <div className="bg-white border-b border-[#E5E5E5] px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium">
          {/* CATEGORY MEGAMENU BUTTON */}
          <div ref={categoryMenuRef} className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-2.5 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold border-x border-[#E5E5E5] transition-colors"
            >
              <Menu className="w-4 h-4 text-[#C92127]" />
              <span className="uppercase tracking-wider">Danh mục sản phẩm</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                  isCategoryDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* MULTI-LEVEL DROPDOWN */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 w-64 bg-white border border-[#E5E5E5] shadow-2xl rounded-b-lg py-2 z-50 animate-in fade-in">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    aria-current={isCurrentCategory(cat.slug) ? 'page' : undefined}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-slate-700 transition-colors hover:bg-slate-100 aria-[current=page]:bg-red-50 aria-[current=page]:text-[#C92127]"
                  >
                    <div className="flex items-center gap-2.5">
                      {getCategoryIcon(cat.iconName)}
                      <span className="text-xs font-medium">{cat.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {cat.bookCount}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QUICK CATEGORY HORIZONTAL NAV */}
          <nav aria-label="Điều hướng chính" className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-[#C92127] whitespace-nowrap transition-colors ${
                !isAboutPage && activeView === 'home' ? 'text-[#C92127] font-bold border-b-2 border-[#C92127] pb-1' : 'text-slate-700'
              }`}
            >
              Trang Chủ
            </button>

            <button
              onClick={() => {
                setSelectedCategorySlug(null);
                setSearchQuery('');
                setActiveView('catalog');
              }}
              aria-current={isAllBooks ? 'page' : undefined}
              className={catalogTabClass}
            >
              Tất Cả Sách
            </button>

            <NavLink to="/about" className={({ isActive }) => `whitespace-nowrap transition-colors hover:text-[#C92127] ${isActive ? 'border-b-2 border-[#C92127] pb-1 font-bold text-[#C92127]' : 'text-slate-700'}`}>
              Về chúng tôi &amp; Liên hệ
            </NavLink>

            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                aria-current={isCurrentCategory(cat.slug) ? 'page' : undefined}
                className={catalogTabClass}
              >
                {cat.name}
              </button>
            ))}

          </nav>

          {/* POLICY TRUST BADGE */}
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Sách Thật Chính Hãng</span>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex">
          <div className="w-4/5 max-w-xs bg-white h-full overflow-y-auto p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-bold text-lg text-[#C92127]">Sách Hay Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-1 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav aria-label="Điều hướng trên điện thoại" className="mt-4 space-y-1">
                <button
                  onClick={() => {
                    setActiveView('home');
                    setIsMenuOpen(false);
                  }}
                  aria-current={!isAboutPage && activeView === 'home' ? 'page' : undefined}
                  className="w-full py-2 text-left font-semibold text-slate-800 aria-[current=page]:text-[#C92127]"
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => {
                    setSelectedCategorySlug(null);
                    setSearchQuery('');
                    setActiveView('catalog');
                    setIsMenuOpen(false);
                  }}
                  aria-current={isAllBooks ? 'page' : undefined}
                  className="w-full py-2 text-left font-semibold text-slate-800 aria-[current=page]:text-[#C92127]"
                >
                  Tất cả sách
                </button>
                <NavLink to="/about" onClick={() => setIsMenuOpen(false)} className="block py-2 font-semibold text-slate-800 aria-[current=page]:text-[#C92127]">
                  Về chúng tôi &amp; Liên hệ
                </NavLink>
                <div className="py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Danh mục sách
                </div>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCategoryClick(c.slug)}
                    aria-current={isCurrentCategory(c.slug) ? 'page' : undefined}
                    className="flex w-full items-center justify-between py-1.5 text-sm text-slate-700 aria-[current=page]:font-bold aria-[current=page]:text-[#C92127]"
                  >
                    <span>{c.name}</span>
                    <span className="text-xs text-slate-400">({c.bookCount})</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2">
              <button
                onClick={() => {
                  onOpenOrderLookup();
                  setIsMenuOpen(false);
                }}
                className="w-full py-2 bg-slate-100 rounded text-center text-xs font-medium text-slate-700"
              >
                Tra cứu đơn hàng
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    setActiveView('admin');
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-2 bg-[#C92127] text-white rounded text-center text-xs font-bold"
                >
                  Vào Trang Quản Trị
                </button>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}
    </header>
  );
};
