import type { Book } from './types';
import { FREE_SHIPPING_MINIMUM, STANDARD_SHIPPING_FEE } from '../shared/delivery.mjs';

type Topic = 'literature' | 'skills' | 'economics' | 'comics' | 'children' | 'languages' | 'technology';
type Intent = 'recommend' | 'payment' | 'shipping' | 'promotions' | 'support' | 'off-topic';
type Offer = { id: string; title: string; price: number; available: boolean; soldCount: number };
type LiveData = { offers: Offer[]; bankTransferAvailable: boolean; suggestion: { intent: Intent; topic: Topic | null } | null };
export type Recommendation = { id: string; title: string; price: number; discount: number; reason: string };
export type BotReply = { text: string; books?: Recommendation[]; action?: 'contact' | 'cart' };
type Context = { topic?: Topic; budget?: number };

export const vnd = (value: number) => value.toLocaleString('vi-VN') + ' ₫';
export const bookBotGreeting = 'Em là PT-BookBot của Sách Hay. Em có thể tìm sách theo chủ đề, ngân sách hoặc hướng dẫn đặt hàng. Anh/chị muốn tìm sách gì ạ?';

const topics: Record<Topic, { match: RegExp; label: string; reason: string }> = {
  literature: { match: /van hoc|tieu thuyet|truyen ngan|kinh dien|lang man|tinh cam/, label: 'văn học', reason: 'Dành cho người muốn đọc một câu chuyện văn học.' },
  skills: { match: /ky nang|tam ly|phat trien ban than|thoi quen|giao tiep|atomic habits|tu duy/, label: 'kỹ năng và phát triển bản thân', reason: 'Phù hợp nếu anh/chị muốn đọc về kỹ năng và cách suy nghĩ.' },
  economics: { match: /kinh te|kinh doanh|khoi nghiep|marketing|tai chinh|dau tu|lam giau/, label: 'kinh tế và kinh doanh', reason: 'Gợi ý cho người quan tâm kinh tế hoặc tài chính.' },
  comics: { match: /manga|comic|truyen tranh|one piece|conan|spy x family/, label: 'truyện tranh', reason: 'Phù hợp nếu anh/chị thích truyện tranh.' },
  children: { match: /thieu nhi|tre em|cho be|cho con|truyen cho tre/, label: 'thiếu nhi', reason: 'Một lựa chọn cho góc đọc sách của bé.' },
  languages: { match: /ngoai van|ngoai ngu|ielts|tieng anh|toeic|luyen thi/, label: 'ngoại ngữ', reason: 'Một lựa chọn dành cho người muốn đọc hoặc học ngoại ngữ.' },
  technology: { match: /lap trinh|javascript|python|\bphp\b|\bmvc\b|thuat toan|cong nghe|frontend|backend|c\+\+|c\s*plus/, label: 'công nghệ và lập trình', reason: 'Phù hợp nếu anh/chị đang tìm sách công nghệ.' },
};

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').trim();
const words = (text: string) => normalize(text).match(/[a-z0-9]+/g) ?? [];
const filler = new Set('anh chi ban minh toi em shop hay cho goi y tu van muon can mua doc tim xem hoi quyen cuon sach ve loai khong co con hang gia nha mot vai nao phu hop gi duoi tu tren toi ngan sach khoang dong vnd da voi roi di va cua trong'.split(' '));
const findTopic = (text: string) => (Object.keys(topics) as Topic[]).find(topic => topics[topic].match.test(text));

function readBudget(text: string) {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(nghin|ngan|trieu|tr|k|vnd|dong|d|₫)(?![a-z])/i);
  if (match) {
    const [, number, unit] = match;
    const value = /^[\d]+[.,]\d{3}$/.test(number) ? Number(number.replace(/[.,]/g, '')) : Number(number.replace(',', '.'));
    const factor = /^(trieu|tr)$/.test(unit) ? 1_000_000 : /^(k|nghin|ngan)$/.test(unit) ? 1000 : 1;
    return Math.floor(value * factor);
  }
  const plain = text.match(/(?:duoi|toi da|ngan sach|khoang|tam)\s+([\d., ]+)/);
  const value = Number(plain?.[1].replace(/[., ]/g, ''));
  return value >= 1000 ? value : undefined;
}

function getIntent(text: string): Intent | undefined {
  if (/\b(vietqr|cod|chuyen khoan|thanh toan|dat hang|dat don|mua ngay)\b/.test(text)) return 'payment';
  if (/\b(freeship|mien phi (van chuyen|giao hang)|phi (giao hang|van chuyen)|giao hang|ship)\b/.test(text)) return 'shipping';
  if (/\b(khuyen mai|flash sale|voucher|ma giam|sale|giam gia)\b/.test(text)) return 'promotions';
  if (/\b(lien he|hotline|zalo|so dien thoai|tra cuu|doi tra|hoan tien|dia chi|gio mo cua)\b/.test(text)) return 'support';
  if (/\b(chinh tri|bo phieu|bau cu|thoi tiet|co bac)\b/.test(text)) return 'off-topic';
}

function serviceReply(intent: Intent | undefined, live: LiveData | null): BotReply | undefined {
  if (intent === 'shipping') return {
    text: `Đơn giao tận nơi được miễn phí vận chuyển khi tiền sách từ ${vnd(FREE_SHIPPING_MINIMUM)}. Phí tiêu chuẩn dưới ngưỡng là ${vnd(STANDARD_SHIPPING_FEE)}, trước khi áp dụng voucher. Anh/chị muốn xem phí của giỏ hiện tại không ạ?`,
    action: 'cart',
  };
  if (intent === 'payment') {
    const payment = live?.bankTransferAvailable
      ? 'Anh/chị có thể chọn COD hoặc VietQR. Với VietQR, hãy quét mã trên đơn và giữ đúng số tiền, nội dung. Website tự cập nhật sau khi đối soát.'
      : live ? 'Hiện có thể chọn thanh toán khi nhận hàng (COD).' : 'Anh/chị có thể chọn COD hoặc VietQR nếu phương thức đó xuất hiện ở bước thanh toán.';
    return { text: `Mở sách và bấm Mua ngay, kiểm tra giỏ rồi nhập thông tin nhận hàng. ${payment} Anh/chị muốn mở giỏ không ạ?`, action: 'cart' };
  }
  if (intent === 'support') return { text: 'Anh/chị có thể gửi câu hỏi qua trang Liên hệ để Sách Hay kiểm tra đơn, tồn kho hoặc ưu đãi. Anh/chị muốn mở biểu mẫu hỗ trợ không ạ?', action: 'contact' };
  if (intent === 'off-topic') return { text: 'Em hỗ trợ các câu hỏi về sách, mua hàng và dịch vụ của Sách Hay. Anh/chị muốn tìm sách về chủ đề nào ạ?' };
}

async function loadOffers(query?: string): Promise<LiveData> {
  const response = await fetch('/api/bookbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-SachHay-Request': '1' },
    signal: AbortSignal.timeout(7500),
    body: JSON.stringify(query ? { query } : {}),
  });
  const result = await response.json();
  if (!response.ok || !Array.isArray(result.offers)) throw new Error(result.message);
  return result;
}

export async function answerBookBot(question: string, books: Book[], previous: Context): Promise<{ reply: BotReply; context: Context }> {
  const text = normalize(question);
  if (/^(xin )?chao(?: (em|ban|shop|pt bookbot|a|nhe))?[.!\s]*$|^(hello|hi|hey)[.!\s]*$/.test(text)) {
    return { reply: { text: bookBotGreeting }, context: previous };
  }
  const intent = getIntent(text);
  const localReply = intent === 'payment' ? undefined : serviceReply(intent, null);
  if (localReply) return { reply: localReply, context: previous };

  const budget = readBudget(text);
  const topic = findTopic(text);
  const exact = books.find(book => {
    const title = normalize(book.title).replace(/\s*[(-].*$/, '').trim();
    return title.length >= 4 && text.includes(title);
  });
  const tokens = [...new Set(words(text).filter(word => word.length > 1 && !filler.has(word) && !/^\d/.test(word) && !['nghin', 'ngan', 'trieu'].includes(word)))];
  const identifyingTitle = Boolean(exact) || /\b(co ban|con sach|co cuon|con cuon|kiem tra ton|con hang)\b/.test(text);
  const generic = /\b(goi y|ban chay|doc gi|sach hay|tu van)\b/.test(text);
  let live: LiveData;
  try {
    live = await loadOffers(intent || topic || exact || !tokens.length ? undefined : question);
  } catch {
    if (intent === 'payment') return { reply: serviceReply(intent, null)!, context: previous };
    return { reply: { text: 'Em chưa kiểm tra được giá và tồn kho lúc này. Anh/chị muốn gửi tên sách qua trang Liên hệ để cửa hàng kiểm tra không ạ?', action: 'contact' }, context: previous };
  }

  const mode = intent ?? live.suggestion?.intent;
  const service = serviceReply(mode, live);
  if (service) return { reply: service, context: previous };
  const selectedTopic = topic ?? live.suggestion?.topic ?? (exact && findTopic(normalize(exact.categoryName))) ?? (budget !== undefined ? previous.topic : undefined);
  const ceiling = budget ?? (selectedTopic && selectedTopic === previous.topic ? previous.budget : undefined);
  const context: Context = { topic: selectedTopic, budget: ceiling };
  const available = new Map(live.offers.map(offer => [offer.id, offer]));
  const matching = books.flatMap(book => {
    const offer = available.get(book.id);
    if (!offer?.available || (ceiling !== undefined && offer.price > ceiling)) return [];
    if (mode === 'promotions' && offer.price >= book.originalPrice) return [];
    const title = normalize(offer.title);
    const bookWords = new Set(words(`${book.author} ${book.categoryName} ${book.description}`));
    const byTopic = selectedTopic && topics[selectedTopic].match.test(normalize(`${book.categoryName} ${book.title} ${book.description}`));
    const titleWords = new Set(words(title));
    const keywordScore = tokens.reduce((score, token) => score + (titleWords.has(token) ? 4 : bookWords.has(token) ? 1 : 0), 0);
    const isExact = exact?.id === book.id;
    if (identifyingTitle && !isExact && !byTopic && keywordScore < 4) return [];
    if (selectedTopic && !byTopic && !isExact && keywordScore < 4) return [];
    if (!selectedTopic && !generic && ceiling === undefined && !mode && !isExact && keywordScore < 4) return [];
    return [{ book, offer, isExact, byTopic, score: (isExact ? 100 : 0) + (byTopic ? 15 : 0) + keywordScore }];
  }).sort((a, b) => b.score - a.score || b.offer.soldCount - a.offer.soldCount);

  const exactOffer = exact && available.get(exact.id);
  const exactMissing = Boolean(exact && (!exactOffer?.available || (ceiling !== undefined && exactOffer.price > ceiling)));
  const maxBooks = exact && !exactMissing ? 1 : identifyingTitle ? 2 : 3;
  const picks = matching.slice(0, maxBooks).map(({ book, offer, byTopic }) => ({
    id: book.id,
    title: offer.title,
    price: offer.price,
    discount: book.originalPrice > offer.price ? Math.round(100 * (1 - offer.price / book.originalPrice)) : 0,
    reason: byTopic && selectedTopic ? topics[selectedTopic].reason : book.shortDescription?.slice(0, 105) || `Thuộc nhóm ${book.categoryName}.`,
  }));

  if (!picks.length) {
    const reason = ceiling !== undefined ? `Em chưa tìm thấy sách phù hợp trong ngân sách ${vnd(ceiling)}.`
      : exactMissing ? `Em chưa xác nhận được cuốn “${exact?.title}” đang còn hàng.`
      : selectedTopic ? `Em chưa thấy sách ${topics[selectedTopic].label} phù hợp đang còn hàng.`
      : 'Em chưa tìm được đầu sách khớp với câu hỏi này.';
    return { reply: { text: `${reason} Anh/chị muốn thử chủ đề khác hoặc nhờ cửa hàng tìm giúp không ạ?`, action: 'contact' }, context };
  }
  const lead = exactMissing
    ? `${!exactOffer ? 'Em chưa xác nhận được tồn kho của cuốn anh/chị hỏi.' : !exactOffer.available ? 'Cuốn anh/chị hỏi đang hết hàng.' : 'Cuốn anh/chị hỏi vượt ngân sách.'} Em tìm được vài lựa chọn gần nhất.`
    : identifyingTitle && !exact ? 'Em chưa tìm được tựa sách khớp chính xác. Anh/chị có thể xem các lựa chọn gần nhất bên dưới.'
    : mode === 'promotions' ? 'Em tìm được những cuốn đang giảm giá và còn hàng.'
    : 'Em tìm được sách đang còn hàng phù hợp với yêu cầu của anh/chị.';
  return { reply: { text: `${lead} Anh/chị muốn xem chi tiết cuốn nào ạ?`, books: picks }, context };
}
