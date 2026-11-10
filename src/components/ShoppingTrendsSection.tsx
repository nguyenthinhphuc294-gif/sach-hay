import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from './BookCard';
import { TrendingUp, Award, Flame, Heart, ChevronRight } from 'lucide-react';

type TrendTab = 'trending' | 'bestseller' | 'new' | 'popular';

export const ShoppingTrendsSection: React.FC = () => {
  const { books, setActiveView, setSelectedCategorySlug } = useStore();
  const [activeTab, setActiveTab] = useState<TrendTab>('trending');

  const filteredBooks = books.filter((b) => {
    if (activeTab === 'trending') return b.isTrending;
    if (activeTab === 'bestseller') return b.isBestSeller;
    if (activeTab === 'new') return b.isNewRelease || b.publicationYear >= 2024;
    if (activeTab === 'popular') return b.reviewCount >= 300 || b.rating >= 4.8;
    return true;
  });

  const tabs = [
    { id: 'trending' as TrendTab, label: 'Xu Hướng Mua Sắm', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'bestseller' as TrendTab, label: 'Sách Bán Chạy', icon: <Award className="w-4 h-4" /> },
    { id: 'new' as TrendTab, label: 'Sách Mới Phát Hành', icon: <Flame className="w-4 h-4" /> },
    { id: 'popular' as TrendTab, label: 'Được Quan Tâm Nhất', icon: <Heart className="w-4 h-4" /> }
  ];

  const handleViewMore = () => {
    setSelectedCategorySlug(null);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E5E5E5] shadow-sm">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E5E5] pb-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-[#C92127] rounded-sm"></div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
              Xu Hướng Mua Sắm
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-slate-100 rounded-xl">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#C92127] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-5">
          {filteredBooks.slice(0, 10).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {/* View More Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleViewMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-red-200 text-[#C92127] hover:bg-[#C92127] hover:text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            <span>Xem thêm sách thuộc chuyên mục này</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
