import React from 'react';
import { useStore } from '../context/StoreContext';
import { Book } from '../types';
import { Star, ShoppingCart, Heart, Flame } from 'lucide-react';

interface BookCardProps {
  book: Book;
  showFlashSaleProgress?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, showFlashSaleProgress = false }) => {
  const { openBookDetail, addToCart, toggleWishlist, isInWishlist } = useStore();
  const isFavorited = isInWishlist(book.id);

  const handleCardClick = () => {
    openBookDetail(book);
  };

  const handleAddCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(book, 1);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(book.id);
  };

  // Calculate sold progress percentage for flash sale
  const maxFlashCap = 30;
  const currentRemaining = book.flashSaleRemaining ?? 10;
  const soldFlash = Math.max(1, maxFlashCap - currentRemaining);
  const flashProgressPercent = Math.min(100, Math.round((soldFlash / maxFlashCap) * 100));

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl border border-[#E5E5E5] p-3 flex flex-col justify-between hover:shadow-xl hover:border-red-200 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {book.discountPercent > 0 && (
          <span className="bg-[#C92127] text-white text-[11px] font-black px-2 py-0.5 rounded shadow-xs tracking-tight">
            -{book.discountPercent}%
          </span>
        )}
        {book.isNewRelease && (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
            MỚI
          </span>
        )}
      </div>

      {/* Wishlist toggle */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isFavorited
            ? 'bg-red-50 text-[#C92127]'
            : 'bg-white/80 text-slate-400 hover:text-[#C92127] hover:bg-white'
        } shadow-xs`}
        title={isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#C92127]' : ''}`} />
      </button>

      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center mb-2.5">
        <img
          src={book.coverImage}
          alt={book.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {book.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-2">
            <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Book Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[11px] text-slate-500 font-medium truncate block mb-0.5">
            {book.categoryName} · {book.author}
          </span>

          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#C92127] transition-colors line-clamp-2 leading-snug">
            {book.title}
          </h3>
        </div>

        <div className="mt-2.5 pt-1.5">
          {/* Price lockup */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-extrabold text-[#C92127] font-mono tabular-nums">
              {book.price.toLocaleString('vi-VN')}đ
            </span>
            {book.originalPrice > book.price && (
              <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                {book.originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* Flash Sale Progress Bar */}
          {showFlashSaleProgress ? (
            <div className="mt-2">
              <div className="relative w-full h-4 bg-red-100 rounded-full overflow-hidden flex items-center">
                <div
                  className="h-full bg-gradient-to-r from-[#F7941E] to-[#C92127] rounded-full transition-all duration-500"
                  style={{ width: `${flashProgressPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm uppercase">
                  <Flame className="w-3 h-3 inline mr-0.5 fill-amber-300 text-amber-300" />
                  Đã bán {soldFlash}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-700">{book.rating}</span>
                <span>({book.reviewCount})</span>
              </div>
              <span className="tabular-nums">Đã bán {book.soldCount}</span>
            </div>
          )}

          {/* Quick Add To Cart Button */}
          <button
            onClick={handleAddCartClick}
            disabled={book.stock <= 0}
            className={`w-full mt-3 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              book.stock <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-red-50 text-[#C92127] hover:bg-[#C92127] hover:text-white border border-red-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{book.stock <= 0 ? 'Tạm hết hàng' : 'Thêm vào giỏ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
