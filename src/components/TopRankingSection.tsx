import React from 'react';
import { useStore } from '../context/StoreContext';
import { Trophy, Star, ShoppingCart, ChevronRight } from 'lucide-react';

export const TopRankingSection: React.FC = () => {
  const { books, openBookDetail, addToCart, setActiveView, setSelectedCategorySlug } = useStore();

  // Sort by soldCount descending
  const sortedBooks = [...books].sort((a, b) => b.soldCount - a.soldCount).slice(0, 6);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-black text-xs flex items-center justify-center shadow-md">
          #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-r from-slate-200 to-slate-400 text-slate-800 font-black text-xs flex items-center justify-center shadow-md">
          #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md">
          #3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
        #{rank}
      </span>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E5E5E5] shadow-sm">
        {/* Title */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                Bảng Xếp Hạng Sách Bán Chạy Nhất
              </h2>
              <p className="text-xs text-slate-500">
                Top tựa sách được bạn đọc yêu thích và đặt mua nhiều nhất tuần qua
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedCategorySlug(null);
              setActiveView('catalog');
            }}
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#C92127] hover:underline"
          >
            <span>Xem BXH đầy đủ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 2-column leaderboard grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {sortedBooks.map((book, index) => (
            <div
              key={book.id}
              onClick={() => openBookDetail(book)}
              className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:shadow-md transition-all cursor-pointer bg-white group"
            >
              {/* Rank Badge */}
              <div className="shrink-0">{getRankBadge(index + 1)}</div>

              {/* Book Cover */}
              <div className="w-16 h-22 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#C92127] transition-colors truncate">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {book.author} · {book.publisher}
                </p>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-extrabold text-[#C92127] font-mono tabular-nums">
                    {book.price.toLocaleString('vi-VN')}đ
                  </span>
                  {book.originalPrice > book.price && (
                    <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                      {book.originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                  {book.discountPercent > 0 && (
                    <span className="text-[10px] font-black bg-red-100 text-[#C92127] px-1.5 py-0.5 rounded">
                      -{book.discountPercent}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-slate-700">{book.rating}</span>
                  </div>
                  <span>·</span>
                  <span className="font-medium text-emerald-700">
                    Đã bán {book.soldCount.toLocaleString('vi-VN')} cuốn
                  </span>
                </div>
              </div>

              {/* Quick Add CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(book, 1);
                }}
                className="w-9 h-9 rounded-lg bg-red-50 hover:bg-[#C92127] text-[#C92127] hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title="Thêm vào giỏ"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
