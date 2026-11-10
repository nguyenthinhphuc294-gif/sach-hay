import { Book, Category, Banner, Promotion, Review, User, Order } from '../types';

import HERO_BANNER_IMG from '../assets/images/sachhay_hero_banner_books_1794211099029.jpg';
import PROMO_MANGA_IMG from '../assets/images/sachhay_hero_promo_manga_1794211099544.jpg';
import PROMO_STATIONERY_IMG from '../assets/images/sachhay_hero_promo_stationery_1794211099688.jpg';
import FLASH_SALE_BANNER_IMG from '../assets/images/sachhay_flash_sale_banner_1794211099990.jpg';

export { HERO_BANNER_IMG, PROMO_MANGA_IMG, PROMO_STATIONERY_IMG, FLASH_SALE_BANNER_IMG };

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-van-hoc',
    slug: 'van-hoc',
    name: 'Văn Học',
    iconName: 'BookOpen',
    bookCount: 48,
    isQuickNav: true,
    subcategories: ['Tiểu thuyết', 'Truyện ngắn', 'Tản văn', 'Thơ ca', 'Kinh điển thế giới']
  },
  {
    id: 'cat-kinh-te',
    slug: 'kinh-te',
    name: 'Sách Kinh Tế',
    iconName: 'TrendingUp',
    bookCount: 36,
    isQuickNav: true,
    subcategories: ['Quản trị - Lãnh đạo', 'Marketing - Bán hàng', 'Tài chính - Đầu tư', 'Khởi nghiệp', 'Bài học kinh doanh']
  },
  {
    id: 'cat-ky-nang',
    slug: 'ky-nang-song',
    name: 'Tâm Lý - Kỹ Năng',
    iconName: 'Smile',
    bookCount: 52,
    isQuickNav: true,
    subcategories: ['Rèn luyện nhân cách', 'Kỹ năng giao tiếp', 'Tâm lý học ứng dụng', 'Phát triển bản thân', 'Nuôi dạy con']
  },
  {
    id: 'cat-manga-comic',
    slug: 'truyen-tranh',
    name: 'Manga - Comic',
    iconName: 'Layers',
    bookCount: 64,
    isQuickNav: true,
    subcategories: ['Shounen', 'Shoujo', 'Light Novel', 'Truyện tranh màu', 'Comics Âu Mỹ']
  },
  {
    id: 'cat-thieu-nhi',
    slug: 'sach-thieu-nhi',
    name: 'Sách Thiếu Nhi',
    iconName: 'Sparkles',
    bookCount: 30,
    isQuickNav: true,
    subcategories: ['Truyện cổ tích', 'Bách khoa tri thức thiếu nhi', 'Sách tranh tương tác', 'Khoa học vui']
  },
  {
    id: 'cat-ngoai-van',
    slug: 'sach-ngoai-van',
    name: 'Sách Ngoại Văn',
    iconName: 'Globe',
    bookCount: 22,
    isQuickNav: true,
    subcategories: ['Fiction in English', 'Non-Fiction', 'Business & Management', 'Children Books']
  },
  {
    id: 'cat-van-phong-pham',
    slug: 'van-phong-pham',
    name: 'Văn Phòng Phẩm',
    iconName: 'PenTool',
    bookCount: 40,
    isQuickNav: true,
    subcategories: ['Bút ký cao cấp', 'Sổ tay & Planner', 'Màu vẽ mỹ thuật', 'Dụng cụ học sinh']
  },
  {
    id: 'cat-giao-khoa',
    slug: 'sach-giao-khoa',
    name: 'Sách Giáo Khoa',
    iconName: 'GraduationCap',
    bookCount: 28,
    isQuickNav: true,
    subcategories: ['Tiểu học', 'THCS', 'THPT', 'Sách tham khảo - Luyện thi']
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-hero-1',
    title: 'Hội Sách Sách Hay 2026 - Giảm đến 50% Toàn Bộ Tác Phẩm Kinh Điển',
    imageUrl: HERO_BANNER_IMG,
    linkTarget: '/books?category=van-hoc',
    type: 'hero',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'banner-side-1',
    title: 'Thiên Đường Manga & Light Novel Nhật Bản - Độc Quyền Quà Tặng',
    imageUrl: PROMO_MANGA_IMG,
    linkTarget: '/books?category=truyen-tranh',
    type: 'promo_side',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'banner-side-2',
    title: 'Thế Giới Văn Phòng Phẩm Pastel - Bút Ký & Sổ Tay Da Cao Cấp',
    imageUrl: PROMO_STATIONERY_IMG,
    linkTarget: '/books?category=van-phong-pham',
    type: 'promo_side',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'banner-flash-1',
    title: 'FLASH SALE Giờ Vàng - Giảm Sốc Duy Nhất Hôm Nay',
    imageUrl: FLASH_SALE_BANNER_IMG,
    linkTarget: '/flash-sale',
    type: 'flash_sale',
    isActive: true,
    sortOrder: 1
  }
];

// High quality resilient book covers generator
const createCoverSvg = (title: string, author: string, color: string, accent: string) => {
  const encodedSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
        <pattern id="pattern" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.12)" />
        </pattern>
      </defs>
      <rect width="400" height="580" fill="url(#grad)" rx="8" />
      <rect width="400" height="580" fill="url(#pattern)" rx="8" />
      <rect x="0" y="0" width="18" height="580" fill="rgba(0,0,0,0.25)" />
      <line x1="22" y1="0" x2="22" y2="580" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />

      <circle cx="200" cy="180" r="85" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <circle cx="200" cy="180" r="75" fill="rgba(255,255,255,0.08)" />

      <!-- Logo brand top -->
      <text x="200" y="60" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="3" opacity="0.9">Sách Hay SELECTION</text>

      <!-- Book Title -->
      <foreignObject x="35" y="115" width="330" height="150">
        <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;">
          <h1 style="color:#FFFFFF;font-family:Georgia,serif;font-size:24px;font-weight:bold;line-height:1.25;text-shadow:0 2px 4px rgba(0,0,0,0.4);margin:0;padding:0 8px;">
            ${title}
          </h1>
        </div>
      </foreignObject>

      <line x1="80" y1="285" x2="320" y2="285" stroke="rgba(255,255,255,0.3)" stroke-width="1" />

      <!-- Author -->
      <text x="200" y="325" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="600" letter-spacing="1" opacity="0.95">${author}</text>

      <rect x="150" y="480" width="100" height="28" rx="14" fill="rgba(255,255,255,0.2)" />
      <text x="200" y="499" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="600" letter-spacing="1">BESTSELLER</text>

      <text x="200" y="550" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="11" opacity="0.75">NHÀ XUẤT BẢN UY TÍN VIỆT NAM</text>
    </svg>
  `);
  return `data:image/svg+xml;utf8,${encodedSvg}`;
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-01',
    slug: 'cay-cam-ngot-cua-toi',
    title: 'Cây Cam Ngọt Của Tôi',
    originalTitle: 'Meu Pé de Laranja Lima',
    author: 'José Mauro de Vasconcelos',
    authorId: 'auth-jose-mauro',
    publisher: 'NXB Hội Nhà Văn & Nhã Nam',
    supplier: 'Nhã Nam',
    isbn: '978-604-989-123-4',
    price: 86400,
    originalPrice: 108000,
    discountPercent: 20,
    coverImage: createCoverSvg('Cây Cam Ngọt Của Tôi', 'José Mauro', '#E65100', '#BF360C'),
    thumbnails: [
      createCoverSvg('Cây Cam Ngọt Của Tôi', 'José Mauro', '#E65100', '#BF360C'),
      createCoverSvg('Mặt Sau', 'Trích Đoạn Hay', '#BF360C', '#870000')
    ],
    categoryId: 'cat-van-hoc',
    categoryName: 'Văn Học',
    stock: 45,
    soldCount: 3840,
    rating: 4.9,
    reviewCount: 342,
    format: 'Bìa mềm',
    publicationYear: 2023,
    pages: 244,
    language: 'Tiếng Việt',
    dimensions: '14 x 20.5 cm',
    weight: 320,
    description: 'Một câu chuyện cảm động và tràn ngập tình yêu thương về cậu bé Zezé 5 tuổi thông minh, giàu trí tưởng tượng nhưng thiếu thốn tình cảm gia đình. Người bạn tri kỷ duy nhất lắng nghe mọi tâm sự của em chính là cây cam ngọt sau vườn.',
    shortDescription: 'Tác phẩm văn học kinh điển Brazil làm thổn thức hàng triệu trái tim độc giả toàn cầu.',
    isFlashSale: true,
    flashSaleRemaining: 8,
    isTrending: true,
    isBestSeller: true
  },
  {
    id: 'book-02',
    slug: 'nha-gia-kim',
    title: 'Nhà Giả Kim',
    originalTitle: 'O Alquimista',
    author: 'Paulo Coelho',
    authorId: 'auth-paulo-coelho',
    publisher: 'NXB Hà Nội & Nhã Nam',
    supplier: 'Nhã Nam',
    isbn: '978-604-567-890-1',
    price: 63200,
    originalPrice: 79000,
    discountPercent: 20,
    coverImage: createCoverSvg('Nhà Giả Kim', 'Paulo Coelho', '#1565C0', '#0D47A1'),
    thumbnails: [
      createCoverSvg('Nhà Giả Kim', 'Paulo Coelho', '#1565C0', '#0D47A1')
    ],
    categoryId: 'cat-van-hoc',
    categoryName: 'Văn Học',
    stock: 62,
    soldCount: 9410,
    rating: 4.8,
    reviewCount: 820,
    format: 'Bìa mềm',
    publicationYear: 2024,
    pages: 228,
    language: 'Tiếng Việt',
    dimensions: '13 x 20.5 cm',
    weight: 280,
    description: 'Khi bạn khao khát một điều gì đó, cả vũ trụ sẽ hợp lực giúp bạn đạt được điều đó. Cuộc phiêu lưu tìm kiếm kho báu của chàng chăn cừu Santiago là bài học sâu sắc về việc lắng nghe trái tim và theo đuổi ước mơ.',
    shortDescription: 'Cuốn sách bán chạy chỉ sau Kinh Thánh, truyền cảm hứng sống cho mọi thế hệ.',
    isFlashSale: true,
    flashSaleRemaining: 15,
    isTrending: true,
    isBestSeller: true
  },
  {
    id: 'book-03',
    slug: 'dac-nhan-tam',
    title: 'Đắc Nhân Tâm',
    originalTitle: 'How to Win Friends and Influence People',
    author: 'Dale Carnegie',
    authorId: 'auth-dale-carnegie',
    publisher: 'NXB Tổng Hợp TP.HCM',
    supplier: 'First News - Trí Việt',
    isbn: '978-604-582-145-6',
    price: 90000,
    originalPrice: 120000,
    discountPercent: 25,
    coverImage: createCoverSvg('Đắc Nhân Tâm', 'Dale Carnegie', '#B71C1C', '#880E4F'),
    thumbnails: [
      createCoverSvg('Đắc Nhân Tâm', 'Dale Carnegie', '#B71C1C', '#880E4F')
    ],
    categoryId: 'cat-ky-nang',
    categoryName: 'Tâm Lý - Kỹ Năng',
    stock: 80,
    soldCount: 15200,
    rating: 4.9,
    reviewCount: 1450,
    format: 'Bìa mềm',
    publicationYear: 2024,
    pages: 320,
    language: 'Tiếng Việt',
    dimensions: '14.5 x 20.5 cm',
    weight: 420,
    description: 'Nghệ thuật ứng xử, giao tiếp và thu phục lòng người kinh điển nhất mọi thời đại. Cuốn sách giúp bạn xây dựng mối quan hệ bền vững, thấu hiểu tâm lý con người và đạt được sự tôn trọng trong công việc lẫn cuộc sống.',
    shortDescription: 'Cuốn sách gối đầu giường của mọi nhà lãnh đạo và người thành công.',
    isTrending: true,
    isBestSeller: true
  },
  {
    id: 'book-04',
    slug: 'one-piece-tap-108',
    title: 'One Piece - Tập 108: Thế Giới Mới',
    originalTitle: 'One Piece 108',
    author: 'Eiichiro Oda',
    authorId: 'auth-eiichiro-oda',
    publisher: 'NXB Kim Đồng',
    supplier: 'Kim Đồng',
    isbn: '978-604-232-108-0',
    price: 25000,
    originalPrice: 30000,
    discountPercent: 17,
    coverImage: createCoverSvg('ONE PIECE #108', 'Eiichiro Oda', '#E91E63', '#880E4F'),
    thumbnails: [
      createCoverSvg('ONE PIECE #108', 'Eiichiro Oda', '#E91E63', '#880E4F')
    ],
    categoryId: 'cat-manga-comic',
    categoryName: 'Manga - Comic',
    stock: 120,
    soldCount: 6800,
    rating: 5.0,
    reviewCount: 520,
    format: 'Bìa mềm',
    publicationYear: 2024,
    pages: 192,
    language: 'Tiếng Việt',
    dimensions: '11.3 x 17.6 cm',
    weight: 180,
    description: 'Chuyến hải trình của băng hải tặc Mũ Rơm bước vào giai đoạn cao trào nghẹt thở nhất tại đảo Egghead. Những bí mật động trời về Chính Quyền Thế Giới và Thế Kỷ Trống dần được hé lộ.',
    shortDescription: 'Tập truyện tranh manga ăn khách số 1 thế giới với phiên bản dịch chuẩn từ Kim Đồng.',
    isFlashSale: true,
    flashSaleRemaining: 24,
    isTrending: true,
    isNewRelease: true
  },
  {
    id: 'book-05',
    slug: 'day-con-lam-giau-tap-1',
    title: 'Dạy Con Làm Giàu - Tập 1: Để Không Có Tiền Vẫn Tạo Ra Tiền',
    originalTitle: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    authorId: 'auth-robert-kiyosaki',
    publisher: 'NXB Trẻ',
    supplier: 'NXB Trẻ',
    isbn: '978-604-102-349-8',
    price: 76500,
    originalPrice: 90000,
    discountPercent: 15,
    coverImage: createCoverSvg('Dạy Con Làm Giàu', 'Robert Kiyosaki', '#4A148C', '#311B92'),
    thumbnails: [
      createCoverSvg('Dạy Con Làm Giàu', 'Robert Kiyosaki', '#4A148C', '#311B92')
    ],
    categoryId: 'cat-kinh-te',
    categoryName: 'Sách Kinh Tế',
    stock: 55,
    soldCount: 7800,
    rating: 4.7,
    reviewCount: 620,
    format: 'Bìa mềm',
    publicationYear: 2023,
    pages: 260,
    language: 'Tiếng Việt',
    dimensions: '13 x 20 cm',
    weight: 340,
    description: 'Cuốn sách làm thay đổi hoàn toàn tư duy tài chính của hàng chục triệu người. Tác giả chỉ ra sự khác biệt cơ bản giữa cách người giàu và người nghèo dạy con về tiền bạc, tài sản và tiêu sản.',
    shortDescription: 'Cẩm nang vỡ lòng về tự do tài chính và đầu tư thông minh.',
    isTrending: true,
    isBestSeller: true
  },
  {
    id: 'book-06',
    slug: 'mat-biec',
    title: 'Mắt Biếc (Tái Bản Đặc Biệt)',
    author: 'Nguyễn Nhật Ánh',
    authorId: 'auth-nguyen-nhat-anh',
    publisher: 'NXB Trẻ',
    supplier: 'NXB Trẻ',
    isbn: '978-604-118-490-2',
    price: 88000,
    originalPrice: 110000,
    discountPercent: 20,
    coverImage: createCoverSvg('Mắt Biếc', 'Nguyễn Nhật Ánh', '#2E7D32', '#1B5E20'),
    thumbnails: [
      createCoverSvg('Mắt Biếc', 'Nguyễn Nhật Ánh', '#2E7D32', '#1B5E20')
    ],
    categoryId: 'cat-van-hoc',
    categoryName: 'Văn Học',
    stock: 38,
    soldCount: 5200,
    rating: 4.9,
    reviewCount: 410,
    format: 'Bìa mềm',
    publicationYear: 2024,
    pages: 300,
    language: 'Tiếng Việt',
    dimensions: '13 x 20 cm',
    weight: 360,
    description: 'Chuyện tình đơn phương trong sáng mà da diết của Ngạn dành cho cô bạn thời thơ ấu Hà Lan với đôi mắt biếc biếc như bầu trời làng Đo Đo. Một tác phẩm đã trở thành biểu tượng thanh xuân của người Việt.',
    shortDescription: 'Kiệt tác truyện dài của nhà văn Nguyễn Nhật Ánh đẫm chất thơ và hoài niệm.',
    isTrending: true,
    isBestSeller: true
  },
  {
    id: 'book-07',
    slug: 'tu-duy-nhanh-va-cham',
    title: 'Tư Duy Nhanh Và Chậm',
    originalTitle: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    authorId: 'auth-daniel-kahneman',
    publisher: 'NXB Thế Giới & Alpha Books',
    supplier: 'Alpha Books',
    isbn: '978-604-773-190-3',
    price: 195000,
    originalPrice: 260000,
    discountPercent: 25,
    coverImage: createCoverSvg('Tư Duy Nhanh & Chậm', 'Daniel Kahneman', '#37474F', '#263238'),
    thumbnails: [
      createCoverSvg('Tư Duy Nhanh & Chậm', 'Daniel Kahneman', '#37474F', '#263238')
    ],
    categoryId: 'cat-ky-nang',
    categoryName: 'Tâm Lý - Kỹ Năng',
    stock: 25,
    soldCount: 3100,
    rating: 4.8,
    reviewCount: 290,
    format: 'Bìa mềm',
    publicationYear: 2023,
    pages: 612,
    language: 'Tiếng Việt',
    dimensions: '16 x 24 cm',
    weight: 750,
    description: 'Khám phá hai hệ thống chi phối cách chúng ta suy nghĩ và đưa ra quyết định: Hệ thống 1 nhanh, trực quan, cảm xúc; và Hệ thống 2 chậm, lý trí, logic. Tác phẩm của người từng đoạt giải Nobel Kinh tế.',
    shortDescription: 'Tác phẩm kinh điển về tâm lý học hành vi và khoa học nhận thức.',
    isFlashSale: true,
    flashSaleRemaining: 5
  },
  {
    id: 'book-08',
    slug: 'tham-tu-lung-danh-conan-tap-104',
    title: 'Thám Tử Lừng Danh Conan - Tập 104',
    originalTitle: 'Detective Conan 104',
    author: 'Gosho Aoyama',
    authorId: 'auth-gosho-aoyama',
    publisher: 'NXB Kim Đồng',
    supplier: 'Kim Đồng',
    isbn: '978-604-230-104-5',
    price: 25000,
    originalPrice: 30000,
    discountPercent: 17,
    coverImage: createCoverSvg('CONAN #104', 'Gosho Aoyama', '#00838F', '#006064'),
    thumbnails: [
      createCoverSvg('CONAN #104', 'Gosho Aoyama', '#00838F', '#006064')
    ],
    categoryId: 'cat-manga-comic',
    categoryName: 'Manga - Comic',
    stock: 90,
    soldCount: 8200,
    rating: 4.9,
    reviewCount: 480,
    format: 'Bìa mềm',
    publicationYear: 2024,
    pages: 184,
    language: 'Tiếng Việt',
    dimensions: '11.3 x 17.6 cm',
    weight: 175,
    description: 'Vụ án bí ẩn liên quan đến Tổ chức Áo đen cùng cuộc chạm trán nảy lửa của Conan và các đặc vụ FBI. Liệu danh tính thực sự của nhân vật số 2 Rum có chính thức được vạch trần?',
    shortDescription: 'Manga trinh thám huyền thoại gắn liền với tuổi thơ bao thế hệ bạn đọc.',
    isFlashSale: true,
    flashSaleRemaining: 30,
    isNewRelease: true
  },
  {
    id: 'book-09',
    slug: 'hoang-tu-be',
    title: 'Hoàng Tử Bé (Bản Minh Họa Màu)',
    originalTitle: 'Le Petit Prince',
    author: 'Antoine de Saint-Exupéry',
    authorId: 'auth-exupery',
    publisher: 'NXB Kim Đồng',
    supplier: 'Kim Đồng',
    isbn: '978-604-209-881-2',
    price: 52000,
    originalPrice: 65000,
    discountPercent: 20,
    coverImage: createCoverSvg('Hoàng Tử Bé', 'Saint-Exupéry', '#F57F17', '#E65100'),
    thumbnails: [
      createCoverSvg('Hoàng Tử Bé', 'Saint-Exupéry', '#F57F17', '#E65100')
    ],
    categoryId: 'cat-thieu-nhi',
    categoryName: 'Sách Thiếu Nhi',
    stock: 70,
    soldCount: 4900,
    rating: 4.9,
    reviewCount: 395,
    format: 'Bìa mềm',
    publicationYear: 2024,
    pages: 108,
    language: 'Tiếng Việt',
    dimensions: '14.5 x 20.5 cm',
    weight: 220,
    description: 'Người ta chỉ thấy rõ bằng trái tim, cái cốt tử thì vô hình trong mắt trần. Câu chuyện ngụ ngôn tuyệt mỹ dành cho trẻ em và cho cả những người lớn từng là trẻ em.',
    shortDescription: 'Cuốn sách cổ tích vượt thời gian chứa đựng những bài học tình bạn vĩ đại.',
    isTrending: true
  },
  {
    id: 'book-10',
    slug: 'so-tay-da-pu-vintage-cao-cap',
    title: 'Sổ Tay Da PU Vintage Sách Hay Premium (Kèm Bút Ký)',
    author: 'Sách Hay Stationery',
    authorId: 'auth-sachhay-stationery',
    publisher: 'Sách Hay Design',
    supplier: 'Sách Hay Stationery',
    isbn: 'STN-893-524-001',
    price: 135000,
    originalPrice: 180000,
    discountPercent: 25,
    coverImage: createCoverSvg('Sổ Tay Da Vintage', 'Sách Hay Premium', '#4E342E', '#3E2723'),
    thumbnails: [
      createCoverSvg('Sổ Tay Da Vintage', 'Sách Hay Premium', '#4E342E', '#3E2723')
    ],
    categoryId: 'cat-van-phong-pham',
    categoryName: 'Văn Phòng Phẩm',
    stock: 40,
    soldCount: 1250,
    rating: 4.8,
    reviewCount: 110,
    format: 'Hộp quà tặng',
    publicationYear: 2025,
    pages: 200,
    language: 'Không',
    dimensions: 'A5 (14.8 x 21 cm)',
    weight: 480,
    description: 'Sổ tay bìa da PU cao cấp chống thấm nước, ruột giấy kẻ ngang định lượng 100gsm chống lem mực, tích hợp dây đánh dấu trang và khóa bấm vintage sang trọng.',
    shortDescription: 'Quà tặng tinh tế cho độc giả, học sinh, sinh viên và dân văn phòng.',
    isFlashSale: true,
    flashSaleRemaining: 12
  },
  {
    id: 'book-11',
    slug: 'khi-hoi-tho-hoa-thinh-khong',
    title: 'Khi Hơi Thở Hóa Thinh Không',
    originalTitle: 'When Breath Becomes Air',
    author: 'Paul Kalanithi',
    authorId: 'auth-paul-kalanithi',
    publisher: 'NXB Lao Động & Nhã Nam',
    supplier: 'Nhã Nam',
    isbn: '978-604-598-112-9',
    price: 97500,
    originalPrice: 130000,
    discountPercent: 25,
    coverImage: createCoverSvg('Hơi Thở Hóa Thinh Không', 'Paul Kalanithi', '#004D40', '#00695C'),
    thumbnails: [
      createCoverSvg('Hơi Thở Hóa Thinh Không', 'Paul Kalanithi', '#004D40', '#00695C')
    ],
    categoryId: 'cat-van-hoc',
    categoryName: 'Văn Học',
    stock: 35,
    soldCount: 3200,
    rating: 4.9,
    reviewCount: 280,
    format: 'Bìa mềm',
    publicationYear: 2023,
    pages: 236,
    language: 'Tiếng Việt',
    dimensions: '14 x 20.5 cm',
    weight: 310,
    description: 'Tự truyện xúc động của một bác sĩ phẫu thuật thần kinh tài năng khi đối mặt với căn bệnh ung thư phổi giai đoạn cuối. Cuốn sách là khúc ca về lẽ sống và tình yêu cuộc đời.',
    shortDescription: 'Một trong những cuốn hồi ký lay động tâm can nhất của thế kỷ 21.',
    isTrending: false
  },
  {
    id: 'book-12',
    slug: 'spy-x-family-tap-12',
    title: 'Spy x Family - Tập 12: Nhiệm Vụ Gia Đình',
    originalTitle: 'Spy x Family 12',
    author: 'Tatsuya Endo',
    authorId: 'auth-tatsuya-endo',
    publisher: 'NXB Kim Đồng',
    supplier: 'Kim Đồng',
    isbn: '978-604-231-012-7',
    price: 28000,
    originalPrice: 35000,
    discountPercent: 20,
    coverImage: createCoverSvg('SPY x FAMILY #12', 'Tatsuya Endo', '#558B2F', '#33691E'),
    thumbnails: [
      createCoverSvg('SPY x FAMILY #12', 'Tatsuya Endo', '#558B2F', '#33691E')
    ],
    categoryId: 'cat-manga-comic',
    categoryName: 'Manga - Comic',
    stock: 65,
    soldCount: 4300,
    rating: 5.0,
    reviewCount: 310,
    format: 'Bìa mềm',
    publicationYear: 2024,
    pages: 208,
    language: 'Tiếng Việt',
    dimensions: '11.3 x 17.6 cm',
    weight: 185,
    description: 'Gia đình Forger gồm điệp viên Loid, sát thủ Yor và cô bé ngoại cảm Anya tiếp tục đối mặt với những phi vụ hài hước nhưng không kém phần nguy hiểm để bảo vệ nền hòa bình.',
    shortDescription: 'Hiện tượng manga hài hước - trinh thám được yêu thích nhất hiện nay.',
    isNewRelease: true
  }
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-01',
    code: 'SACHHAY20K',
    title: 'Giảm 20.000đ cho đơn hàng từ 150.000đ',
    discountType: 'fixed',
    discountValue: 20000,
    minOrderValue: 150000,
    expiresAt: '2026-12-31',
    isActive: true,
    usageCount: 1420,
    description: 'Áp dụng cho mọi đơn sách tại Sách Hay'
  },
  {
    id: 'promo-02',
    code: 'FREESHIP',
    title: 'Miễn phí vận chuyển toàn quốc (Tối đa 30.000đ)',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderValue: 250000,
    expiresAt: '2026-12-31',
    isActive: true,
    usageCount: 2310,
    description: 'Áp dụng cho đơn hàng từ 250.000đ'
  },
  {
    id: 'promo-03',
    code: 'GIAM15',
    title: 'Giảm 15% cho đơn sách từ 300.000đ',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 300000,
    maxDiscount: 60000,
    expiresAt: '2026-12-31',
    isActive: true,
    usageCount: 890,
    description: 'Giảm tối đa 60.000đ cho đơn mua từ 300.000đ'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    bookId: 'book-01',
    userName: 'Minh Trí (Hà Nội)',
    rating: 5,
    comment: 'Sách đóng gói rất cẩn thận, có bọc xốp chống sốc. Nội dung quá xúc động, mình đọc đến đoạn cuối mà rơi nước mắt. Cực kỳ khuyên đọc!',
    createdAt: '2026-11-02',
    verifiedPurchase: true
  },
  {
    id: 'rev-02',
    bookId: 'book-01',
    userName: 'Lan Hương (TP.HCM)',
    rating: 5,
    comment: 'Giao hàng nhanh 2 ngày đã nhận được. Bìa sách đẹp, giấy xốp nhẹ cầm êm tay. Sách Hay phục vụ rất chu đáo.',
    createdAt: '2026-11-04',
    verifiedPurchase: true
  },
  {
    id: 'rev-03',
    bookId: 'book-02',
    userName: 'Hoàng Long (Đà Nẵng)',
    rating: 5,
    comment: 'Đã đọc cuốn này lần thứ 3. Mỗi độ tuổi đọc lại đều ngộ ra một góc nhìn mới về cuộc sống. Bản in sắc nét!',
    createdAt: '2026-10-28',
    verifiedPurchase: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-01',
    orderCode: 'SH-20261108-1029',
    customerName: 'Nguyễn Văn An',
    phone: '0912345678',
    email: 'an.nguyen@gmail.com',
    province: 'Thành phố Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    address: 'Số 45 Lê Lợi',
    notes: 'Giao giờ hành chính giúp em',
    paymentMethod: 'COD',
    status: 'shipping',
    items: [
      {
        bookId: 'book-01',
        title: 'Cây Cam Ngọt Của Tôi',
        coverImage: createCoverSvg('Cây Cam Ngọt Của Tôi', 'José Mauro', '#E65100', '#BF360C'),
        price: 86400,
        quantity: 1,
        total: 86400
      },
      {
        bookId: 'book-04',
        title: 'One Piece - Tập 108: Thế Giới Mới',
        coverImage: createCoverSvg('ONE PIECE #108', 'Eiichiro Oda', '#E91E63', '#880E4F'),
        price: 25000,
        quantity: 2,
        total: 50000
      }
    ],
    subtotal: 136400,
    discount: 20000,
    shippingFee: 25000,
    total: 141400,
    createdAt: '2026-11-08T08:30:00Z',
    statusHistory: [
      { status: 'pending', timestamp: '2026-11-08 08:30', note: 'Đơn hàng được khởi tạo thành công' },
      { status: 'confirmed', timestamp: '2026-11-08 09:15', note: 'Nhà sách Sách Hay đã xác nhận đơn' },
      { status: 'processing', timestamp: '2026-11-08 10:00', note: 'Đã đóng gói và niêm phong kiện hàng' },
      { status: 'shipping', timestamp: '2026-11-08 14:00', note: 'Đơn vị vận chuyển đang phát hàng' }
    ],
    voucherCode: 'SACHHAY20K'
  },
  {
    id: 'ord-02',
    orderCode: 'SH-20261107-0941',
    customerName: 'Trần Thị Mai',
    phone: '0987654321',
    email: 'mai.tran@gmail.com',
    province: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Dịch Vọng Hậu',
    address: 'Số 18 Duy Tân',
    paymentMethod: 'COD',
    status: 'completed',
    items: [
      {
        bookId: 'book-03',
        title: 'Đắc Nhân Tâm',
        coverImage: createCoverSvg('Đắc Nhân Tâm', 'Dale Carnegie', '#B71C1C', '#880E4F'),
        price: 90000,
        quantity: 1,
        total: 90000
      }
    ],
    subtotal: 90000,
    discount: 0,
    shippingFee: 30000,
    total: 120000,
    createdAt: '2026-11-07T14:15:00Z',
    statusHistory: [
      { status: 'pending', timestamp: '2026-11-07 14:15', note: 'Khách hàng đặt hàng trực tuyến' },
      { status: 'confirmed', timestamp: '2026-11-07 14:45', note: 'Đã xác nhận thanh toán COD' },
      { status: 'shipping', timestamp: '2026-11-08 08:00', note: 'Bưu tá đang giao tới địa chỉ nhận' },
      { status: 'completed', timestamp: '2026-11-08 16:30', note: 'Giao hàng thành công. Khách đã thanh toán.' }
    ]
  }
];

export const DEMO_ADMIN: User = {
  id: 'usr-admin-01',
  name: 'Quản Trị Viên Sách Hay',
  email: 'admin@sachhay.vn',
  phone: '0909999888',
  role: 'admin',
  addresses: []
};
