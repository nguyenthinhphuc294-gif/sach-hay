import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import shopInterior from '../assets/images/bookshop-interior.svg';

const introSlides = [
  {
    src: 'https://cdn.elle.vn/Nu7BRvQAaVYZp3Wmc3RtvBqs7ggsxrlcLAR1miQ8Z7c/rs:fit:1280:0/sharpen:0.5/quality:82/2020/03/23/394939/tu-sach-mien-phi.jpg@webp',
    alt: 'Kệ gỗ xếp kín sách dưới ánh đèn ấm',
  },
  {
    src: 'https://static.vinwonders.com/production/nha-sach-o-ha-noi-so-1.jpg',
    alt: 'Không gian nhà sách tại Hà Nội',
  },
  {
    src: 'https://deviet.vn/wp-content/uploads/2019/08/hieu-sach-livraria-lello-porto.jpg',
    alt: 'Nội thất hiệu sách Livraria Lello ở Porto',
  },
  {
    src: 'https://photo.znews.vn/w660/Uploaded/ovunhuo/2023_01_05/pexels_tima_miroshnichenko_9572625.jpg',
    alt: 'Ảnh minh họa không gian đọc sách',
  },
];
const delayMs = 2_000;
const controlClass = 'grid size-10 place-items-center rounded-full border border-white/30 bg-black/60 text-white transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

export default function AboutBookshopSlideshow({ slides = introSlides, fullWidth = false, label = 'Ảnh không gian nhà sách' }) {
  const region = useRef(null);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});
  const [visible, setVisible] = useState(!fullWidth);

  useEffect(() => {
    if (!fullWidth) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.15), { threshold: 0.15 });
    observer.observe(region.current);
    return () => observer.disconnect();
  }, [fullWidth]);

  useEffect(() => {
    if (!visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => setActive(current => (current + 1) % slides.length), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, visible, slides.length]);

  function move(step) {
    setActive(current => (current + step + slides.length) % slides.length);
  }

  return (
    <div
      ref={region}
      role="region"
      aria-roledescription="trình chiếu"
      aria-label={label}
      className={`relative w-full overflow-hidden bg-stone-800 ${fullWidth ? 'aspect-[2/1] max-h-[75svh]' : 'aspect-[36/25] h-full max-h-96 md:max-h-none'}`}
    >
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          src={failed[index] ? shopInterior : slide.src}
          alt={failed[index] ? 'Minh họa không gian nhà sách' : slide.alt}
          aria-hidden={index !== active}
          width="720"
          height="500"
          referrerPolicy="no-referrer"
          loading={fullWidth ? 'lazy' : 'eager'}
          fetchPriority={!fullWidth && index === 0 ? 'high' : 'low'}
          onError={failed[index] ? undefined : () => setFailed(previous => ({ ...previous, [index]: true }))}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out motion-reduce:transition-none ${fullWidth ? 'duration-1100' : 'duration-700'} ${index === active ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />

      <button type="button" aria-label="Ảnh trước" onClick={() => move(-1)} className={`absolute top-1/2 left-3 -translate-y-1/2 ${controlClass}`}>
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button type="button" aria-label="Ảnh tiếp theo" onClick={() => move(1)} className={`absolute top-1/2 right-3 -translate-y-1/2 ${controlClass}`}>
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1">
        {slides.map((slide, index) => (
          <button key={slide.src} type="button" aria-label={`Xem ảnh ${index + 1}`}
            aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)}
            className="grid h-8 min-w-8 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-white">
            <span aria-hidden="true" className={`h-2 rounded-full bg-white shadow ${index === active ? 'w-5' : 'w-2 opacity-70'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
