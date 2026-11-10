import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from './BookCard';
import { Zap, Clock, ChevronRight } from 'lucide-react';
import { FLASH_SALE_BANNER_IMG } from '../data/mockData';

export const FlashSaleSection: React.FC = () => {
  const { books, setActiveView, setSelectedCategorySlug } = useStore();

  // Flash sale countdown timer state (mocking countdown towards end of current day)
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashSaleBooks = books.filter((b) => b.isFlashSale);

  const handleViewAll = () => {
    setSelectedCategorySlug(null);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
        {/* Flash Sale Header Banner */}
        <div
          className="relative bg-gradient-to-r from-[#C92127] via-[#A5181E] to-[#B71C1C] p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            backgroundImage: `linear-gradient(rgba(201, 33, 39, 0.9), rgba(165, 24, 30, 0.9)), url(${FLASH_SALE_BANNER_IMG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Title & Countdown */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 justify-center sm:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-black animate-pulse shadow-md">
                <Zap className="w-5 h-5 fill-slate-900" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                FLASH SALE <span className="text-amber-300">GIỜ VÀNG</span>
              </h2>
            </div>

            {/* Countdown boxes */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
              <span className="flex items-center gap-1 text-white/90 mr-1 text-xs font-sans">
                <Clock className="w-3.5 h-3.5 text-amber-300" /> Kết thúc sau:
              </span>
              <span className="bg-slate-900/90 text-white px-2.5 py-1 rounded-md text-sm shadow-inner tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-amber-300 font-bold">:</span>
              <span className="bg-slate-900/90 text-white px-2.5 py-1 rounded-md text-sm shadow-inner tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-amber-300 font-bold">:</span>
              <span className="bg-slate-900/90 text-amber-300 px-2.5 py-1 rounded-md text-sm shadow-inner tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* View All Button */}
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-xs font-bold text-white bg-white/20 hover:bg-white hover:text-[#C92127] px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <span>Xem tất cả Flash Sale</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Cards Row */}
        <div className="p-4 bg-slate-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {flashSaleBooks.slice(0, 5).map((book) => (
              <BookCard key={book.id} book={book} showFlashSaleProgress={true} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
