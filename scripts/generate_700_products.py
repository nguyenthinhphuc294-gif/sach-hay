# -*- coding: utf-8 -*-
import sqlite3
import json
import urllib.parse
import os
import random

# Category definitions
CATEGORIES = [
    {
        "name": "Văn Học",
        "id": "cat-van-hoc",
        "theme": {"bg1": "#8D1B1B", "bg2": "#4A0E0E", "accent": "#FFD54F", "badge": "VĂN HỌC KINH ĐIỂN"},
        "authors": ["Nguyễn Nhật Ánh", "Nam Cao", "Vũ Trọng Phụng", "Nguyễn Tuân", "Bảo Ninh", "Kim Lân", "Ngô Tất Tố", "Gabriel García Márquez", "Paulo Coelho", "Haruki Murakami", "Franz Kafka", "Victor Hugo", "Ernest Hemingway", "Jane Austen", "Leo Tolstoy", "Fyodor Dostoevsky", "Khaled Hosseini"],
        "publishers": ["NXB Hội Nhà Văn", "NXB Trẻ", "NXB Văn Học", "Nhã Nam", "NXB Kim Đồng"],
        "titles": [
            "Tuổi Thơ Dữ Dội", "Nỗi Buồn Chiến Tranh", "Số Đỏ", "Chí Phèo", "Vợ Nhặt", "Tắt Đèn", "Bỉ Vỏ", "Vang Bóng Một Thời",
            "Chiếc Thuyền Ngoài Xa", "Bến Quê", "Mảnh Trăng Cuối Rừng", "Dấu Chân Người Lính", "Rừng Xà Nu", "Đất Nước Đứng Lên",
            "Sống Mòn", "Lão Hạc", "Giông Tố", "Vỡ Đê", "Bước Đường Cùng", "Kính Vạn Hoa", "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
            "Cho Tôi Xin Một Vé Đi Tuổi Thơ", "Cô Gái Đến Từ Hôm Qua", "Hạ Đỏ", "Bàn Có Năm Chỗ Ngồi", "Đi Qua Hoa Cúc",
            "Ngồi Khóc Trên Cây", "Cảm Ơn Người Lớn", "Con Chó Nhỏ Mang Giỏ Hoa Hồng", "Ngày Xưa Có Một Chuyện Tình", "Mắt Biếc",
            "Cây Cam Ngọt Của Tôi", "Nhà Giả Kim", "Trăm Năm Cô Đơn", "Tình Yêu Thời Thổ Tả", "Ông Già Và Biển Cả",
            "Chuông Nguyện Hồn Ai", "Giã Từ Vũ Khí", "Tiếng Chim Hót Trong Bụi Mận Gai", "Cuốn Theo Chiều Gió", "Đồi Gió Hú",
            "Jane Eyre", "Kiêu Hãnh Và Định Kiến", "Lý Trí Và Tình Cảm", "Chiến Tranh Và Hòa Bình", "Anna Karenina",
            "Tội Ác Và Trừng Phạt", "Anh Em Nhà Karamazov", "Kẻ Ngốc", "Những Người Khốn Khổ", "Nhà Thờ Đức Bà Paris",
            "Không Gia Đình", "Trong Gia Đình", "Người Đua Diều", "Ngàn Mặt Trời Rực Rỡ", "Và Rồi Núi Vọng", "Rừng Na Uy",
            "Biên Niên Sử Chim Vặn Dây Cót", "Phía Nam Biên Giới Phía Tây Mặt Trời", "1Q84 Tập 1", "1Q84 Tập 2", "1Q84 Tập 3",
            "Kafka Bên Bờ Biển", "Giết Con Chim Nhại", "Bắt Trẻ Đồng Xanh", "1984 - Bản Tiếng Việt", "Trại Súc Vật", "Suối Nguồn",
            "Atlas Vươn Mình", "Gatsby Vĩ Đại", "Hóa Thân", "Lâu Đài", "Vụ Án", "Người Xa Lạ", "Dịch Hạch", "Bá Tước Monte Cristo",
            "Ba Chàng Lính Ngự Lâm", "Chuông Gió Trăng", "Xứ Tuyết", "Tiếng Cười Của Gió", "Cao Lương Đỏ", "Sống (Dư Hoa)",
            "Chuyện Hứa Tam Quan Bán Máu", "Gió Đầu Mùa", "Nắng Trong Vườn", "Hà Nội Ba Mươi Sáu Phố Phường", "Thương Nhớ Mười Hai",
            "Miếng Ngon Hà Nội", "Miếng Ngọt Miền Nam", "Đôi Mắt", "Một Bữa No", "Trăng Sáng", "Đời Thừa", "Chân Trời Cũ",
            "Cay Đắng Mùi Đời", "Con Nhà Nghèo", "Tiền Bạc Bạc Tiền", "Hồn Bướm Mơ Tiên", "Gia Đình Tôi Và Các Loài Thú Khác",
            "Hành Trình Về Phương Đông", "Dế Mèn Và Thế Giới Mộng Mơ"
        ]
    },
    {
        "name": "Sách Kinh Tế",
        "id": "cat-kinh-te",
        "theme": {"bg1": "#0D47A1", "bg2": "#002171", "accent": "#64FFDA", "badge": "KINH TẾ & DOANH CHỦ"},
        "authors": ["Robert T. Kiyosaki", "Warren Buffett", "Benjamin Graham", "Peter Lynch", "Jim Collins", "Eric Ries", "W. Chan Kim", "Napoleon Hill", "Simon Sinek", "Philip Fisher", "Morgan Housel", "Ray Dalio", "Peter Thiel"],
        "publishers": ["NXB Trẻ", "NXB Lao Động Xã Hội", "Alpha Books", "NXB Công Thương", "First News - Trí Việt"],
        "titles": [
            "Dạy Con Làm Giàu - Tập 1: Để Không Có Tiền Vẫn Tạo Ra Tiền",
            "Dạy Con Làm Giàu - Tập 2: Sử Dụng Đồng Vốn",
            "Dạy Con Làm Giàu - Tập 3: Hướng Dẫn Đầu Tư",
            "Dạy Con Làm Giàu - Tập 4: Người Kinh Doanh Thông Minh",
            "Dạy Con Làm Giàu - Tập 5: Nghỉ Hưu Sớm Nghỉ Hưu Giàu",
            "Dạy Con Làm Giàu - Tập 6: Lời Khuyên Tài Chính",
            "Dạy Con Làm Giàu - Tập 7: Ai Đã Lấy Tiền Của Tôi",
            "Dạy Con Làm Giàu - Tập 8: Để Có Những Đồng Tiền Tích Cực",
            "Dạy Con Làm Giàu - Tập 9: Những Bí Mật Về Tiền Bạc",
            "Dạy Con Làm Giàu - Tập 10: Trước Khi Bạn Từ Bỏ Công Việc",
            "Dạy Con Làm Giàu - Tập 11: Trường Dạy Kinh Doanh",
            "Dạy Con Làm Giàu - Tập 12: Tiên Đoán Về Tài Chính",
            "Dạy Con Làm Giàu - Tập 13: Nâng Cao Chỉ Số IQ Tài Chính",
            "Dạy Con Làm Giàu - Tập 14: Phát Huy Tiềm Năng Tài Chính",
            "Nhà Đầu Tư Thông Minh", "Bước Đi Ngẫu Nhiên Trên Phố Wall", "Từ Tốt Đến Vĩ Đại", "Xây Dựng Để Trường Tồn",
            "Khởi Nghiệp Tinh Gọn", "Chiến Lược Đại Dương Xanh", "Nghĩ Giàu Làm Giàu", "Quốc Gia Khởi Nghiệp",
            "Bắt Đầu Với Câu Hỏi Tại Sao", "Cổ Phiếu Thường Lợi Nhuận Phi Thường", "Tâm Lý Học Về Tiền", "Nguyên Tắc (Principles)",
            "Không Đến Một (Zero to One)", "Bí Mật DotCom", "Bí Mật Chuyên Gia", "Bí Mật Traffic", "Dốc Hết Trái Tim (Starbucks)",
            "Đến Starbucks Mua Cà Phê Cỡ Lớn", "Kinh Tế Học Hài Hước", "Siêu Kinh Tế Học Hài Hước", "Lược Sử Kinh Tế",
            "Bản Đồ Tư Duy Trong Kinh Doanh", "Nghệ Thuật Bán Hàng Bậc Cao", "Quản Trị Hiện Đại Peter Drucker",
            "Marketing Giỏi Phải Kiếm Được Tiền", "Tử Huyệt Cảm Xúc Trong Đàm Phán", "Người Giàu Có Nhất Thành Babylon",
            "Đánh Bại Phố Wall", "Kinh Doanh Quốc Tế Hiện Đại", "Chiến Lược Cạnh Tranh Michael Porter", "Lãnh Đạo Phục Vụ",
            "Thấu Hiểu Khách Hàng", "Sáng Tạo Trong Khủng Hoảng", "Tài Chính Doanh Nghiệp Căn Bản", "Phân Tích Báo Cáo Tài Chính",
            "Kế Toán Dành Cho Người Không Chuyên", "Đầu Tư Giá Trị Thực Chiến", "Giao Dịch Theo Xu Hướng", "Phân Tích Kỹ Thuật A-Z",
            "Nến Nhật Trong Chứng Khoán", "Phương Pháp Wyckoff Thực Chiến", "Bí Mật Đồng Tiền Điện Tử", "Chuyển Đổi Số Doanh Nghiệp",
            "Trải Nghiệm Khách Hàng Xuất Sắc", "Quản Trị Tinh Gọn Lean", "Quy Trình 6 Sigma Thực Chiến", "Quản Trị Nhân Sự Thời Đại Mới",
            "Văn Hóa Doanh Nghiệp Đột Phá", "Tối Ưu Chuỗi Cung Ứng", "Thương Mại Điện Tử Thực Chiến", "Quảng Cáo Số & Tăng Trưởng",
            "Content Bạc Tỷ", "Viết Sao Để Bán Được Hàng", "Bậc Thầy Bán Lẻ", "Kỹ Năng Đàm Phán Harvard",
            "Nghệ Thuật Chốt Sales", "Bán Niềm Tin Mua Sự Hài Lòng", "Tư Duy Khởi Nghiệp 4.0", "Hành Trình Startup Kỳ Lân",
            "Gọi Vốn Thành Công", "Định Giá Doanh Nghiệp", "M&A Sáp Nhập & Mua Lại", "Tái Cấu Trúc Doanh Nghiệp",
            "Quản Trị Rủi Ro Tài Chính", "Tự Do Tài Chính Tuổi 30", "Kế Hoạch Hưu Trí Thông Minh", "Đầu Tư Bất Động Sản Khôn Ngoan",
            "Bí Quyết Thuê Và Cho Thuê BĐS", "Tài Chính Cá Nhân Thực Hành", "Nghệ Thuật Quản Lý Thời Gian", "Lãnh Đạo Bằng Câu Hỏi",
            "Lãnh Đạo Không Chức Danh", "Đội Nhóm Vô Địch", "Động Lực Nội Tại", "Văn Hóa Trách Nhiệm", "Sức Mạnh Của Kỷ Luật Doanh Nghiệp",
            "Phá Vỡ Giới Hạn Bản Thân", "Kinh Doanh Nhỏ Sinh Lời Lớn", "Bán Lẻ Thông Minh O2O", "Quản Lý Dự Án Theo Agile & Scrum",
            "Tư Duy Đột Phá Trong Kinh Doanh", "Kinh Tế Nền Tảng", "Mô Hình Kinh Doanh Bền Vững", "Phát Triển ESG Trong Doanh Nghiệp",
            "Tương Lai Của Tiền Tệ", "Kinh Tế Tuần Hoàn Thực Tiễn", "Đổi Mới Mô Hình Kinh Doanh", "Sách Lược Đàm Phán Kinh Tế",
            "Nghệ Thuật Thuyết Phục Trong Kinh Doanh", "Xây Dựng Thương Hiệu Cá Nhân", "Chiến Lược Giá Thông Minh", "Khách Hàng Trung Thành",
            "Tối Ưu Trải Nghiệm Mua Sắm", "Quản Trị Hiệu Suất KPI & OKR", "Vận Hành Doanh Nghiệp Không Có Mặt Bạn"
        ]
    },
    {
        "name": "Tâm Lý - Kỹ Năng",
        "id": "cat-ky-nang",
        "theme": {"bg1": "#4A148C", "bg2": "#1A237E", "accent": "#EA80FC", "badge": "TÂM LÝ & PHÁT TRIỂN"},
        "authors": ["Dale Carnegie", "Stephen R. Covey", "Thích Nhất Hạnh", "Eckhart Tolle", "Daniel Kahneman", "Ichiro Kishimi", "James Clear", "Mark Manson", "Brian Tracy", "Yuval Noah Harari"],
        "publishers": ["First News - Trí Việt", "NXB Trẻ", "NXB Phụ Nữ", "Nhã Nam", "NXB Lao Động"],
        "titles": [
            "Đắc Nhân Tâm", "Quẳng Gánh Lo Đi Và Vui Sống", "7 Thói Quen Của Người Thành Đạt", "7 Thói Quen Của Bạn Trẻ Thành Đạt",
            "Hiểu Về Trái Tim", "Sức Mạnh Của Hiện Tại", "Tư Duy Nhanh Và Chậm", "Dám Bị Ghét", "Dám Bị Hiểu Lầm",
            "Thao Túng Tâm Lý", "Rèn Luyện Tư Duy Phản Biện", "Đọc Vị Bất Kỳ Ai", "Nghệ Thuật Giao Tiếp Để Thành Công",
            "Tuần Làm Việc 4 Giờ", "Sức Mạnh Của Thói Quen (Atomic Habits)", "Đừng Bao Giờ Đi Ăn Một Mình", "Lối Sống Tối Giản Của Người Nhật",
            "Khi Hơi Thở Hóa Thinh Không", "Khí Chất Tạo Nên Sự Quyến Rũ", "Càng Bình Tĩnh Càng Hạnh Phúc", "Tinh Thần Samurai",
            "Ikigai - Đi Tìm Lý Do Lẽ Sống", "Tâm Lý Học Tội Phạm", "Giải Mã Hành Vi Con Người", "Nghệ Thuật Lắng Nghe",
            "Kỹ Năng Thuyết Trình Trước Đám Đông", "Làm Chủ Cảm Xúc Làm Chủ Cuộc Đời", "Sức Bật Tinh Thần Trong Nghịch Cảnh",
            "Nghệ Thuật Tối Giản Cho Tâm Trí", "Dọn Giường Để Thay Đổi Cuộc Đời", "Sức Mạnh Của Sự Tập Trung", "Thiền Định Cho Người Bận Rộn",
            "An Lạc Từng Bước Chân", "Trái Tim Của Bụt", "Hạnh Phúc Cầm Tay", "Tình Yêu Không Phải Là Đòi Hỏi",
            "Tâm Lý Học Đám Đông", "Nghệ Thuật Quyến Rũ", "48 Nguyên Tắc Quyền Lực", "Chiến Lược Cuộc Sống Của Bậc Thầy",
            "Bí Mật Của Sự May Mắn", "Người Giàu Có Ở Bên Trong", "Sức Mạnh Lời Nói", "Khéo Ăn Nói Sẽ Có Được Thiên Hạ",
            "Hài Hước Một Chút Thế Giới Sẽ Khác Đi", "Đừng Lựa Chọn An Nhàn Khi Còn Trẻ", "Bạn Đắt Giá Bao Nhiêu", "Khí Chất Bao Nhiêu Hạnh Phúc Bấy Nhiêu",
            "Biết Ơn Đời Đời Sẽ Thương Ta", "Chữa Lành Đứa Trẻ Bên Trong", "Vượt Qua Nỗi Sợ Hãi", "Tự Tin Trong Giao Tiếp",
            "Nói Chuyện Với Người Lạ", "Nghệ Thuật Từ Chối", "Sống Cho Đáng Một Đời", "Thức Tỉnh Mục Đích Sống",
            "Tìm Lại Chính Mình", "Nuôi Dưỡng Lòng Trắc Ẩn", "Cởi Trói Linh Hồn", "Không Giới Hạn (Limitless)",
            "Tập Trung Chuyên Sâu (Deep Work)", "Nghệ Thuật Đọc Sách Hiệu Quả", "Ghi Nhớ Siêu Đẳng", "Bản Đồ Tư Duy Cho Người Lớn",
            "Tư Duy Đột Phá", "Sáng Tạo Không Giới Hạn", "Giải Quyết Vấn Đề Thông Minh", "Tư Duy Ngược Để Thành Công",
            "Tâm Lý Học Về Hạnh Phúc", "Chấp Nhận Bản Thân Hoàn Hảo Trong Không Hoàn Hảo", "Thấu Cảm Để Gắn Kết", "Giao Tiếp Không Bạo Lực",
            "Nghệ Thuật Đặt Câu Hỏi Sắc Bén", "Lãnh Đạo Bản Thân Đầu Tiên", "Kỷ Luật Là Tự Do", "Vượt Ngưỡng Chịu Đựng",
            "Bản Lĩnh Đương Đầu Sóng Gió", "Quản Lý Năng Lượng Không Phải Thời Gian", "Đồng Hồ Sinh Học Cơ Thể", "Giấc Ngủ Khỏe Não Tinh Anh",
            "Ăn Uống Chánh Niệm", "Giải Tỏa Căng Thẳng & Stress", "Cân Bằng Giữa Công Việc Và Cuộc Sống", "Sống Chậm Lại Giữa Thế Gian Vội Vã",
            "Yêu Những Điều Không Hoàn Hảo", "Cứ Đi Rồi Sẽ Đến", "Tuổi Trẻ Đáng Giá Bao Nhiêu", "Học Cách Buông Bỏ Để Nhẹ Lòng",
            "Chữa Lành Những Vết Thương Quá Khứ", "Tâm An Thế Giới An", "Sức Mạnh Của Sự Nhẫn Nại", "Bình Yên Trong Bão Giông",
            "Học Cách Thứ Tha", "Sống Cuộc Đời Độc Bản", "Tự Do Trong Suy Nghĩ", "Hành Trình Chinh Phục Ước Mơ",
            "Không Gì Là Không Thể", "Mỗi Ngày Một Bài Học Sống", "Trí Tuệ Cảm Xúc EQ Cao", "Nghệ Thuật Sống Đẹp",
            "Thành Công Từ Sự Tận Tâm", "Sống Với Lòng Biết Ơn Sâu Sắc"
        ]
    },
    {
        "name": "Manga - Comic",
        "id": "cat-manga-comic",
        "theme": {"bg1": "#C2185B", "bg2": "#880E4F", "accent": "#FFEB3B", "badge": "MANGA & COMICS"},
        "authors": ["Eiichiro Oda", "Gosho Aoyama", "Akira Toriyama", "Masashi Kishimoto", "Koyoharu Gotouge", "Gege Akutami", "Hajime Isayama", "Tsugumi Ohba", "Takehiko Inoue", "Tite Kubo"],
        "publishers": ["NXB Kim Đồng", "NXB Trẻ", "IPM", "Amak Books"],
        "titles": [
            "One Piece - Tập 101: Ngôi Sao Xuất Hiện", "One Piece - Tập 102: Giờ Phút Quyết Định", "One Piece - Tập 103: Chiến Binh Giải Phóng",
            "One Piece - Tập 104: Tướng Quân Wano", "One Piece - Tập 105: Giấc Mơ Của Luffy", "One Piece - Tập 106: Hòn Đảo Tương Lai",
            "One Piece - Tập 107: Anh Hùng Huyền Thoại", "One Piece - Tập 108: Thế Giới Mới", "One Piece - Tập 109: Rung Chuyển Egghead", "One Piece - Tập 110: Lời Nhắn Nhủ Toàn Cầu",
            "Thám Tử Lừng Danh Conan - Tập 99", "Thám Tử Lừng Danh Conan - Tập 100: Kỷ Niệm Trăm Tập", "Thám Tử Lừng Danh Conan - Tập 101",
            "Thám Tử Lừng Danh Conan - Tập 102", "Thám Tử Lừng Danh Conan - Tập 103", "Thám Tử Lừng Danh Conan - Tập 104", "Thám Tử Lừng Danh Conan - Tập 105",
            "Doraemon Truyện Dài - Tập 1: Chú Khủng Long Của Nobita", "Doraemon Truyện Dài - Tập 2: Bí Mật Hành Tinh Tím", "Doraemon Truyện Dài - Tập 3: Thám Hiểm Lâu Đài Dưới Đáy Biển",
            "Doraemon Truyện Dài - Tập 4: Lạc Vào Xứ Ba Tư", "Doraemon Truyện Dài - Tập 5: Cuộc Chiến Vũ Trụ", "Doraemon Tuyển Tập Đặc Biệt 45 Tập - Tập 1",
            "Dragon Ball Siêu Cấp - Tập 1: Thần Hủy Diệt Beerus", "Dragon Ball Siêu Cấp - Tập 2: Chiến Binh Hoàng Kim Frieza", "Dragon Ball Siêu Cấp - Tập 3: Vũ Trụ Thứ Sáu",
            "Dragon Ball Siêu Cấp - Tập 4: Trunks Tương Lai", "Dragon Ball Siêu Cấp - Tập 5: Giải Đấu Quyền Lực",
            "Naruto - Tập 70: Khởi Đầu Của Hồi Kết", "Naruto - Tập 71: Đội 7 Đoàn Tụ", "Naruto - Tập 72: Uzumaki Naruto",
            "Kimetsu No Yaiba - Thanh Gươm Diệt Quỷ - Tập 20", "Kimetsu No Yaiba - Tập 21: Quyết Chiến Vô Hạn Thành", "Kimetsu No Yaiba - Tập 22: Bình Minh Ló Rạng",
            "Kimetsu No Yaiba - Tập 23: Trọn Vẹn Hành Trình",
            "Jujutsu Kaisen - Chú Thuật Hồi Chiến - Tập 24: Quyết Chiến Shinjuku", "Jujutsu Kaisen - Tập 25: Nguyền Vương Thức Tỉnh", "Jujutsu Kaisen - Tập 26: Vĩnh Cửu",
            "Chainsaw Man - Tập 12: Thời Khắc Của Quỷ", "Chainsaw Man - Tập 13: Trường Học Ác Mộng", "Chainsaw Man - Tập 14: Cuộc Hẹn Của Quỷ",
            "Spy x Family - Tập 10: Điệp Viên Và Gia Đình", "Spy x Family - Tập 11: Nhiệm Vụ Bí Mật Anya", "Spy x Family - Tập 12: Hòa Bình Thế Giới",
            "Attack On Titan - Đại Chiến Titan - Tập 33", "Attack On Titan - Tập 34: Tự Do Đích Thực",
            "Death Note - Quyển Sổ Tử Thần - Tập 1: Shini Gami", "Death Note - Tập 2: Cuộc Đấu Trí Với L", "Death Note - Tập 12: Hồi Kết",
            "Slam Dunk - Tập 1: Thiên Tài Hanamichi", "Slam Dunk - Tập 10: Tiến Vào Giải Quốc Gia", "Slam Dunk - Tập 20: Trận Đấu Lịch Sử Sannoh",
            "Hunter x Hunter - Tập 36: Cuộc Chiến Trên Tàu Đen", "Hunter x Hunter - Tập 37: Tranh Đoạt Ngai Vàng",
            "Tokyo Ghoul:re - Tập 16: Ánh Sáng Cuối Đường Hầm",
            "Bleach - Sứ Mạng Thần Chết - Tập 73", "Bleach - Tập 74: Ngàn Năm Huyết Chiến",
            "Fairy Tail - Hội Pháp Sư - Tập 62", "Fairy Tail - Tập 63: Trận Chiến Hồi Sinh",
            "My Hero Academia - Học Viện Siêu Anh Hùng - Tập 38", "My Hero Academia - Tập 39: Tia Hy Vọng", "My Hero Academia - Tập 40: Người Thừa Kế Vĩ Đại",
            "Blue Lock - Tập 20: Bản Năng Tiền Đạo", "Blue Lock - Tập 21: Trận Chiến U-20 Nhật Bản", "Blue Lock - Tập 22: Thức Tỉnh Tuyệt Đỉnh",
            "Haikyu!! - Chàng Khổng Lồ Tí Hon - Tập 44", "Haikyu!! - Tập 45: Lời Chào Tạm Biệt",
            "Black Clover - Tập 33: Ma Đạo Sĩ Tối Thượng", "Black Clover - Tập 34: Lời Hứa Với Vua Pháp Sư",
            "Oshi No Ko - Dưới Ánh Đèn Sân Khấu - Tập 12", "Oshi No Ko - Tập 13: Sự Thật Đằng Sau Nụ Cười",
            "Wind Breaker - Băng Nhóm Hàng Xóm - Tập 1", "Wind Breaker - Tập 2: Bảo Vệ Thị Trấn",
            "Kaiju No. 8 - Quái Thú Số 8 - Tập 9", "Kaiju No. 8 - Tập 10: Sức Mạnh Phi Thường",
            "Dandadan - Tập 7: Thế Giới Tâm Linh Và Người Ngoài Hành Tinh", "Dandadan - Tập 8: Trận Chiến Tốc Độ",
            "Frieren - Pháp Sư Tiễn Táng - Tập 9", "Frieren - Tập 10: Ký Ức Về Dũng Giả Himmel",
            "Gintama - Linh Hồn Bạc - Tập 76", "Gintama - Tập 77: Hồi Kết Bất Bại",
            "Rurouni Kenshin - Lãng Khách Kenshin - Tập 27", "Rurouni Kenshin - Tập 28: Bình Minh Thời Đại Minh Trị",
            "Yu-Gi-Oh! - Vua Trò Chơi - Tập 37", "Yu-Gi-Oh! - Tập 38: Trận Đấu Nghi Thức Hoàng Gia",
            "Inuyasha - Khuyển Dạ Xoa - Tập 55", "Inuyasha - Tập 56: Ngọc Tứ Hồn Biến Mất",
            "Ranma 1/2 - Tập 37: Suối Nước Nóng Lời Nguyền", "Ranma 1/2 - Tập 38: Đám Cưới Hỗn Loạn",
            "Cardcaptor Sakura - Thủ Lĩnh Thẻ Bài - Thẻ Bài Trong Suốt Tập 14", "Cardcaptor Sakura - Tập 15: Giấc Mơ Khép Lại",
            "Sailor Moon - Thủy Thủ Mặt Trăng - Tập 11", "Sailor Moon - Tập 12: Ngôi Sao Hy Vọng",
            "Assassination Classroom - Lớp Học Ám Sát - Tập 20", "Assassination Classroom - Tập 21: Tốt Nghiệp",
            "Mob Psycho 100 - Tập 15", "Mob Psycho 100 - Tập 16: Trưởng Thành",
            "Dr. Stone - Thế Giới Tiến Hóa - Tập 25", "Dr. Stone - Tập 26: Chinh Phục Không Gian",
            "Soul Eater - Tập 25: Linh Hồn Thức Tỉnh", "Vagabond - Lãng Khách Miyamoto Musashi - Tập 37",
            "Berserk - Kiếm Sĩ Đen - Tập 41: Thế Giới Cổ Tích Giữa Bão Tố", "Vinland Saga - Bản Trường Ca Bắc Âu - Tập 26"
        ]
    },
    {
        "name": "Sách Thiếu Nhi",
        "id": "cat-thieu-nhi",
        "theme": {"bg1": "#00897B", "bg2": "#004D40", "accent": "#FFD54F", "badge": "THIẾU NHI & KHÁM PHÁ"},
        "authors": ["Tô Hoài", "Đoàn Giỏi", "Luis Sepúlveda", "Antoine de Saint-Exupéry", "Lewis Carroll", "Hans Christian Andersen", "Anh em Grimm", "E.B. White", "Astrid Lindgren", "Carlo Collodi"],
        "publishers": ["NXB Kim Đồng", "NXB Trẻ", "Đinh Tị Books", "NXB Phụ Nữ", "Nhã Nam"],
        "titles": [
            "Dế Mèn Phiêu Lưu Ký", "Đất Rừng Phương Nam", "Chuyện Con Mèo Dạy Hải Âu Bay", "Hoàng Tử Bé",
            "Alice Ở Xứ Sở Thần Tiên", "Alice Ở Xứ Sở Trong Gương", "Chuyện Con Chó Tên Là Trung Thành", "Chuyện Con Ốc Sên Chậm Chạp",
            "Thần Đồng Đất Việt - Tập 1: Pháp Sư Gọi Gió", "Thần Đồng Đất Việt - Tập 2: Trạng Tí Xuất Quân", "Thần Đồng Đất Việt - Tập 3: Mưu Trí Đấu Trí",
            "Bách Khoa Toàn Thư Thiếu Nhi - Khám Phá Vũ Trụ", "Bách Khoa Toàn Thư Thiếu Nhi - Thế Giới Động Vật", "Bách Khoa Toàn Thư Thiếu Nhi - Cơ Thể Người Kỳ Diệu",
            "Bách Khoa Toàn Thư Thiếu Nhi - Đại Dương Huyền Bí", "Bách Khoa Toàn Thư Thiếu Nhi - Trái Đất Của Chúng Ta", "Bách Khoa Toàn Thư Thiếu Nhi - Lịch Sử Thế Giới Bằng Tranh",
            "Cô Bé Bán Diêm & Những Truyện Cổ Tích Andersen Hay Nhất", "Truyện Cổ Grimm Tuyển Chọn Đặc Sắc", "Kho Tàng Truyện Cổ Tích Việt Nam",
            "Ngụ Ngôn La Fontaine - Bản Tranh Màu", "Cuộc Phiêu Lưu Của Pinocchio - Cậu Bé Người Gỗ", "Những Tấm Lòng Cao Cả (Cuore)", "Totto-chan Bên Cửa Sổ",
            "Pippi Tất Dài Can Đảm", "Charlie Và Nhà Máy Sô Cô La", "Matilda - Cô Bé Kỳ Lạ", "Bác Khổng Lồ Tốt Bụng (BFG)",
            "Khu Vườn Bí Mật", "Công Chúa Nhỏ (Sara Crewe)", "Cậu Bé Rừng Xanh (The Jungle Book)", "Gulliver Du Ký",
            "Chuyến Du Hành Vào Lòng Đất", "Hai Vạn Dặm Dưới Đáy Biển", "Hòn Đảo Giấu Vàng (Treasure Island)", "Robinson Crusoe Trên Đảo Hoang",
            "Peter Pan - Cậu Bé Không Bao Giờ Lớn", "Gió Qua Rặng Liễu", "Bambi - Chú Nai Nhỏ Trong Rừng", "Charlotte Và Chú Heo Wilbur",
            "Cuộc Phiêu Lưu Của Chú Gấu Paddington", "Winnie-the-Pooh - Chú Gấu Pooh Dễ Thương", "10 Vạn Câu Hỏi Vì Sao - Sinh Học & Muôn Loài",
            "10 Vạn Câu Hỏi Vì Sao - Khoa Học & Công Nghệ", "10 Vạn Câu Hỏi Vì Sao - Đời Sống Hàng Ngày", "10 Vạn Câu Hỏi Vì Sao - Khí Tượng & Trái Đất",
            "Kể Chuyện Danh Nhân Thế Giới Cho Thiếu Nhi", "Lịch Sử Nước Việt Bằng Tranh - Thời Hùng Vương", "Lịch Sử Nước Việt Bằng Tranh - Hai Bà Trưng Khởi Nghĩa",
            "Lịch Sử Nước Việt Bằng Tranh - Chiến Thắng Bạch Đằng", "Lịch Sử Nước Việt Bằng Tranh - Triều Đại Nhà Trần", "Lịch Sử Nước Việt Bằng Tranh - Khởi Nghĩa Lam Sơn",
            "Truyện Tranh Khoa Học - Khám Phá Rừng Rậm Amazon", "Truyện Tranh Khoa Học - Bí Ẩn Kim Tự Tháp Ai Cập", "Truyện Tranh Khoa Học - Thời Tiền Sử & Khủng Long",
            "Thế Giới Khủng Long Đồ Sộ Bằng Tranh", "Cẩm Nang Kỹ Năng Sống Cho Trẻ - Tự Bảo Vệ Bản Thân", "Cẩm Nang Kỹ Năng Sống Cho Trẻ - Tự Lập Từ Nhỏ",
            "Cẩm Nang Kỹ Năng Sống Cho Trẻ - Kết Bạn & Chia Sẻ", "Phát Triển Trí Tuệ Cảm Xúc Cho Bé - Vui Vẻ Mỗi Ngày", "Phát Triển Trí Tuệ Cảm Xúc Cho Bé - Vượt Qua Nỗi Buồn",
            "Bé Học Lễ Phép Với Ông Bà Cha Mẹ", "Thỏ Con Học Nói Lời Cảm Ơn Và Xin Lỗi", "Những Câu Chuyện Rèn Luyện Nhân Cách Cho Trẻ",
            "Truyện Ngụ Ngôn Aesop Minh Họa Màu Sống Động", "Cuộc Đua Giữa Rùa Và Thỏ - Bài Học Kiên Trì", "Cáo Và Chùm Nho - Bài Học Khiêm Tốn",
            "Bác Gấu Trồng Củ Cải Khổng Lồ", "Ba Chú Heo Con Xây Nhà", "Cô Bé Quàng Khăn Đỏ Và Bài Học An Toàn",
            "Nàng Bạch Tuyết Và Bảy Chú Lùn", "Người Đẹp Ngủ Trong Rừng", "Nàng Tiên Cá Nhỏ Nhẹ", "Hoàng Tử Ếch Vàng",
            "Cô Bé Lọ Lem Cinderella", "Aladdin Và Cây Đèn Thần", "Ali Baba Và Bốn Mươi Tên Cướp", "Thủy Thủ Sinbad Vượt Đại Dương",
            "Cậu Bé Bút Chì Shin-chan Tuyển Tập Truyện Tranh", "Doraemon Đố Vui Khoa Học - Tập 1", "Doraemon Đố Vui Lịch Sử - Tập 2",
            "Doraemon Khám Phá Thế Giới Tự Nhiên", "Nuôi Dưỡng Lòng Trắc Ẩn Qua Chuyện Loài Vật", "Cún Con Dũng Cảm", "Mèo Mướp Thông Minh",
            "Ngôi Nhà Nhỏ Trên Thảo Nguyên", "Bọn Trẻ Làng Ồn Ào", "Emil Lém Lỉnh Xứ Lönneberga", "Chiếc Hộp Bí Mật Của Tuổi Thơ",
            "Những Câu Chuyện Kể Trước Giờ Đi Ngủ", "Cổ Tích Cho Giấc Mơ Êm Đềm", "Mặt Trời Thức Dậy Cùng Bé", "Bé Làm Họa Sĩ Tí Hon",
            "Tập Tô Màu Thế Giới Quanh Em", "Trò Chơi Trí Não Rèn Luyện Tư Duy Cho Trẻ", "Mê Cung Kỳ Thú Khám Phá Bản Thân",
            "Ghép Hình Khám Phá 5 Châu Lục", "Bản Đồ Thế Giới Dành Cho Trẻ Em"
        ]
    },
    {
        "name": "Sách Ngoại Văn",
        "id": "cat-ngoai-van",
        "theme": {"bg1": "#1A237E", "bg2": "#0D1B2A", "accent": "#FFC107", "badge": "INTERNATIONAL BESTSELLER"},
        "authors": ["J.K. Rowling", "George Orwell", "F. Scott Fitzgerald", "Harper Lee", "Yuval Noah Harari", "James Clear", "Morgan Housel", "J.R.R. Tolkien", "Frank Herbert", "Stephen Hawking"],
        "publishers": ["Bloomsbury", "Penguin Random House", "HarperCollins", "Oxford University Press", "Simon & Schuster"],
        "titles": [
            "Harry Potter and the Sorcerer's Stone", "Harry Potter and the Chamber of Secrets", "Harry Potter and the Prisoner of Azkaban",
            "Harry Potter and the Goblet of Fire", "Harry Potter and the Order of the Phoenix", "Harry Potter and the Half-Blood Prince",
            "Harry Potter and the Deathly Hallows", "The Great Gatsby - Classic English Edition", "1984 by George Orwell - Original Text",
            "Animal Farm - A Fairy Story", "To Kill a Mockingbird - 60th Anniversary Edition", "Sapiens: A Brief History of Humankind",
            "Homo Deus: A Brief History of Tomorrow", "21 Lessons for the 21st Century", "Atomic Habits: An Easy & Proven Way to Build Good Habits",
            "The Psychology of Money: Timeless Lessons on Wealth", "Rich Dad Poor Dad: What the Rich Teach Their Kids About Money",
            "Think and Grow Rich - The Landmark Bestseller", "The 7 Habits of Highly Effective People", "The Alchemist - 25th Anniversary Edition",
            "The Catcher in the Rye - J.D. Salinger", "Pride and Prejudice - Jane Austen", "The Lord of the Rings: The Fellowship of the Ring",
            "The Lord of the Rings: The Two Towers", "The Lord of the Rings: The Return of the King", "The Hobbit: There and Back Again",
            "Norwegian Wood - Haruki Murakami", "Kafka on the Shore - Haruki Murakami", "Crime and Punishment - Fyodor Dostoevsky",
            "War and Peace - Leo Tolstoy", "The Little Prince - Antoine de Saint-Exupéry", "Dune - Frank Herbert Deluxe Edition",
            "Dune Messiah - Frank Herbert", "Children of Dune - Frank Herbert", "Foundation - Isaac Asimov Sci-Fi Masterpiece",
            "Foundation and Empire - Isaac Asimov", "Second Foundation - Isaac Asimov", "A Brief History of Time - Stephen Hawking",
            "The Selfish Gene - Richard Dawkins", "Thinking, Fast and Slow - Daniel Kahneman", "Brave New World - Aldous Huxley",
            "Fahrenheit 451 - Ray Bradbury", "The Picture of Dorian Gray - Oscar Wilde", "Frankenstein - Mary Shelley",
            "Dracula - Bram Stoker Definitive Edition", "The Count of Monte Cristo - Alexandre Dumas", "Les Misérables - Victor Hugo",
            "Don Quixote - Miguel de Cervantes", "One Hundred Years of Solitude - Gabriel García Márquez", "Love in the Time of Cholera",
            "The Old Man and the Sea - Ernest Hemingway", "For Whom the Bell Tolls - Ernest Hemingway", "The Sun Also Rises - Ernest Hemingway",
            "A Farewell to Arms - Ernest Hemingway", "The Grapes of Wrath - John Steinbeck", "Of Mice and Men - John Steinbeck",
            "East of Eden - John Steinbeck", "Slaughterhouse-Five - Kurt Vonnegut", "Catch-22 - Joseph Heller",
            "Lord of the Flies - William Golding", "Jane Eyre - Charlotte Brontë", "Wuthering Heights - Emily Brontë",
            "Sense and Sensibility - Jane Austen", "Emma - Jane Austen Illustrated", "Great Expectations - Charles Dickens",
            "A Tale of Two Cities - Charles Dickens", "Oliver Twist - Charles Dickens", "David Copperfield - Charles Dickens",
            "The Adventures of Huckleberry Finn - Mark Twain", "The Adventures of Tom Sawyer - Mark Twain", "Moby-Dick - Herman Melville",
            "Walden - Henry David Thoreau", "Leaves of Grass - Walt Whitman", "The Metamorphosis - Franz Kafka",
            "The Stranger - Albert Camus", "The Myth of Sisyphus - Albert Camus", "Thus Spoke Zarathustra - Friedrich Nietzsche",
            "Beyond Good and Evil - Friedrich Nietzsche", "Meditations - Marcus Aurelius", "The Republic - Plato",
            "Nicomachean Ethics - Aristotle", "The Prince - Niccolò Machiavelli", "The Art of War - Sun Tzu English Edition",
            "Man's Search for Meaning - Viktor E. Frankl", "Outliers: The Story of Success - Malcolm Gladwell", "Blink: The Power of Thinking Without Thinking",
            "The Tipping Point - Malcolm Gladwell", "Quiet: The Power of Introverts - Susan Cain", "Grit: The Power of Passion and Perseverance",
            "Mindset: The New Psychology of Success - Carol S. Dweck", "Start with Why - Simon Sinek", "Leaders Eat Last - Simon Sinek",
            "Zero to One - Peter Thiel", "Good to Great - Jim Collins", "Built to Last - Jim Collins",
            "Shoe Dog: A Memoir by the Creator of Nike - Phil Knight", "Steve Jobs - Walter Isaacson", "Elon Musk - Walter Isaacson",
            "The Innovators - Walter Isaacson", "Klara and the Sun - Kazuo Ishiguro", "Never Let Me Go - Kazuo Ishiguro"
        ]
    },
    {
        "name": "Văn Phòng Phẩm",
        "id": "cat-van-phong-pham",
        "theme": {"bg1": "#2E7D32", "bg2": "#1B5E20", "accent": "#A7FFEB", "badge": "VĂN PHÒNG PHẨM CAO CẤP"},
        "authors": ["Thiên Long", "Deli", "Campus", "Casio", "Pentel", "Pilot", "Stabilo", "Staedtler", "Mont Marte", "Plus"],
        "publishers": ["Tập Đoàn Thiên Long", "Deli Global", "Kokuyo Nhật Bản", "Casio Computer Co.", "Pentel Japan"],
        "titles": [
            "Bút Bi Thiên Long TL-027 Mực Xanh 0.7mm (Hộp 20 Cây)", "Bút Bi Thiên Long TL-079 Mực Đen Đầu Kim 0.5mm",
            "Bút Gel Bấm Xóa Được Pilot Frixion Ball 0.5mm Nhật Bản", "Bút Dạ Quang Pastel Stabilo Boss Original (Set 6 Màu)",
            "Bút Máy Cao Cấp Lamy Safari Ngòi F Chính Hãng Đức", "Bút Máy Học Sinh Thiên Long Điểm 10 Luyện Chữ Đẹp",
            "Sổ Tay Bìa Da PU Cao Cấp A5 Kẻ Ngang 200 Trang", "Sổ Lò Xo Kép Campus B5 200 Trang Chống Lóa",
            "Tập Vở Học Sinh 96 Trang Campus kẻ ô ly 4 ly vuông (Lốc 10 Cuốn)", "Tập Vở Học Sinh 200 Trang Campus Kẻ Ngang Có Chấm",
            "Bút Chì Gỗ 2B Staedtler Noris 120 Cao Cấp (Hộp 12 Cây)", "Bút Chì Bấm Kỹ Thuật Pentel GraphGear 500 0.5mm",
            "Ruột Chì Kim Pentel Ain Stein 0.5mm 2B (Tuýp 40 Ngòi)", "Bộ Thước Kẻ Eke Compa Học Sinh Deli Nhôm Cao Cấp",
            "Gọt Bút Chì Tự Động Quay Tay Deli Hình Phi Thuyền", "Gôm Tẩy Chì Pentel Ain Hi-Polymer Không Bụi Đen",
            "Băng Keo Dán Hai Mặt Siêu Dính 3M Scotch Bền Chắc", "Băng Keo Trong Dán Thùng 48mm x 100 Ya (Lốc 6 Cuộn)",
            "Giấy In Double A A4 70gsm Thùng 5 Ram (2500 Tờ) Siêu Mịn", "Giấy In PaperOne A4 80gsm Thùng 5 Ram Chống Kẹt Giấy",
            "Bộ Màu Vẽ Acrylic Mont Marte 24 Màu x 36ml Chuyên Nghiệp", "Bộ Màu Nước Maries 18 Tuýp Kèm Bút Lông Vẽ Chuyên Nghiệp",
            "Hộp Bút Chì Màu Khô Marco Raffine 36 Màu Kèm Hộp Thiếc", "Bút Lông Dầu 2 Đầu Không Xóa Được Pentel Permanent Marker",
            "Bút Viết Bảng Trắng Xóa Được Thiên Long WB-03 (Hộp 10 Cây)", "Bìa Còng Lưu Trữ Hồ Sơ 7cm Kingjim A4 Khóa Bật Chắc Chắn",
            "Bìa Lá Hồ Sơ 20 Lá Plus A4 Tiện Lợi Văn Phòng", "Kẹp Bướm Tài Liệu Kim Loại Echo 25mm (Hộp 12 Cái)",
            "Máy Tính Khoa Học Casio FX-580VN X Thế Hệ Mới Chính Hãng", "Máy Tính Cầm Tay Kế Toán Casio MX-120B Màn Hình Lớn",
            "Xấp Giấy Note Ghi Chú Dạ Quang Post-it 3M 5 Màu Tiện Lợi", "Bấm Kim Số 10 Plus Chống Kẹt Kim Kèm Hộp Kim Bấm",
            "Hộp Kim Bấm Số 10 Max Nhật Bản Bền Chắc (Hộp 1000 Kim)", "Kéo Văn Phòng Deli Mũi Cong Lưỡi Thép Chống Dính Băng Keo",
            "Dao Rọc Giấy Lưỡi Thép SK5 Deli Khóa Xoay An Toàn", "Hộp Lưỡi Dao Rọc Giấy Thay Thế Deli 18mm (10 Lưỡi)",
            "Khay Đựng Tài Liệu Văn Phòng 3 Tầng Trượt Kim Loại Deli", "Bảng Từ Trắng Treo Tường Kẻ Ô 60x90cm Viền Nhôm Bền Bỉ",
            "Đèn Bàn Học LED Chống Cận Thị Rạng Đông 6W Ánh Sáng Tự Nhiên", "Hộp Bút Vải Canvas Nhiều Ngăn Sức Chứa Lớn Cho Học Sinh",
            "Bút Lông Kim Thiên Long FL-04 Mực Tím Học Trò (Hộp 10 Cây)", "Bút Ký Tên Kim Loại Mạ Vàng Parker Cao Cấp Hộp Quà Tặng",
            "Bút Sơn Công Nghiệp Uni Paint Marker PX-20 Viết Lên Mọi Bề Mặt", "Bút Chì Vẽ Phác Thảo Nghệ Thuật KOH-I-NOOR Đủ Độ Cứng (12 Cây)",
            "Bộ Thước Dẻo Học Sinh 20cm Uốn Cong Không Gãy Deli", "Băng Xóa Kéo Plus Whiper MR 5mm x 6m Kèm Ruột Thay Thế",
            "Ruột Băng Xóa Kéo Plus Whiper MR (Set 3 Ruột Tiết Kiệm)", "Keo Dán Dạng Hồ Nước Thiên Long Không Độc Hại",
            "Keo Khô Dạng Thỏi Dán Giấy Deli 21g Tiện Dụng Sạch Sẽ", "Sổ Ký Tên Bìa Cứng A4 Kẻ Ngang Mạ Chữ Vàng Sang Trọng",
            "Sổ Lập Kế Hoạch Tuần & Tháng Planner B5 Bìa Cứng Đa Năng", "Sổ Từ Vựng Tiếng Anh Lò Xo Kèm Tấm Che Ghi Nhớ Nhanh",
            "Tệp Giấy Kiểm Tra Cấp 1 Ô Ly Campus (Tập 20 Tờ Đôi)", "Tệp Giấy Kiểm Tra Cấp 2 Cấp 3 Kẻ Ngang Campus (25 Tờ Đôi)",
            "Hộp Cắm Bút Văn Phòng Xoay 360 Độ Đa Năng Deli", "Kệ Đựng Sách Để Bàn Bằng Gỗ Lắp Ráp Thông Minh",
            "Bộ Bấm Lỗ Giấy Văn Phòng 2 Lỗ Deli Bấm 30 Tờ Nhẹ Tay", "Kim Kẹp Giấy Kim Loại Đầu Tròn Màu Bạc Deli (Hộp 100 Cái)",
            "Bảng Tên Đeo Ngực Dây Rút Co Giãn Tiện Lợi Văn Phòng", "Dây Đeo Thẻ Học Sinh & Nhân Viên Lụa Cao Cấp Kèm Bao Thẻ",
            "Bao Thẻ Tên Nhân Viên Nhựa Trong Dẻo Chống Thấm Nước", "Mực Dấu Đỏ Shiny SM-2 28ml Dùng Cho Con Dấu Tự Động",
            "Con Dấu Đã Thu Tiền / Đã Chi Tiền Tự Động Shiny", "Hộp Dấu Lăn Tay Mực Đỏ Dành Cho Công Chứng & Ký Hợp Đồng",
            "Bút Vẽ Kỹ Thuật Artline Drawing Pen Chống Nước (Set 6 Cây)", "Tập Giấy Vẽ Màu Nước Happy Canson 300gsm Khổ A4 (15 Tờ)",
            "Bảng Pha Màu Palette Bằng Nhựa Dẻo Dễ Rửa Sạch", "Bộ Cọ Vẽ Nghệ Thuật Đầu Tròn & Dẹt 10 Cây Lông Mềm",
            "Bút Dạ Màu Rửa Được Crayola 12 Màu An Toàn Cho Trẻ", "Đất Nặn Không Độc Hại Cho Bé Nhiều Màu Kèm Khuôn",
            "Thùng Đựng Hồ Sơ Tài Liệu A4 Bằng Nhựa Trong Có Quai Xách", "Kẹp Rút Gáy Bìa Báo Cáo A4 Trong Suốt (Set 10 Cây)",
            "Bìa Cây Trong Suốt Giữ Tài Liệu Đẹp Mắt Khổ A4", "Giấy Than Xanh Kokusho Nhật Bản Viết Không Lem",
            "Phấn Viết Bảng Không Bụi Màu Trắng Bến Ngoan (Hộp 100 Viên)", "Khăn Lau Bảng Từ Hút Nam Châm Tiện Lợi",
            "Nam Châm Gắn Bảng Từ Đa Sắc Nhiều Kích Thước (Vỉ 10 Viên)", "Băng Keo Simili Dán Gáy Sách Màu Xanh Dương 4.8cm",
            "Màng Bọc Sách Vở Decal Tự Dán Tiện Lợi (Set 10 Tờ)", "Nhãn Vở Học Sinh Thiết Kế Dễ Thương Dán Chắc Chắn (Tập 20 Cái)",
            "Bìa Bao Tập Vở Học Sinh Nilon Dẻo Trong Suốt (Lốc 10 Tờ)", "Bìa Bao Sách Giáo Khoa Nilon Dẻo Khổ Lớn (Lốc 10 Tờ)",
            "Dụng Cụ Gỡ Kim Bấm Deli An Toàn Không Rách Giấy", "Dao Cắt Băng Keo Cầm Tay Tiện Lợi Khổ 5cm",
            "Cắt Băng Keo Để Bàn Nặng Chắc Chắn Deli", "Bút Đánh Dấu Đầu Nhọn Viết Đĩa CD/DVD Marker Không Trôi",
            "Khay Mực Dấu Shiny Hộp Kim Loại Sang Trọng", "Bút Chì Định Vị Tay Cầm Cho Học Sinh Tiểu Học",
            "Bút Tập Viết Chữ Đẹp Thần Kỳ Tự Xóa Sau 15 Phút", "Vở Luyện Viết Chữ Đẹp Theo Chuẩn Bộ Giáo Dục (4 Cuốn)",
            "Compa Chì Kim Học Sinh Kèm Ống Ngòi Thay Thế Deli", "Bộ Dụng Cụ Học Tập Đầy Đủ 8 Món Trong Hộp Kim Loại",
            "Tẩy Điện Tự Động Chuyên Dụng Dân Mỹ Thuật Tiện Lợi", "Bút Đèn Laser Trình Chiếu Powerpoint Không Dây",
            "Pin Tiểu AAA Alkaline Panasonic Bền Bỉ Cho Thiết Bị (Vỉ 4 Viên)", "Pin Tiểu AA Alkaline Energizer Dùng Cho Chuột & Máy Tính",
            "Khay Đựng Bút Lưới Sắt Đen Để Bàn Tối Giản", "Bút Nhớ Dòng Hai Đầu Pastel Deli Siêu Xinh",
            "Sổ Còng Binder A5 Thay Giấy Tiện Dụng Nhiều Màu", "Túi Đựng Tài Liệu A4 Dây Kéo Chống Nước Hoạt Hình Dễ Thương"
        ]
    }
]

def make_svg_cover(title, author, publisher, cat_name, theme):
    bg1 = theme["bg1"]
    bg2 = theme["bg2"]
    badge = theme["badge"]
    
    # Escape xml
    def x(s):
        return (str(s).replace("&", "&amp;")
                      .replace("<", "&lt;")
                      .replace(">", "&gt;")
                      .replace('"', "&quot;")
                      .replace("'", "&apos;"))
    
    escaped_title = x(title)
    escaped_author = x(author)
    escaped_pub = x(publisher)
    escaped_badge = x(badge)
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="100%" height="100%">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg1}"/>
      <stop offset="100%" stop-color="{bg2}"/>
    </linearGradient>
    <pattern id="pat" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.08)"/>
    </pattern>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.4)"/>
    </filter>
  </defs>
  <rect width="400" height="580" fill="url(#g)" rx="10"/>
  <rect width="400" height="580" fill="url(#pat)" rx="10"/>
  
  <!-- Spine 3D simulation -->
  <rect x="0" y="0" width="20" height="580" fill="rgba(0,0,0,0.3)"/>
  <line x1="24" y1="0" x2="24" y2="580" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  
  <!-- Frame border -->
  <rect x="35" y="25" width="340" height="530" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2" rx="6"/>
  <rect x="42" y="32" width="326" height="516" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" rx="4"/>
  
  <!-- Category Badge -->
  <rect x="75" y="45" width="260" height="28" rx="14" fill="rgba(255,255,255,0.18)"/>
  <text x="205" y="64" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" letter-spacing="2">{escaped_badge}</text>
  
  <!-- Title wrapped in foreignObject -->
  <foreignObject x="50" y="105" width="310" height="230">
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;align-items:center;justify-content:center;height:100%;text-align:center;padding:0 8px;">
      <h1 style="color:#FFFFFF;font-family:'Plus Jakarta Sans', Georgia, serif;font-size:23px;font-weight:800;line-height:1.3;text-shadow:0 3px 6px rgba(0,0,0,0.6);margin:0;">
        {escaped_title}
      </h1>
    </div>
  </foreignObject>
  
  <!-- Divider -->
  <line x1="90" y1="345" x2="320" y2="345" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
  <circle cx="205" cy="345" r="4" fill="#FFFFFF"/>
  
  <!-- Author / Brand -->
  <text x="205" y="390" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600" opacity="0.95">{escaped_author}</text>
  
  <!-- Quality Tag -->
  <rect x="145" y="445" width="120" height="26" rx="13" fill="rgba(255,255,255,0.25)"/>
  <text x="205" y="462" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="700" letter-spacing="1">CHÍNH HÃNG 100%</text>
  
  <!-- Publisher / Store bottom -->
  <text x="205" y="525" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" opacity="0.8">{escaped_pub}</text>
</svg>"""
    return "data:image/svg+xml;utf8," + urllib.parse.quote(svg)

def generate_catalog():
    all_books = []
    metadata = {}
    demo_books = []
    
    counter = 1
    for cat in CATEGORIES:
        titles = cat["titles"]
        # Ensure exactly 100 items per category
        while len(titles) < 100:
            titles.append(f"{cat['name']} Tuyển Tập Đặc Biệt - Tập {len(titles)+1}")
        titles = titles[:100]
        
        for idx, title in enumerate(titles):
            book_id = f"book-{counter:03d}"
            author = cat["authors"][idx % len(cat["authors"])]
            publisher = cat["publishers"][idx % len(cat["publishers"])]
            isbn = f"978-604-{random.randint(100,999)}-{random.randint(100,999)}-{random.randint(0,9)}"
            
            # Pricing logic (realistic VND)
            if cat["id"] == "cat-manga-comic":
                orig_price = random.choice([25000, 30000, 35000, 45000, 50000])
            elif cat["id"] == "cat-van-phong-pham":
                orig_price = random.choice([15000, 25000, 45000, 65000, 85000, 120000, 180000, 250000, 450000])
            elif cat["id"] == "cat-ngoai-van":
                orig_price = random.choice([150000, 180000, 220000, 260000, 320000, 380000, 450000])
            else:
                orig_price = random.choice([65000, 79000, 88000, 95000, 110000, 125000, 140000, 165000, 195000])
            
            discount = random.choice([0, 10, 15, 20, 25, 30, 35])
            price = int(round(orig_price * (100 - discount) / 100, -3))
            stock = random.randint(15, 250)
            sold_count = random.randint(50, 8500)
            
            cover_path = make_svg_cover(title, author, publisher, cat["name"], cat["theme"])
            
            desc = (f"Tác phẩm '{title}' thuộc danh mục {cat['name']}, do tác giả/thương hiệu {author} sáng tác/sản xuất, "
                    f"được ấn hành chính hãng bởi {publisher}. Sản phẩm đạt tiêu chuẩn chất lượng cao, "
                    f"được độc giả và người tiêu dùng đánh giá rất cao về nội dung lẫn hình thức trình bày.")
            
            catalog_info = {
                "author": author,
                "publisher": publisher,
                "isbn": isbn,
                "categoryName": cat["name"],
                "categoryId": cat["id"],
                "description": desc,
                "originalPrice": orig_price
            }
            
            all_books.append({
                "id": book_id,
                "title": title,
                "price": price,
                "stock": stock,
                "sold_count": sold_count,
                "cover_path": cover_path,
                "catalog": json.dumps(catalog_info, ensure_ascii=False),
                "created_at": "2026-11-11 12:00:00"
            })
            
            metadata[book_id] = catalog_info
            demo_books.append({
                "id": book_id,
                "title": title,
                "price": price,
                "stock": stock,
                "soldCount": sold_count,
                "coverImage": cover_path
            })
            
            counter += 1
            
    return all_books, metadata, demo_books

if __name__ == "__main__":
    db_file = r"C:\Users\PHUC THINH\OneDrive\Tài liệu\ChatGPT\wed\sachhay\php-mvc\storage\sachhay.sqlite"
    meta_file = r"C:\Users\PHUC THINH\OneDrive\Tài liệu\ChatGPT\wed\sachhay\php-mvc\book-metadata.json"
    demo_file = r"C:\Users\PHUC THINH\OneDrive\Tài liệu\ChatGPT\wed\sachhay\php-mvc\demo-books.json"
    
    print("Generating 700 products (100 per category across 7 categories)...")
    books, metadata, demo_books = generate_catalog()
    
    # Save JSON files
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    with open(demo_file, "w", encoding="utf-8") as f:
        json.dump(demo_books, f, ensure_ascii=False, indent=2)
    print("Saved book-metadata.json and demo-books.json.")
    
    # Update SQLite database
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()
    
    # Delete all old products
    cur.execute("DELETE FROM books")
    print("Deleted all old books from database.")
    
    # Insert 700 new products
    cur.executemany("""
        INSERT INTO books (id, title, price, stock, sold_count, active, cover_path, catalog, created_at)
        VALUES (:id, :title, :price, :stock, :sold_count, 1, :cover_path, :catalog, :created_at)
    """, books)
    
    conn.commit()
    
    # Verify count per category
    cur.execute("SELECT json_extract(catalog, '$.categoryName') as cat, COUNT(*) FROM books GROUP BY cat")
    rows = cur.fetchall()
    print("\n--- Summary per category in Database ---")
    for row in rows:
        print(f"  {row[0]}: {row[1]} sản phẩm")
    
    cur.execute("SELECT COUNT(*) FROM books")
    total = cur.fetchone()[0]
    print(f"\nTổng cộng sản phẩm trong database: {total}")
    conn.close()
