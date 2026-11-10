import { useEffect, useRef, useState } from 'react';
import promoVideo from '../assets/videos/promo-video.mp4';

const DISMISSAL_KEY = 'sachhay:promo:home-books-sale:v1:dismissed-until';
const DAY_MS = 24 * 60 * 60 * 1000;

export default function PromoBannerModal({ videoSrc = promoVideo }) {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const pointerStartedOutside = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const hiddenUntil = Number(window.localStorage.getItem(DISMISSAL_KEY));
      if (Number.isFinite(hiddenUntil) && hiddenUntil > Date.now()) return;
    } catch {
      // The popup can still be dismissed for this visit if storage is blocked.
    }
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const video = videoRef.current;
    dialog.showModal();
    return () => {
      video.pause();
      if (dialog.open) dialog.close();
    };
  }, [isOpen]);

  function dismiss() {
    videoRef.current?.pause();
    try {
      window.localStorage.setItem(DISMISSAL_KEY, String(Date.now() + DAY_MS));
    } catch {
      // Closing still works without storage.
    }
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Ưu đãi sách Sách Hay"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onPointerDown={(event) => {
        pointerStartedOutside.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pointerStartedOutside.current && event.target === event.currentTarget) dismiss();
      }}
      className="fixed inset-0 m-auto w-[92vw] max-w-2xl overflow-hidden rounded-2xl bg-[#23160f] p-0 text-white shadow-2xl backdrop:bg-black/65 backdrop:backdrop-blur-sm"
    >
      <div className="relative">
        <button
          type="button"
          aria-label="Đóng banner khuyến mãi"
          onClick={dismiss}
          className="absolute top-2 right-2 z-10 grid size-10 place-items-center rounded-full bg-white text-2xl leading-none text-slate-900 shadow-md hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span aria-hidden="true">×</span>
        </button>
        <video
          ref={videoRef}
          src={videoSrc}
          aria-label="Video giới thiệu chương trình khuyến mãi Sách Hay"
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="metadata"
          className="block aspect-video max-h-[90dvh] w-full bg-black object-contain"
        >
          Trình duyệt của bạn không hỗ trợ phát video.
        </video>
      </div>
    </dialog>
  );
}
