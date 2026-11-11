import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { BookOpen, ChevronRight, MessageCircle, Send, X } from 'lucide-react';
import { answerBookBot, bookBotGreeting, vnd } from '../bookbot';
import type { BotReply } from '../bookbot';
import { useStore } from '../context/StoreContext';

type Message = { role: 'bot' | 'customer'; content: BotReply };
const starters = ['Gợi ý sách dưới 150k', 'Sách đang giảm giá', 'Thanh toán thế nào?'];

export function BookBot({ hidden }: { hidden: boolean }) {
  const { books, openBookDetail, setActiveView } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'bot', content: { text: bookBotGreeting } }]);
  const context = useRef<Parameters<typeof answerBookBot>[2]>({});
  const sending = useRef(false);
  const transcript = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && !hidden) input.current?.focus();
  }, [isOpen, hidden]);

  useEffect(() => {
    const log = transcript.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [isOpen, hidden, messages, pending]);

  function close() {
    setIsOpen(false);
    launcher.current?.focus();
  }

  async function send(raw: string) {
    const question = raw.trim();
    if (!question || sending.current) return;
    sending.current = true;
    setDraft('');
    setPending(true);
    setMessages(previous => [...previous.slice(-19), { role: 'customer', content: { text: question } }]);
    try {
      const result = await answerBookBot(question, books, context.current);
      context.current = result.context;
      setMessages(previous => [...previous, { role: 'bot', content: result.reply }]);
    } catch {
      setMessages(previous => [...previous, { role: 'bot', content: {
        text: 'Em chưa trả lời được câu hỏi này. Anh/chị muốn gửi yêu cầu tới cửa hàng không ạ?', action: 'contact',
      } }]);
    } finally {
      sending.current = false;
      setPending(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  if (hidden) return null;

  return (
    <div className="fixed right-3 bottom-3 z-40 flex flex-col items-end gap-2 sm:right-5 sm:bottom-5">
      {isOpen && (
        <section
          id="pt-bookbot-panel"
          aria-labelledby="pt-bookbot-title"
          onKeyDown={event => { if (event.key === 'Escape') close(); }}
          className="flex h-[min(37rem,calc(100dvh-5.5rem))] w-[min(25rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex shrink-0 items-center gap-3 bg-[#94171d] px-4 py-3 text-white">
            <BookOpen className="size-5" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h2 id="pt-bookbot-title" className="text-sm font-bold">PT-BookBot</h2>
              <p className="text-xs text-red-100">Trợ lý Sách Phúc Thịnh</p>
            </div>
            <button type="button" aria-label="Đóng khung tư vấn" onClick={close} className="grid size-9 place-items-center rounded-lg hover:bg-white/15">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div ref={transcript} role="log" aria-label="Cuộc trò chuyện" className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 p-3">
            {messages.map(({ role, content }, index) => (
              <div key={`${index}-${role}-${content.text}`} className={role === 'customer' ? 'ml-auto max-w-[88%]' : 'mr-2'}>
                <p className={`break-words rounded-xl px-3 py-2 text-sm leading-relaxed ${role === 'customer' ? 'bg-[#94171d] text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                  <span className="sr-only">{role === 'customer' ? 'Bạn: ' : 'PT-BookBot: '}</span>
                  {content.text}
                </p>
                {content.books?.length ? (
                  <ul className="mt-2 space-y-2">
                    {content.books.map(pick => (
                      <li key={pick.id}>
                        <button type="button" onClick={() => {
                          const book = books.find(item => item.id === pick.id);
                          if (!book) return;
                          openBookDetail(book);
                          close();
                        }} className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-red-300">
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-slate-900">{pick.title}</span>
                            <span className="mt-1 block text-xs text-slate-600">{pick.reason}</span>
                            <span className="mt-1.5 block text-sm font-bold text-[#94171d]">
                              {vnd(pick.price)} {pick.discount > 0 && <span className="ml-1 text-xs">−{pick.discount}%</span>}
                            </span>
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-[#94171d]" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {content.action === 'contact' && (
                  <Link to="/about" onClick={close} className="mt-2 inline-block text-sm font-semibold text-[#94171d] underline">Mở trang Liên hệ</Link>
                )}
                {content.action === 'cart' && (
                  <button type="button" onClick={() => { setActiveView('cart'); window.scrollTo(0, 0); close(); }} className="mt-2 text-sm font-semibold text-[#94171d] underline">Mở giỏ hàng</button>
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5" aria-label="Câu hỏi gợi ý">
                {starters.map(starter => (
                  <button key={starter} type="button" onClick={() => void send(starter)} className="rounded-full border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#94171d] hover:bg-red-50">
                    {starter}
                  </button>
                ))}
              </div>
            )}
            {pending && <p role="status" className="px-1 text-xs text-slate-600">Em đang kiểm tra…</p>}
          </div>
          <form onSubmit={submit} className="flex shrink-0 gap-2 border-t border-slate-200 p-3">
            <input ref={input} aria-label="Câu hỏi cho PT-BookBot" placeholder="Nhập câu hỏi về sách…" maxLength={360}
              value={draft} onChange={event => setDraft(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 sm:text-sm" />
            <button type="submit" aria-label="Gửi câu hỏi" disabled={pending || !draft.trim()}
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#94171d] text-white hover:bg-red-900 disabled:opacity-50">
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
      <button ref={launcher} type="button" aria-expanded={isOpen} aria-controls={isOpen ? 'pt-bookbot-panel' : undefined}
        onClick={() => { if (isOpen) close(); else setIsOpen(true); }}
        className="flex items-center gap-2 rounded-full bg-[#94171d] px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-900">
        <MessageCircle className="size-5" aria-hidden="true" /> PT-BookBot
      </button>
    </div>
  );
}
