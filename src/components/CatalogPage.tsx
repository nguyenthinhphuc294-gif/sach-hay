import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from './BookCard';
import {
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const {
    books,
    categories,
    selectedCategorySlug,
    setSelectedCategorySlug,
    searchQuery,
    setSearchQuery,
    setActiveView
  } = useStore();

  // Filter states
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('bestseller');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Extract unique authors & publishers from dataset
  const authorsList = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.author))).filter(Boolean);
  }, [books]);

  const publishersList = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.publisher))).filter(Boolean);
  }, [books]);

  // Current active category
  const currentCategory = categories.find((c) => c.slug === selectedCategorySlug);
  const isPromotion = selectedCategorySlug === 'khuyen-mai';
  const categoryName = isPromotion ? 'Sách khuyến mãi' : currentCategory?.name;

  // Filter & Sort logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Category filter
        if (isPromotion && book.discountPercent <= 0) return false;
        if (!isPromotion && selectedCategorySlug && book.categoryId !== currentCategory?.id) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = book.title.toLowerCase().includes(q);
          const matchAuthor = book.author.toLowerCase().includes(q);
          const matchIsbn = book.isbn.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchIsbn) return false;
        }

        // Author filter
        if (selectedAuthor !== 'all' && book.author !== selectedAuthor) {
          return false;
        }

        // Publisher filter
        if (selectedPublisher !== 'all' && book.publisher !== selectedPublisher) {
          return false;
        }

        // Price range filter
        if (priceRange === 'under-50k' && book.price >= 50000) return false;
        if (priceRange === '50k-100k' && (book.price < 50000 || book.price > 100000)) return false;
        if (priceRange === '100k-200k' && (book.price < 100000 || book.price > 200000)) return false;
        if (priceRange === 'above-200k' && book.price <= 200000) return false;

        // Discounted only
        if (onlyDiscounted && book.discountPercent <= 0) return false;

        // In-stock only
        if (onlyInStock && book.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'bestseller') return b.soldCount - a.soldCount;
        if (sortBy === 'newest') return b.publicationYear - a.publicationYear;
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-az') return a.title.localeCompare(b.title, 'vi');
        return 0;
      });
  }, [
    books,
    selectedCategorySlug,
    currentCategory,
    isPromotion,
    searchQuery,
    selectedAuthor,
    selectedPublisher,
    priceRange,
    onlyDiscounted,
    onlyInStock,
    sortBy
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSelectedCategorySlug(null);
    setSearchQuery('');
    setSelectedAuthor('all');
    setSelectedPublisher('all');
    setPriceRange('all');
    setOnlyDiscounted(false);
    setOnlyInStock(false);
    setSortBy('bestseller');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 flex-wrap">
        <button
          onClick={() => setActiveView('home')}
          className="hover:text-[#C92127] transition-colors"
        >
          Trang chủ
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          onClick={() => {
            setSelectedCategorySlug(null);
            setSearchQuery('');
          }}
          className={`${
            !selectedCategorySlug && !searchQuery
              ? 'text-slate-900 font-bold'
              : 'hover:text-[#C92127]'
          }`}
        >
          Tất cả sách
        </button>

        {categoryName && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#C92127] font-bold">{categoryName}</span>
          </>
        )}

        {searchQuery && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#C92127] font-bold">Tìm kiếm: &quot;{searchQuery}&quot;</span>
          </>
        )}
      </nav>

      {/* 2-COLUMN LAYOUT: SIDEBAR (FILTERS) + PRODUCT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR FILTERS */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-3">
              <span className="flex items-center gap-2 font-bold text-sm text-slate-900 uppercase">
                <SlidersHorizontal className="w-4 h-4 text-[#C92127]" />
                Bộ Lọc Tìm Kiếm
              </span>
              <button
                onClick={resetFilters}
                className="text-xs text-[#C92127] hover:underline flex items-center gap-1"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Danh Mục Sách
              </h4>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategorySlug(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors flex items-center justify-between ${
                    !selectedCategorySlug
                      ? 'bg-red-50 text-[#C92127] font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Tất cả danh mục</span>
                  <span className="text-[11px] text-slate-400">{books.length}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategorySlug(c.slug);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-md transition-colors flex items-center justify-between ${
                      selectedCategorySlug === c.slug
                        ? 'bg-red-50 text-[#C92127] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {books.filter((b) => b.categoryId === c.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-5 border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Khoảng Giá (VND)
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {[
                  { id: 'all', label: 'Tất cả mức giá' },
                  { id: 'under-50k', label: 'Dưới 50.000đ' },
                  { id: '50k-100k', label: '50.000đ - 100.000đ' },
                  { id: '100k-200k', label: '100.000đ - 200.000đ' },
                  { id: 'above-200k', label: 'Trên 200.000đ' }
                ].map((range) => (
                  <label
                    key={range.id}
                    className="flex items-center gap-2 cursor-pointer hover:text-[#C92127]"
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange === range.id}
                      onChange={() => {
                        setPriceRange(range.id);
                        setCurrentPage(1);
                      }}
                      className="accent-[#C92127]"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Author Filter */}
            <div className="mb-5 border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Tác Giả
              </h4>
              <select
                value={selectedAuthor}
                onChange={(e) => {
                  setSelectedAuthor(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C92127]"
              >
                <option value="all">Tất cả tác giả ({authorsList.length})</option>
                {authorsList.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* Publisher Filter */}
            <div className="mb-5 border-t border-slate-100 pt-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Nhà Xuất Bản
              </h4>
              <select
                value={selectedPublisher}
                onChange={(e) => {
                  setSelectedPublisher(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#C92127]"
              >
                <option value="all">Tất cả NXB ({publishersList.length})</option>
                {publishersList.map((pub) => (
                  <option key={pub} value={pub}>
                    {pub}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Conditions */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer hover:text-[#C92127]">
                <input
                  type="checkbox"
                  checked={onlyDiscounted}
                  onChange={(e) => {
                    setOnlyDiscounted(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="accent-[#C92127] rounded"
                />
                <span className="font-medium">Chỉ xem sách đang giảm giá</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-[#C92127]">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => {
                    setOnlyInStock(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="accent-[#C92127] rounded"
                />
                <span className="font-medium">Chỉ sách còn hàng</span>
              </label>
            </div>
          </div>
        </aside>

        {/* PRODUCT GRID & SORT CONTROLS */}
        <main className="lg:col-span-3">
          {/* Top toolbar */}
          <div className="bg-white rounded-xl p-3.5 mb-4 border border-[#E5E5E5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Tìm thấy{' '}
              <strong className="text-slate-900 font-bold">{filteredBooks.length}</strong> tựa
              sách phù hợp
              {categoryName ? ` trong "${categoryName}"` : ''}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#C92127]"
              >
                <option value="bestseller">Bán chạy nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-az">Tên sách A - Z</option>
              </select>
            </div>
          </div>

          {/* Product cards */}
          {paginatedBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {paginatedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border border-[#E5E5E5]">
              <div className="w-14 h-14 rounded-full bg-red-50 text-[#C92127] mx-auto flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Không tìm thấy sách phù hợp
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Vui lòng thử bỏ chọn một số tiêu chí bộ lọc hoặc tìm kiếm bằng từ khóa khác.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#C92127] text-white text-xs font-bold rounded-lg hover:bg-[#A5181E] transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? 'bg-[#C92127] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
