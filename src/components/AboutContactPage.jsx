import { useEffect, useRef, useState } from 'react';
import { BookOpen, Clock, ExternalLink, Mail, MapPin, Phone, Send } from 'lucide-react';
import shopInterior from '../assets/images/bookshop-interior.svg';
import { storeContact, storePhoneHref } from '../data/storeContact';

const mapQuery = encodeURIComponent('Phước Tân, Bien Hoa, Dong Nai');
const mapEmbed = `https://maps.google.com/maps?q=${mapQuery}&z=14&hl=vi&output=embed`;
const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
const fieldClass = 'mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-red-700 focus:outline-2 focus:outline-red-700';

function ContactDetail({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <dt className="flex items-center gap-2 text-sm font-semibold text-stone-900">
        <Icon className="size-4 text-[#C92127]" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm leading-relaxed text-stone-700">{children}</dd>
    </div>
  );
}

export default function AboutContactPage() {
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const sendingRef = useRef(false);
  const headingRef = useRef(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Về chúng tôi & Liên hệ | Sách Hay';
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
    return () => { document.title = previousTitle; };
  }, []);

  async function sendMessage(event) {
    event.preventDefault();
    if (sendingRef.current) return;

    const form = event.currentTarget;
    const fields = new FormData(form);
    const body = {
      name: String(fields.get('name')).trim(),
      email: String(fields.get('email')).trim(),
      message: String(fields.get('message')).trim(),
    };
    if (body.name.length < 2 || body.message.length < 10) {
      setFeedback({ error: true, text: 'Nhập tên từ 2 ký tự và tin nhắn từ 10 ký tự trở lên.' });
      return;
    }

    sendingRef.current = true;
    setSending(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-SachHay-Request': '1' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (response.status === 201 && typeof result.reference === 'string') {
        form.reset();
        setFeedback({ error: false, text: `Sách Hay đã nhận tin nhắn. Mã tiếp nhận ${result.reference}.` });
      } else {
        setFeedback({ error: true, text: result.message || 'Chưa gửi được tin nhắn. Bạn vui lòng thử lại.' });
      }
    } catch {
      setFeedback({ error: true, text: 'Chưa kết nối được hệ thống liên hệ. Bạn vui lòng thử lại.' });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:space-y-14 sm:px-6 sm:py-10">
      <section aria-labelledby="about-title" className="overflow-hidden rounded-3xl border border-stone-200 bg-[#fff9ef]">
        <div className="grid items-center md:grid-cols-2">
          <div className="p-6 sm:p-10 lg:p-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-800">
              <BookOpen className="size-4" aria-hidden="true" /> NHÀ SÁCH Sách Hay
            </span>
            <h1 id="about-title" ref={headingRef} tabIndex={-1} className="mt-5 text-3xl font-black tracking-tight text-stone-900 sm:text-5xl">
              Về chúng tôi &amp; Liên hệ
            </h1>
            <p className="mt-4 text-base leading-relaxed text-stone-700">
              Sách Hay là nhà sách trực tuyến dành cho những ai thích đọc và muốn tìm một cuốn sách hợp với mình.
              Từ văn học, truyện tranh đến sách thiếu nhi và kỹ năng, chúng tôi muốn việc chọn sách trở thành
              một phần thú vị trong ngày của bạn.
            </p>
          </div>
          <img src={shopInterior} alt="Minh họa góc nhà sách với kệ gỗ, bàn đọc và ánh đèn ấm" width="720" height="500" className="h-full max-h-96 w-full object-cover md:max-h-none" />
        </div>
        <div className="grid gap-6 border-t border-stone-200 bg-white p-6 sm:grid-cols-2 sm:p-10 lg:px-14">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Tầm nhìn</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-700">Trở thành nơi bạn có thể quay lại mỗi khi cần tìm cuốn sách tiếp theo cho mình hoặc cho người thân.</p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Sứ mệnh</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-700">Giúp bạn dễ tìm sách phù hợp, hiểu rõ mình đang mua gì và có nơi để hỏi khi cần hỗ trợ.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="contact-details">
        <h2 id="contact-details" className="text-2xl font-extrabold text-stone-900">Thông tin cửa hàng</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ContactDetail icon={MapPin} label="Địa chỉ">
            {storeContact.street && <>{storeContact.street}<br /></>}
            {storeContact.area}
          </ContactDetail>
          <ContactDetail icon={Phone} label="Hotline">
            {storePhoneHref ? <a href={storePhoneHref} className="text-red-800 underline">{storeContact.phone}</a> : 'Đang cập nhật'}
          </ContactDetail>
          <ContactDetail icon={Mail} label="Email">
            {storeContact.email ? <a href={`mailto:${storeContact.email}`} className="text-red-800 underline">{storeContact.email}</a> : 'Đang cập nhật'}
          </ContactDetail>
          <ContactDetail icon={Clock} label="Giờ mở cửa">{storeContact.hours || 'Đang cập nhật'}</ContactDetail>
        </dl>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="map-title" className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <h2 id="map-title" className="text-xl font-extrabold text-stone-900">Bản đồ khu vực Phước Tân</h2>
          <p className="mt-1.5 text-sm text-stone-700">{storeContact.area}</p>
          <iframe
            src={mapEmbed}
            title="Google Maps khu vực Phước Tân, Biên Hòa, Đồng Nai"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="mt-4 min-h-72 w-full flex-1 rounded-xl border-0 bg-stone-100"
          />
          <a href={mapLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-red-800 underline">
            Mở Google Maps <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </section>

        <section aria-labelledby="form-title" className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <h2 id="form-title" className="text-xl font-extrabold text-stone-900">Gửi tin nhắn cho Sách Hay</h2>
          <p className="mt-1.5 text-sm text-stone-700">Hãy để lại email để cửa hàng có thể phản hồi bạn.</p>
          <form onSubmit={sendMessage} className="mt-4 space-y-3.5" aria-busy={sending}>
            <label className="block text-sm font-semibold text-stone-800">
              Họ và tên
              <input name="name" autoComplete="name" required minLength={2} maxLength={100} className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-stone-800">
              Email
              <input name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-stone-800">
              Tin nhắn
              <textarea name="message" required minLength={10} maxLength={2000} rows={5} className={`${fieldClass} resize-y`} />
            </label>
            <button type="submit" disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-[#C92127] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#a0181e] disabled:opacity-60">
              <Send className="size-4" aria-hidden="true" />
              {sending ? 'Đang gửi…' : 'Gửi tin nhắn'}
            </button>
            {feedback && (
              <p role={feedback.error ? 'alert' : 'status'} className={`text-sm ${feedback.error ? 'text-red-800' : 'text-green-800'}`}>
                {feedback.text}
              </p>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
