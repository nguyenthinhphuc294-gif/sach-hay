import React from 'react';
import { Link } from 'react-router';
import { useStore } from '../context/StoreContext';
import { storeContact, storePhoneHref } from '../data/storeContact';
import {
  BookOpen,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedCategorySlug } = useStore();

  return (
    <footer className="bg-white border-t border-[#E5E5E5] mt-12">
      {/* SERVICE GUARANTEE STRIP */}
      <div className="bg-[#FAF9F8] border-b border-[#E5E5E5] py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C92127] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Giao Hàng Toàn Quốc</h4>
              <p className="text-[11px] text-slate-500">Miễn phí cho đơn từ 250k</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C92127] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Đổi Trả Trong 7 Ngày</h4>
              <p className="text-[11px] text-slate-500">Đổi trả dễ dàng nếu lỗi in ấn</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C92127] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">100% Sách Thật</h4>
              <p className="text-[11px] text-slate-500">Cam kết từ các NXB uy tín</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C92127] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Thanh Toán Linh Hoạt</h4>
              <p className="text-[11px] text-slate-500">Hỗ trợ COD & Nhận tại nhà sách</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER COLUMNS */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: About Sách Hay */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C92127] text-white flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-slate-900">
                Sách <span className="text-[#C92127]">Hay</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sách Hay là hệ thống nhà sách trực tuyến hàng đầu Việt Nam, cung cấp hàng chục ngàn tựa
              sách quốc văn, ngoại văn, văn phòng phẩm và quà lưu niệm chính hãng với dịch vụ tận
              tâm.
            </p>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C92127] shrink-0 mt-0.5" />
                <span>{[storeContact.street, storeContact.area].filter(Boolean).join(', ')}</span>
              </p>
              {storePhoneHref && (
                <a href={storePhoneHref} className="flex items-center gap-2 hover:underline">
                  <Phone className="w-4 h-4 text-[#C92127] shrink-0" />
                  Hotline: {storeContact.phone}
                </a>
              )}
              {storeContact.email && (
                <a href={`mailto:${storeContact.email}`} className="flex items-center gap-2 hover:underline">
                  <Mail className="w-4 h-4 text-[#C92127] shrink-0" />
                  {storeContact.email}
                </a>
              )}
              <Link to="/about" className="inline-block font-semibold text-[#C92127] underline">Giới thiệu &amp; liên hệ</Link>
            </div>
          </div>

          {/* Col 2: Dịch vụ & Trợ giúp */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-2 border-[#C92127] pl-2.5">
              Dịch Vụ Khách Hàng
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Điều khoản sử dụng website
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Chính sách bảo mật thông tin
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Chính sách giao hàng và nhận sách
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Chính sách đổi - trả - hoàn tiền
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Phương thức thanh toán COD
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Danh Mục Nổi Bật */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-2 border-[#C92127] pl-2.5">
              Danh Mục Phổ Biến
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategorySlug('van-hoc');
                    setActiveView('catalog');
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Sách Văn Học Việt Nam & Thế Giới
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategorySlug('kinh-te');
                    setActiveView('catalog');
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Sách Kinh Doanh & Đầu Tư
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategorySlug('ky-nang-song');
                    setActiveView('catalog');
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Tâm Lý Học & Kỹ Năng Sống
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategorySlug('truyen-tranh');
                    setActiveView('catalog');
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Manga - Comic & Light Novel
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedCategorySlug('van-phong-pham');
                    setActiveView('catalog');
                  }}
                  className="hover:text-[#C92127] transition-colors"
                >
                  Văn Phòng Phẩm & Bút Ký
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Kết nối & Nhận tin khuyến mãi */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-2 border-[#C92127] pl-2.5">
              Đăng Ký Nhận Bản Tin
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Nhận thông báo sách mới phát hành và mã ưu đãi giảm 50.000đ cho đơn hàng đầu tiên.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Cảm ơn bạn đã đăng ký nhận ưu đãi từ Sách Hay!');
              }}
              className="flex gap-1.5"
            >
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                required
                className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#C92127]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#C92127] hover:bg-[#A5181E] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Đăng ký
              </button>
            </form>

            <div className="mt-5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Hình thức thanh toán an toàn
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-bold text-slate-700 border border-slate-200">
                  COD
                </span>
                <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-bold text-slate-700 border border-slate-200">
                  Tại Cửa Hàng
                </span>
                <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-bold text-slate-700 border border-slate-200">
                  ATM / Thẻ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="border-t border-[#E5E5E5] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Sách Hay. Bản quyền thuộc Công ty Cổ phần Phát hành Sách Sách Hay.</p>
          <p className="flex items-center gap-1">
            Xây dựng với niềm đam mê sách <Heart className="w-3.5 h-3.5 text-[#C92127] fill-[#C92127]" />
          </p>
        </div>
      </div>
    </footer>
  );
};
