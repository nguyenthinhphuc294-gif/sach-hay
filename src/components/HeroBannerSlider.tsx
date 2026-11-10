import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HERO_BANNER_IMG, PROMO_MANGA_IMG, PROMO_STATIONERY_IMG } from '../data/mockData';

export const HeroBannerSlider: React.FC = () => {
  const { setActiveView, setSelectedCategorySlug } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      image: HERO_BANNER_IMG,
      title: 'Hội Sách Khuyến Mãi 2026 - Giảm Đến 50%',
      subtitle: 'Tất cả các đầu sách kinh điển, kỹ năng và văn học tuyển chọn',
      actionCategory: 'van-hoc'
    },
    {
      id: 2,
      image: PROMO_MANGA_IMG,
      title: 'Tuần Lễ Manga & Light Novel Nhật Bản',
      subtitle: 'Tặng kèm bookmark, poster độc quyền và giảm giá 20%',
      actionCategory: 'truyen-tranh'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleGoToCatalog = (categorySlug: string) => {
    setSelectedCategorySlug(categorySlug);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 pt-4 pb-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* MAIN SLIDESHOW (Takes 2 cols on lg) */}
        <div className="lg:col-span-2 relative h-[240px] sm:h-[320px] md:h-[360px] rounded-xl overflow-hidden shadow-sm group bg-slate-900">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 md:p-8">
                <span className="inline-block text-[11px] font-bold text-amber-300 uppercase tracking-widest mb-1.5">
                  Đặc quyền Sách Hay
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white text-balance drop-shadow-md">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl line-clamp-2">
                  {slide.subtitle}
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => handleGoToCatalog(slide.actionCategory)}
                    className="px-4 py-2 bg-[#C92127] hover:bg-[#A5181E] text-white text-xs sm:text-sm font-bold rounded-lg shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    Khám phá ngay
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* SLIDER CONTROLS */}
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* DOTS */}
          <div className="absolute bottom-3 right-5 z-20 flex items-center gap-1.5">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'w-6 bg-[#C92127]' : 'w-2 bg-white/70 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 2 SIDE PROMOTIONAL BANNERS */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3.5 h-[240px] sm:h-[320px] md:h-[360px]">
          {/* Banner 1: Manga */}
          <div
            onClick={() => handleGoToCatalog('truyen-tranh')}
            className="relative rounded-xl overflow-hidden shadow-sm group cursor-pointer bg-slate-100 flex-1"
          >
            <img
              src={PROMO_MANGA_IMG}
              alt="Manga & Comic"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5">
              <span className="text-[10px] uppercase font-bold text-amber-300">Xu Hướng Trẻ</span>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                Manga & Comic Hot Nhất
              </h3>
              <p className="text-[11px] text-white/80 hidden sm:block">Freeship + Tặng kèm quà</p>
            </div>
          </div>

          {/* Banner 2: Stationery */}
          <div
            onClick={() => handleGoToCatalog('van-phong-pham')}
            className="relative rounded-xl overflow-hidden shadow-sm group cursor-pointer bg-slate-100 flex-1"
          >
            <img
              src={PROMO_STATIONERY_IMG}
              alt="Văn Phòng Phẩm"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5">
              <span className="text-[10px] uppercase font-bold text-amber-300">Phụ Kiện & Quà</span>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                Văn Phòng Phẩm Cao Cấp
              </h3>
              <p className="text-[11px] text-white/80 hidden sm:block">Sổ tay da, bút ký thanh lịch</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
