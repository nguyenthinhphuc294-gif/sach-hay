export const SACHHAY_SQL_SCRIPT = `-- ==============================================================================
-- SACHHAY_DB: CƠ SỞ DỮ LIỆU THƯƠNG MẠI ĐIỆN TỬ BÁN SÁCH SACHHAY (MICROSOFT SQL SERVER)
-- Tương thích: Microsoft SQL Server 2019 / 2022 / Azure SQL Database
-- Thiết kế theo mô hình E-Commerce chuẩn Fahasa: Sản phẩm, Tồn kho, Đơn hàng, Marketing
-- ==============================================================================

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SACHHAY_DB')
BEGIN
    CREATE DATABASE SACHHAY_DB COLLATE Vietnamese_CI_AS;
END
GO

USE SACHHAY_DB;
GO

-- ==============================================================================
-- 1. NHÓM BẢNG TÀI KHOẢN & PHÂN QUYỀN (ACCOUNT & RBAC)
-- ==============================================================================

IF OBJECT_ID('dbo.UserRoles', 'U') IS NOT NULL DROP TABLE dbo.UserRoles;
IF OBJECT_ID('dbo.Addresses', 'U') IS NOT NULL DROP TABLE dbo.Addresses;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;

CREATE TABLE dbo.Roles (
    RoleID INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME()
);

CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL, -- PBKDF2 / SHA256 hashed
    PhoneNumber VARCHAR(20) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    EmailConfirmed BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    LastLoginAt DATETIME2 NULL
);

CREATE TABLE dbo.UserRoles (
    UserID INT NOT NULL,
    RoleID INT NOT NULL,
    AssignedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT PK_UserRoles PRIMARY KEY (UserID, RoleID),
    CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleID) REFERENCES dbo.Roles(RoleID) ON DELETE CASCADE
);

CREATE TABLE dbo.Addresses (
    AddressID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    RecipientName NVARCHAR(150) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    Province NVARCHAR(100) NOT NULL,
    District NVARCHAR(100) NOT NULL,
    Ward NVARCHAR(100) NOT NULL,
    StreetAddress NVARCHAR(255) NOT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Addresses_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);

-- ==============================================================================
-- 2. NHÓM BẢNG SẢN PHẨM & DANH MỤC (CATALOG, AUTHORS, PUBLISHERS, BOOKS)
-- ==============================================================================

IF OBJECT_ID('dbo.BookCategories', 'U') IS NOT NULL DROP TABLE dbo.BookCategories;
IF OBJECT_ID('dbo.BookAuthors', 'U') IS NOT NULL DROP TABLE dbo.BookAuthors;
IF OBJECT_ID('dbo.BookImages', 'U') IS NOT NULL DROP TABLE dbo.BookImages;
IF OBJECT_ID('dbo.Books', 'U') IS NOT NULL DROP TABLE dbo.Books;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Authors', 'U') IS NOT NULL DROP TABLE dbo.Authors;
IF OBJECT_ID('dbo.Publishers', 'U') IS NOT NULL DROP TABLE dbo.Publishers;

CREATE TABLE dbo.Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    ParentID INT NULL,
    CategoryName NVARCHAR(150) NOT NULL,
    Slug VARCHAR(150) NOT NULL UNIQUE,
    IconName VARCHAR(50) NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Categories_Parent FOREIGN KEY (ParentID) REFERENCES dbo.Categories(CategoryID)
);

CREATE TABLE dbo.Authors (
    AuthorID INT IDENTITY(1,1) PRIMARY KEY,
    AuthorName NVARCHAR(150) NOT NULL,
    Nationality NVARCHAR(100) NULL,
    Biography NVARCHAR(MAX) NULL
);

CREATE TABLE dbo.Publishers (
    PublisherID INT IDENTITY(1,1) PRIMARY KEY,
    PublisherName NVARCHAR(150) NOT NULL,
    Address NVARCHAR(255) NULL,
    PhoneNumber VARCHAR(30) NULL
);

CREATE TABLE dbo.Books (
    BookID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(300) NOT NULL,
    OriginalTitle NVARCHAR(300) NULL,
    Slug VARCHAR(300) NOT NULL UNIQUE,
    ISBN VARCHAR(30) NULL,
    PublisherID INT NOT NULL,
    SupplierName NVARCHAR(150) NULL,
    PublicationYear INT NULL CHECK (PublicationYear >= 1900 AND PublicationYear <= 2100),
    Pages INT NULL CHECK (Pages > 0),
    Format NVARCHAR(50) DEFAULT N'Bìa mềm',
    Dimensions NVARCHAR(50) NULL,
    WeightGrams INT NULL CHECK (WeightGrams >= 0),
    Language NVARCHAR(50) DEFAULT N'Tiếng Việt',
    OriginalPrice DECIMAL(18,2) NOT NULL CHECK (OriginalPrice >= 0),
    SellingPrice DECIMAL(18,2) NOT NULL CHECK (SellingPrice >= 0 AND SellingPrice <= OriginalPrice),
    StockQuantity INT NOT NULL DEFAULT 0 CHECK (StockQuantity >= 0),
    SoldCount INT NOT NULL DEFAULT 0 CHECK (SoldCount >= 0),
    RatingAverage DECIMAL(3,2) NOT NULL DEFAULT 5.00 CHECK (RatingAverage >= 1.0 AND RatingAverage <= 5.0),
    ReviewCount INT NOT NULL DEFAULT 0 CHECK (ReviewCount >= 0),
    Description NVARCHAR(MAX) NULL,
    ShortDescription NVARCHAR(500) NULL,
    CoverImageUrl NVARCHAR(500) NOT NULL,
    IsFlashSale BIT NOT NULL DEFAULT 0,
    IsTrending BIT NOT NULL DEFAULT 0,
    IsBestSeller BIT NOT NULL DEFAULT 0,
    IsNewRelease BIT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Books_Publishers FOREIGN KEY (PublisherID) REFERENCES dbo.Publishers(PublisherID)
);

CREATE TABLE dbo.BookAuthors (
    BookID INT NOT NULL,
    AuthorID INT NOT NULL,
    IsMainAuthor BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_BookAuthors PRIMARY KEY (BookID, AuthorID),
    CONSTRAINT FK_BookAuthors_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID) ON DELETE CASCADE,
    CONSTRAINT FK_BookAuthors_Authors FOREIGN KEY (AuthorID) REFERENCES dbo.Authors(AuthorID) ON DELETE CASCADE
);

CREATE TABLE dbo.BookCategories (
    BookID INT NOT NULL,
    CategoryID INT NOT NULL,
    CONSTRAINT PK_BookCategories PRIMARY KEY (BookID, CategoryID),
    CONSTRAINT FK_BookCategories_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID) ON DELETE CASCADE,
    CONSTRAINT FK_BookCategories_Categories FOREIGN KEY (CategoryID) REFERENCES dbo.Categories(CategoryID) ON DELETE CASCADE
);

CREATE TABLE dbo.BookImages (
    ImageID INT IDENTITY(1,1) PRIMARY KEY,
    BookID INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_BookImages_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID) ON DELETE CASCADE
);

-- ==============================================================================
-- 3. NHÓM BẢNG GIỎ HÀNG, ĐƠN HÀNG & THANH TOÁN (CARTS, ORDERS, PAYMENTS)
-- ==============================================================================

IF OBJECT_ID('dbo.OrderStatusHistories', 'U') IS NOT NULL DROP TABLE dbo.OrderStatusHistories;
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL DROP TABLE dbo.Payments;
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.CartItems', 'U') IS NOT NULL DROP TABLE dbo.CartItems;
IF OBJECT_ID('dbo.Carts', 'U') IS NOT NULL DROP TABLE dbo.Carts;

CREATE TABLE dbo.Carts (
    CartID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NULL,
    SessionToken VARCHAR(100) NULL, -- Cho khách vãng lai
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Carts_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE
);

CREATE TABLE dbo.CartItems (
    CartItemID INT IDENTITY(1,1) PRIMARY KEY,
    CartID INT NOT NULL,
    BookID INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1 CHECK (Quantity > 0),
    IsSelected BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_CartItems_Carts FOREIGN KEY (CartID) REFERENCES dbo.Carts(CartID) ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID)
);

CREATE TABLE dbo.Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    OrderCode VARCHAR(50) NOT NULL UNIQUE,
    UserID INT NULL,
    CustomerName NVARCHAR(150) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    Email VARCHAR(150) NOT NULL,
    Province NVARCHAR(100) NOT NULL,
    District NVARCHAR(100) NOT NULL,
    Ward NVARCHAR(100) NOT NULL,
    StreetAddress NVARCHAR(255) NOT NULL,
    OrderNotes NVARCHAR(500) NULL,
    PaymentMethod VARCHAR(50) NOT NULL DEFAULT 'COD', -- 'COD', 'STORE_PICKUP'
    OrderStatus VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending','confirmed','processing','shipping','completed','cancelled'
    SubTotal DECIMAL(18,2) NOT NULL CHECK (SubTotal >= 0),
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0 CHECK (DiscountAmount >= 0),
    ShippingFee DECIMAL(18,2) NOT NULL DEFAULT 0 CHECK (ShippingFee >= 0),
    TotalAmount DECIMAL(18,2) NOT NULL CHECK (TotalAmount >= 0),
    VoucherCode VARCHAR(50) NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.OrderItems (
    OrderItemID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    BookID INT NOT NULL,
    BookTitle NVARCHAR(300) NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL CHECK (UnitPrice >= 0),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    TotalPrice AS (UnitPrice * Quantity),
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID)
);

CREATE TABLE dbo.OrderStatusHistories (
    HistoryID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    Status VARCHAR(50) NOT NULL,
    Note NVARCHAR(255) NULL,
    ChangedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_StatusHistories_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID) ON DELETE CASCADE
);

CREATE TABLE dbo.Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL UNIQUE,
    PaymentMethod VARCHAR(50) NOT NULL,
    Amount DECIMAL(18,2) NOT NULL CHECK (Amount >= 0),
    PaymentStatus VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    TransactionRef VARCHAR(100) NULL,
    PaidAt DATETIME2 NULL,
    CONSTRAINT FK_Payments_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID) ON DELETE CASCADE
);

-- ==============================================================================
-- 4. NHÓM BẢNG QUẢN LÝ KHO & GIỮ CHỖ TỒN (WAREHOUSE & STOCK RESERVATION)
-- ==============================================================================

IF OBJECT_ID('dbo.StockMovements', 'U') IS NOT NULL DROP TABLE dbo.StockMovements;
IF OBJECT_ID('dbo.StockReservations', 'U') IS NOT NULL DROP TABLE dbo.StockReservations;
IF OBJECT_ID('dbo.BranchStocks', 'U') IS NOT NULL DROP TABLE dbo.BranchStocks;
IF OBJECT_ID('dbo.Branches', 'U') IS NOT NULL DROP TABLE dbo.Branches;

CREATE TABLE dbo.Branches (
    BranchID INT IDENTITY(1,1) PRIMARY KEY,
    BranchName NVARCHAR(150) NOT NULL,
    Address NVARCHAR(255) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(30) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.BranchStocks (
    BranchID INT NOT NULL,
    BookID INT NOT NULL,
    QuantityInStock INT NOT NULL DEFAULT 0 CHECK (QuantityInStock >= 0),
    ReservedQuantity INT NOT NULL DEFAULT 0 CHECK (ReservedQuantity >= 0),
    CONSTRAINT PK_BranchStocks PRIMARY KEY (BranchID, BookID),
    CONSTRAINT FK_BranchStocks_Branches FOREIGN KEY (BranchID) REFERENCES dbo.Branches(BranchID),
    CONSTRAINT FK_BranchStocks_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID)
);

CREATE TABLE dbo.StockReservations (
    ReservationID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    BookID INT NOT NULL,
    ReservedQuantity INT NOT NULL CHECK (ReservedQuantity > 0),
    ExpiresAt DATETIME2 NOT NULL,
    IsReleased BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_StockReservations_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID) ON DELETE CASCADE,
    CONSTRAINT FK_StockReservations_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID)
);

CREATE TABLE dbo.StockMovements (
    MovementID INT IDENTITY(1,1) PRIMARY KEY,
    BookID INT NOT NULL,
    MovementType VARCHAR(50) NOT NULL, -- 'INBOUND_PURCHASE', 'OUTBOUND_ORDER', 'ORDER_CANCEL_RESTOCK', 'ADJUSTMENT'
    QuantityChanged INT NOT NULL,
    ReferenceID VARCHAR(100) NULL,
    Note NVARCHAR(255) NULL,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_StockMovements_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID)
);

-- ==============================================================================
-- 5. NHÓM BẢNG MARKETING, BANNER, MÃ KHUYẾN MÃI & ĐÁNH GIÁ (MARKETING & REVIEWS)
-- ==============================================================================

IF OBJECT_ID('dbo.Reviews', 'U') IS NOT NULL DROP TABLE dbo.Reviews;
IF OBJECT_ID('dbo.Wishlists', 'U') IS NOT NULL DROP TABLE dbo.Wishlists;
IF OBJECT_ID('dbo.Banners', 'U') IS NOT NULL DROP TABLE dbo.Banners;
IF OBJECT_ID('dbo.PromotionUsages', 'U') IS NOT NULL DROP TABLE dbo.PromotionUsages;
IF OBJECT_ID('dbo.Promotions', 'U') IS NOT NULL DROP TABLE dbo.Promotions;

CREATE TABLE dbo.Promotions (
    PromotionID INT IDENTITY(1,1) PRIMARY KEY,
    PromoCode VARCHAR(50) NOT NULL UNIQUE,
    Title NVARCHAR(200) NOT NULL,
    DiscountType VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' OR 'fixed'
    DiscountValue DECIMAL(18,2) NOT NULL CHECK (DiscountValue > 0),
    MinOrderValue DECIMAL(18,2) NOT NULL DEFAULT 0 CHECK (MinOrderValue >= 0),
    MaxDiscountAmount DECIMAL(18,2) NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    UsageLimit INT NULL,
    UsedCount INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.PromotionUsages (
    UsageID INT IDENTITY(1,1) PRIMARY KEY,
    PromotionID INT NOT NULL,
    UserID INT NULL,
    OrderID INT NOT NULL,
    DiscountApplied DECIMAL(18,2) NOT NULL,
    UsedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PromoUsages_Promotions FOREIGN KEY (PromotionID) REFERENCES dbo.Promotions(PromotionID),
    CONSTRAINT FK_PromoUsages_Orders FOREIGN KEY (OrderID) REFERENCES dbo.Orders(OrderID)
);

CREATE TABLE dbo.Banners (
    BannerID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    LinkTarget NVARCHAR(500) NOT NULL,
    BannerType VARCHAR(50) NOT NULL DEFAULT 'hero', -- 'hero', 'promo_side', 'flash_sale'
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME()
);

CREATE TABLE dbo.Wishlists (
    WishlistID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    BookID INT NOT NULL,
    AddedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_Wishlists_User_Book UNIQUE (UserID, BookID),
    CONSTRAINT FK_Wishlists_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID) ON DELETE CASCADE,
    CONSTRAINT FK_Wishlists_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID) ON DELETE CASCADE
);

CREATE TABLE dbo.Reviews (
    ReviewID INT IDENTITY(1,1) PRIMARY KEY,
    BookID INT NOT NULL,
    UserID INT NULL,
    ReviewerName NVARCHAR(150) NOT NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    Comment NVARCHAR(MAX) NOT NULL,
    VerifiedPurchase BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Reviews_Books FOREIGN KEY (BookID) REFERENCES dbo.Books(BookID) ON DELETE CASCADE
);

-- ==============================================================================
-- 6. INDEXES CHO HIỆU NĂNG TRUY VẤN VÀ TÌM KIẾM TỐI ƯU
-- ==============================================================================

CREATE NONCLUSTERED INDEX IX_Books_Slug ON dbo.Books (Slug);
CREATE NONCLUSTERED INDEX IX_Books_ISBN ON dbo.Books (ISBN);
CREATE NONCLUSTERED INDEX IX_Books_SellingPrice ON dbo.Books (SellingPrice);
CREATE NONCLUSTERED INDEX IX_Books_Title_Filtered ON dbo.Books (Title, IsDeleted);
CREATE NONCLUSTERED INDEX IX_Orders_OrderCode ON dbo.Orders (OrderCode);
CREATE NONCLUSTERED INDEX IX_Orders_Status_CreatedAt ON dbo.Orders (OrderStatus, CreatedAt DESC);

-- ==============================================================================
-- 7. STORED PROCEDURE: TRANSACTION ĐẶT HÀNG & TRỪ TỒN KHO AN TOÀN
-- ==============================================================================
GO
CREATE OR ALTER PROCEDURE dbo.sp_CreateOrderWithInventoryCheck
    @OrderCode VARCHAR(50),
    @UserID INT = NULL,
    @CustomerName NVARCHAR(150),
    @PhoneNumber VARCHAR(20),
    @Email VARCHAR(150),
    @Province NVARCHAR(100),
    @District NVARCHAR(100),
    @Ward NVARCHAR(100),
    @StreetAddress NVARCHAR(255),
    @OrderNotes NVARCHAR(500) = NULL,
    @PaymentMethod VARCHAR(50) = 'COD',
    @SubTotal DECIMAL(18,2),
    @DiscountAmount DECIMAL(18,2),
    @ShippingFee DECIMAL(18,2),
    @TotalAmount DECIMAL(18,2),
    @VoucherCode VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Thêm bản ghi đơn hàng
        INSERT INTO dbo.Orders (
            OrderCode, UserID, CustomerName, PhoneNumber, Email,
            Province, District, Ward, StreetAddress, OrderNotes,
            PaymentMethod, OrderStatus, SubTotal, DiscountAmount,
            ShippingFee, TotalAmount, VoucherCode, CreatedAt, UpdatedAt
        )
        VALUES (
            @OrderCode, @UserID, @CustomerName, @PhoneNumber, @Email,
            @Province, @District, @Ward, @StreetAddress, @OrderNotes,
            @PaymentMethod, 'pending', @SubTotal, @DiscountAmount,
            @ShippingFee, @TotalAmount, @VoucherCode, SYSDATETIME(), SYSDATETIME()
        );

        DECLARE @NewOrderID INT = SCOPE_IDENTITY();

        -- 2. Ghi lịch sử trạng thái ban đầu
        INSERT INTO dbo.OrderStatusHistories (OrderID, Status, Note, ChangedAt)
        VALUES (@NewOrderID, 'pending', N'Đơn hàng được khởi tạo thành công qua SACHHAY Website', SYSDATETIME());

        COMMIT TRANSACTION;

        SELECT @NewOrderID AS OrderID, @OrderCode AS OrderCode, 'SUCCESS' AS StatusMessage;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- ==============================================================================
-- 8. DỮ LIỆU MẪU (SEED DATA CHO HỆ THỐNG SACHHAY)
-- ==============================================================================

-- Roles
INSERT INTO dbo.Roles (RoleName, Description) VALUES
(N'Admin', N'Quản trị viên toàn hệ thống SACHHAY'),
(N'Customer', N'Khách hàng thành viên');

-- Users & Admin
INSERT INTO dbo.Users (FullName, Email, PasswordHash, PhoneNumber, IsActive) VALUES
(N'Quản Trị Viên SACHHAY', 'admin@sachhay.vn', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '0909999888', 1),
(N'Nguyễn Thị Thu Hà', 'thuha.nguyen@sachhay.vn', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', '0903123456', 1);

INSERT INTO dbo.UserRoles (UserID, RoleID) VALUES (1, 1), (2, 2);

-- Publishers
INSERT INTO dbo.Publishers (PublisherName, Address, PhoneNumber) VALUES
(N'NXB Trẻ', N'161B Lý Chính Thắng, Quận 3, TP.HCM', '02839316289'),
(N'NXB Kim Đồng', N'55 Quang Trung, Hai Bà Trưng, Hà Nội', '02439434730'),
(N'Nhã Nam', N'59 Đỗ Quang, Trung Hòa, Cầu Giấy, Hà Nội', '02435146875'),
(N'First News - Trí Việt', N'11H Nguyễn Thị Minh Khai, Quận 1, TP.HCM', '02838227979');

-- Categories
INSERT INTO dbo.Categories (CategoryName, Slug, IconName, SortOrder) VALUES
(N'Văn Học', 'van-hoc', 'BookOpen', 1),
(N'Sách Kinh Tế', 'kinh-te', 'TrendingUp', 2),
(N'Tâm Lý - Kỹ Năng', 'ky-nang-song', 'Smile', 3),
(N'Manga - Comic', 'truyen-tranh', 'Layers', 4),
(N'Sách Thiếu Nhi', 'sach-thieu-nhi', 'Sparkles', 5),
(N'Văn Phòng Phẩm', 'van-phong-pham', 'PenTool', 6);

-- Promotions
INSERT INTO dbo.Promotions (PromoCode, Title, DiscountType, DiscountValue, MinOrderValue, StartDate, EndDate, IsActive) VALUES
('SACHHAY20K', N'Giảm 20.000đ cho đơn từ 150.000đ', 'fixed', 20000, 150000, '2026-01-01', '2026-12-31', 1),
('FREESHIP', N'Miễn phí vận chuyển toàn quốc', 'fixed', 30000, 250000, '2026-01-01', '2026-12-31', 1);

PRINT N'Cơ sở dữ liệu SACHHAY_DB đã được khởi tạo thành công!';
`;
