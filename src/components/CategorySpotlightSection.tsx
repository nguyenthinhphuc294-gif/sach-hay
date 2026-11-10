import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookCard } from './BookCard';
import { ChevronRight, BookOpen, Smile, TrendingUp, Layers } from 'lucide-react';

export const CategorySpotlightSection: React.FC = () => {
  const { books, setActiveView, setSelectedCategorySlug } = useStore();

  const spotlightCategories = [
    {
      id: 'cat-van-hoc',
      slug: 'van-hoc',
      title: 'Văn Học Tuyển Chọn',
      subtitle: 'Tiểu thuyết, tản văn và các áng văn học kinh điển làm say lòng độc giả',
      icon: <BookOpen className="w-5 h-5 text-[#C92127]" />,
      color: 'border-l-4 border-[#C92127]'
    },
    {
      id: 'cat-ky-nang',
      slug: 'ky-nang-song',
      title: 'Tâm Lý - Kỹ Năng Sống',
      subtitle: 'Nuôi dưỡng tâm hồn, phát triển tư duy và hoàn thiện bản thân mỗi ngày',
      icon: <Smile className="w-5 h-5 text-purple-600" />,
      color: 'border-l-4 border-purple-600'
    },
    {
      id: 'cat-kinh-te',
      slug: 'kinh-te',
      title: 'Sách Kinh Tế & Khởi Nghiệp',
      subtitle: 'Chiến lược quản trị, đầu tư tài chính thông minh và kinh nghiệm thương trường',
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      color: 'border-l-4 border-emerald-600'
    },
    {
      id: 'cat-manga-comic',
      slug: 'truyen-tranh',
      title: 'Manga - Comic & Light Novel',
      subtitle: 'Thế giới truyện tranh Nhật Bản, siêu anh hùng và phiêu lưu kỳ thú',
      icon: <Layers className="w-5 h-5 text-pink-600" />,
      color: 'border-l-4 border-pink-600'
    }
  ];

  const handleViewCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {spotlightCategories.map((spotlight) => {
        const categoryBooks = books.filter((b) => b.categoryId === spotlight.id);
        if (categoryBooks.length === 0) return null;

        return (
          <section
            key={spotlight.id}
            className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E5E5E5] shadow-sm"
          >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E5E5] gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200">
                  {spotlight.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                    {spotlight.title}
                  </h3>
                  <p className="text-xs text-slate-500 hidden sm:block">
                    {spotlight.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleViewCategory(spotlight.slug)}
                className="flex items-center gap-1 text-xs font-bold text-[#C92127] hover:underline cursor-pointer self-start sm:self-center"
              >
                <span>Xem thêm ({categoryBooks.length}+ cuốn)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Book Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-4">
              {categoryBooks.slice(0, 5).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
