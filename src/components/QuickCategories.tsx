import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Flame,
  Award,
  Zap,
  Sparkles,
  Layers,
  BookOpen,
  TrendingUp,
  Smile,
  Globe,
  PenTool
} from 'lucide-react';

export const QuickCategories: React.FC = () => {
  const { setSelectedCategorySlug, setActiveView, setSearchQuery } = useStore();

  const quickItems = [
    {
      id: 'flash-sale',
      label: 'Flash Sale',
      slug: 'flash-sale',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200'
    },
    {
      id: 'ban-chay',
      label: 'Bán Chạy',
      slug: null,
      filterType: 'bestseller',
      icon: <Award className="w-5 h-5 text-red-500" />,
      bg: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      id: 'sach-moi',
      label: 'Sách Mới',
      slug: null,
      filterType: 'new',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      bg: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    },
    {
      id: 'van-hoc',
      label: 'Văn Học',
      slug: 'van-hoc',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'kinh-te',
      label: 'Kinh Tế',
      slug: 'kinh-te',
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
    },
    {
      id: 'ky-nang',
      label: 'Kỹ Năng Sống',
      slug: 'ky-nang-song',
      icon: <Smile className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      id: 'manga',
      label: 'Truyện Tranh',
      slug: 'truyen-tranh',
      icon: <Layers className="w-5 h-5 text-pink-600" />,
      bg: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    },
    {
      id: 'thieu-nhi',
      label: 'Thiếu Nhi',
      slug: 'sach-thieu-nhi',
      icon: <Sparkles className="w-5 h-5 text-yellow-600" />,
      bg: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    },
    {
      id: 'ngoai-van',
      label: 'Ngoại Văn',
      slug: 'sach-ngoai-van',
      icon: <Globe className="w-5 h-5 text-cyan-600" />,
      bg: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
    },
    {
      id: 'van-phong-pham',
      label: 'Văn Phòng Phẩm',
      slug: 'van-phong-pham',
      icon: <PenTool className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
    }
  ];

  const handleClick = (slug: string | null) => {
    setSelectedCategorySlug(slug);
    setSearchQuery('');
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E5E5E5]">
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-4">
          {quickItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.slug)}
              className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border transition-all shadow-xs group-hover:shadow-md ${item.bg}`}
              >
                {item.icon}
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 mt-2 line-clamp-1 group-hover:text-[#C92127] transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
