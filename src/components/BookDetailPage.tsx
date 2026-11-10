import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from './BookCard';
import {
  Star,
  ShoppingCart,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Heart,
  Share2,
  Check,
  Plus,
  Minus,
  MessageSquare,
  Maximize2,
  X
} from 'lucide-react';

export const BookDetailPage: React.FC = () => {
  const {
    selectedBook,
    books,
    addToCart,
    openBookDetail,
    setActiveView,
    toggleWishlist,
    isInWishlist,
    reviews,
    addReview,
    showToast
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // New review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!selectedBook) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-600 mb-4">Không tìm thấy thông tin cuốn sách này.</p>
        <button
          onClick={() => setActiveView('home')}
          className="px-4 py-2 bg-[#C92127] text-white rounded-lg text-xs font-bold"
        >
          Quay lại Trang Chủ
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(selectedBook.id);
  const bookReviews = reviews.filter((r) => r.bookId === selectedBook.id);
  const relatedBooks = books
    .filter((b) => b.categoryId === selectedBook.categoryId && b.id !== selectedBook.id)
    .slice(0, 5);

  const images = selectedBook.thumbnails?.length
    ? selectedBook.thumbnails
    : [selectedBook.coverImage];

  const handleAddToCart = () => {
    addToCart(selectedBook, quantity);
  };

  const handleBuyNow = () => {
    const success = addToCart(selectedBook, quantity, false);
    if (success) {
      setActiveView('cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Đã sao chép liên kết sách vào bộ nhớ tạm!', 'info');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    addReview(selectedBook.id, reviewRating, reviewComment.trim());
    setReviewComment('');
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
          onClick={() => setActiveView('catalog')}
          className="hover:text-[#C92127] transition-colors"
        >
          {selectedBook.categoryName}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{selectedBook.title}</span>
      </nav>

      {/* TOP DETAIL CARD: LEFT GALLERY & RIGHT PURCHASE MODULE */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 border border-[#E5E5E5] shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: GALLERY & ACTION BUTTONS (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Main Image with Zoom */}
            <div className="relative aspect-[3/4] w-full max-w-sm rounded-xl overflow-hidden bg-slate-50 border border-slate-200 group">
              <img
                src={images[selectedImageIndex] || selectedBook.coverImage}
                alt={selectedBook.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-opacity opacity-0 group-hover:opacity-100"
                title="Phóng to ảnh"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-18 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#C92127] shadow-sm'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Purchase CTA Buttons (Desktop) */}
            <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleAddToCart}
                disabled={selectedBook.stock <= 0}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  selectedBook.stock <= 0
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-red-50 text-[#C92127] border-[#C92127] hover:bg-red-100 shadow-xs'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Thêm vào giỏ</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={selectedBook.stock <= 0}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-white shadow-md transition-all cursor-pointer ${
                  selectedBook.stock <= 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#C92127] hover:bg-[#A5181E] active:scale-95'
                }`}
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Mua ngay</span>
              </button>
            </div>
          </div>

          {/* RIGHT: DETAILS, PRICING & DELIVERY (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category & Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-[#C92127] bg-red-50 px-2.5 py-0.5 rounded-full">
                  {selectedBook.categoryName}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWishlist(selectedBook.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#C92127] transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#C92127] text-[#C92127]' : ''}`} />
                    <span>{isFavorited ? 'Đã thích' : 'Yêu thích'}</span>
                  </button>
                  <span>·</span>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Chia sẻ</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                {selectedBook.title}
              </h1>

              {/* Metadata strip: Author, Publisher, Supplier */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Tác giả:</span>
                  <span className="font-bold text-slate-800">{selectedBook.author}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nhà xuất bản:</span>
                  <span className="font-bold text-slate-800">{selectedBook.publisher}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Hình thức:</span>
                  <span className="font-bold text-slate-800">{selectedBook.format}</span>
                </div>
              </div>

              {/* Rating & Sold count */}
              <div className="flex items-center gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-slate-900 text-sm">
                    {selectedBook.rating}
                  </span>
                  <span className="text-slate-500">({selectedBook.reviewCount} đánh giá)</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium">
                  Đã bán <strong className="text-slate-900">{selectedBook.soldCount}</strong> cuốn
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-mono">ISBN: {selectedBook.isbn}</span>
              </div>

              {/* Price Banner */}
              <div className="bg-[#FAF9F8] rounded-xl p-4 mt-5 flex items-baseline gap-3 border border-red-100">
                <span className="text-2xl sm:text-3xl font-black text-[#C92127] font-mono tabular-nums">
                  {selectedBook.price.toLocaleString('vi-VN')}đ
                </span>
                {selectedBook.originalPrice > selectedBook.price && (
                  <>
                    <span className="text-sm sm:text-base text-slate-400 line-through font-mono tabular-nums">
                      {selectedBook.originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="bg-[#C92127] text-white text-xs font-black px-2 py-0.5 rounded">
                      -{selectedBook.discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status & Quantity Stepper */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700">Số lượng:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-xs font-bold font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) =>
                          q < selectedBook.stock ? q + 1 : (showToast(`Kho chỉ còn ${selectedBook.stock} cuốn!`, 'warning'), q)
                        )
                      }
                      disabled={quantity >= selectedBook.stock}
                      className="p-2 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs">
                    {selectedBook.stock > 0 ? (
                      <span className="text-emerald-700 font-medium">
                        ✓ Còn hàng ({selectedBook.stock} cuốn trong kho)
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold">✕ Tạm hết hàng</span>
                    )}
                  </span>
                </div>

                {/* Delivery & Guarantees Strip */}
                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/70 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C92127] shrink-0" />
                    <span>
                      Giao hàng tiêu chuẩn: <strong>1 - 3 ngày làm việc</strong> toàn quốc (Freeship
                      từ 250k).
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#C92127] shrink-0" />
                    <span>Chính sách đổi trả trong vòng <strong>7 ngày</strong> nếu có lỗi in ấn.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cam kết 100% sách thật có hóa đơn và tem bản quyền phát hành.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER TABS: DESCRIPTION, SPECIFICATIONS, REVIEWS */}
      <div className="bg-white rounded-2xl p-4 sm:p-8 border border-[#E5E5E5] shadow-sm mt-6">
        <div className="flex items-center gap-2 border-b border-[#E5E5E5] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'desc'
                ? 'bg-red-50 text-[#C92127] border-b-2 border-[#C92127]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mô Tả Sản Phẩm
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-red-50 text-[#C92127] border-b-2 border-[#C92127]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thông Tin Chi Tiết
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-red-50 text-[#C92127] border-b-2 border-[#C92127]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đánh Giá Khách Hàng ({bookReviews.length})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="py-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl">
            <p className="font-semibold text-slate-900 text-base">
              {selectedBook.shortDescription}
            </p>
            <p>{selectedBook.description}</p>
            <p>
              Tác phẩm mang lại cho bạn đọc những trải nghiệm sâu sắc, được xuất bản bởi{' '}
              <strong>{selectedBook.publisher}</strong> với chất lượng giấy in cao cấp, mực in sắc
              nét, thiết kế trang nhã phù hợp làm quà tặng hoặc lưu giữ trong tủ sách gia đình.
            </p>
          </div>
        )}

        {/* Tab 2: Specifications Table */}
        {activeTab === 'specs' && (
          <div className="py-6 max-w-2xl">
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
              <div className="grid grid-cols-3 p-3 bg-slate-50">
                <span className="font-semibold text-slate-500">Mã hàng (ISBN)</span>
                <span className="col-span-2 font-mono text-slate-800">{selectedBook.isbn}</span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Tác giả</span>
                <span className="col-span-2 text-slate-800">{selectedBook.author}</span>
              </div>
              <div className="grid grid-cols-3 p-3 bg-slate-50">
                <span className="font-semibold text-slate-500">Nhà xuất bản</span>
                <span className="col-span-2 text-slate-800">{selectedBook.publisher}</span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Năm xuất bản</span>
                <span className="col-span-2 text-slate-800">{selectedBook.publicationYear}</span>
              </div>
              <div className="grid grid-cols-3 p-3 bg-slate-50">
                <span className="font-semibold text-slate-500">Số trang</span>
                <span className="col-span-2 text-slate-800">{selectedBook.pages} trang</span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Kích thước</span>
                <span className="col-span-2 text-slate-800">{selectedBook.dimensions}</span>
              </div>
              <div className="grid grid-cols-3 p-3 bg-slate-50">
                <span className="font-semibold text-slate-500">Trọng lượng</span>
                <span className="col-span-2 text-slate-800">{selectedBook.weight} gram</span>
              </div>
              <div className="grid grid-cols-3 p-3">
                <span className="font-semibold text-slate-500">Ngôn ngữ</span>
                <span className="col-span-2 text-slate-800">{selectedBook.language}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reviews & Add Review Form */}
        {activeTab === 'reviews' && (
          <div className="py-6 space-y-6">
            {/* Reviews Summary */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-center sm:text-left">
                <div className="text-4xl font-black text-[#C92127] font-mono">
                  {selectedBook.rating}
                  <span className="text-lg text-slate-400">/5</span>
                </div>
                <div className="flex items-center gap-0.5 mt-1 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(selectedBook.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">Dựa trên {selectedBook.reviewCount} đánh giá</p>
              </div>

              {/* Add review form */}
              <div className="flex-1 w-full border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-6 pt-4 sm:pt-0">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Gửi nhận xét của bạn
                </h4>
                <form onSubmit={handleReviewSubmit} className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Đánh giá của bạn:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= reviewRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Viết nhận xét của bạn về nội dung sách, chất lượng in..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#C92127]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#C92127] text-white rounded-lg text-xs font-bold hover:bg-[#A5181E] transition-colors cursor-pointer"
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* List of customer reviews */}
            <div className="space-y-3">
              {bookReviews.map((rev) => (
                <div key={rev.id} className="p-3.5 border border-slate-100 rounded-xl bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rev.userName}</span>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
                          <Check className="w-3 h-3" /> Đã mua tại Sách Hay
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{rev.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-1 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 mt-1">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RELATED BOOKS CAROUSEL */}
      {relatedBooks.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E5E5E5] shadow-sm mt-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5] mb-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
              Sản Phẩm Cùng Thể Loại
            </h3>
            <button
              onClick={() => setActiveView('catalog')}
              className="text-xs font-bold text-[#C92127] hover:underline"
            >
              Xem thêm →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {relatedBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}

      {/* ZOOM MODAL */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={images[selectedImageIndex] || selectedBook.coverImage}
              alt={selectedBook.title}
              className="w-full h-auto rounded-lg max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
