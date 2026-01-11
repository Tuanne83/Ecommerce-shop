# E-Commerce Platform - Full Stack Application

Ứng dụng e-commerce hoàn chỉnh với backend Node.js/Express và frontend React, kết nối với SQL Server database.

## 🚀 Tính năng

- **Authentication**: Đăng ký, đăng nhập với JWT
- **Products**: Xem danh sách sản phẩm, tìm kiếm, lọc theo danh mục
- **Shopping Cart**: Thêm/xóa/cập nhật sản phẩm trong giỏ hàng
- **Orders**: Tạo đơn hàng, thanh toán, theo dõi trạng thái
- **Seller Dashboard**: Quản lý shop và sản phẩm (dành cho Seller)
- **User Profile**: Quản lý thông tin, địa chỉ, lịch sử giao dịch

## 📁 Cấu trúc Project

```
DataBaseLab_Project/
├── backend/          # Node.js + Express API
│   ├── config/       # Database configuration
│   ├── database/     # Database scripts
│   │   ├── CreateTable.sql  # Database schema & initial data
│   │   └── query.sql         # Stored procedures, triggers, functions
│   ├── middleware/   # Auth middleware
│   ├── routes/       # API routes
│   └── server.js     # Main server file
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## 🛠️ Cài đặt

### Backend

1. Vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` từ `.env.example` và cấu hình:
```
DB_SERVER=localhost
DB_DATABASE=project_20251
DB_USER=sa
DB_PASSWORD=your_password
DB_PORT=1433
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

4. Chạy server:
```bash
npm start
# hoặc với nodemon (development)
npm run dev
```

### Frontend

1. Vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`
Backend API tại `http://localhost:5000`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `GET /api/products/categories/all` - Lấy danh mục

### Cart
- `GET /api/cart` - Lấy giỏ hàng (cần auth)
- `POST /api/cart/add` - Thêm vào giỏ hàng
- `PUT /api/cart/update` - Cập nhật giỏ hàng

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `POST /api/orders/create` - Tạo đơn hàng
- `POST /api/orders/:id/pay` - Thanh toán đơn hàng

### Seller
- `GET /api/seller/shops` - Lấy shops của seller
- `POST /api/seller/shop` - Tạo shop mới
- `POST /api/seller/products` - Thêm sản phẩm

### User
- `GET /api/user/me` - Thông tin user
- `GET /api/user/addresses` - Địa chỉ giao hàng
- `POST /api/user/address` - Thêm địa chỉ
- `GET /api/user/transactions` - Lịch sử giao dịch

## 🎨 UI/UX Features

- Responsive design cho mobile và desktop
- Modern UI với gradient và shadows
- Loading states và error handling
- Form validation
- Real-time cart updates
- Order tracking với status colors

## 🔐 Authentication

Ứng dụng sử dụng JWT tokens. Sau khi đăng nhập, token được lưu trong localStorage và tự động gửi kèm trong header của mọi request.

## 📊 Database

Database sử dụng SQL Server với các stored procedures và triggers đã được định nghĩa trong `backend/database/CreateTable.sql` và `backend/database/query.sql`.

**Thiết lập database:**
1. Chạy `backend/database/CreateTable.sql` để tạo database, tables và dữ liệu mẫu
2. Chạy `backend/database/query.sql` để tạo triggers, stored procedures và functions

## 👥 User Roles

- **Admin**: Quản trị hệ thống
- **Seller**: Quản lý shop và sản phẩm
- **Customer**: Mua sắm và đặt hàng

## 🚀 Deployment

### Backend
- Có thể deploy lên Heroku, Railway, hoặc VPS
- Cần cấu hình biến môi trường
- Đảm bảo SQL Server accessible

### Frontend
- Build production: `npm run build`
- Deploy lên Vercel, Netlify, hoặc static hosting

## 📝 Notes

- Đảm bảo SQL Server đang chạy và database đã được tạo
- Chạy các scripts SQL trong thứ tự: `CreateTable.sql` trước, sau đó `query.sql`
- Các stored procedures trong `backend/database/query.sql` cần được chạy để API hoạt động đúng
- Default users: admin/admin, seller01/123456, user01/123456
