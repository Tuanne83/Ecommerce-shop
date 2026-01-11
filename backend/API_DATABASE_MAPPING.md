# API và Database Mapping

Tài liệu này đảm bảo tất cả các backend API đang sử dụng đúng stored procedures và cấu trúc database từ `backend/database/`.

## ✅ Stored Procedures Mapping

### Authentication (`routes/auth.js`)

#### `POST /api/auth/signup`
- **Stored Procedure**: `sp_SignUp`
- **Parameters**:
  - `@Username` (NVARCHAR(50)) ✅
  - `@Fullname` (NVARCHAR(50)) ✅
  - `@Password` (NVARCHAR(255)) ✅
  - `@RoleID` (INT) - Default: 3 (Customer) ✅
  - `@Email` (NVARCHAR(100)) ✅

#### `POST /api/auth/login`
- **Stored Procedure**: `sp_Login`
- **Parameters**:
  - `@Username` (NVARCHAR(50)) ✅
  - `@Password` (NVARCHAR(255)) ✅
- **Returns**: UserID, Username, UserFullname, Email, RoleName, Balance, CreatedAt ✅

---

### Cart Management (`routes/cart.js`)

#### `GET /api/cart`
- **Query**: Direct SQL query
- **Tables**: CartItems, Carts, Products, Shops ✅
- **Columns**: All match schema ✅

#### `POST /api/cart/add`
- **Stored Procedure**: `sp_AddProductToCart`
- **Parameters**:
  - `@UserID` (INT) ✅
  - `@ProductID` (INT) ✅
  - `@Quantity` (INT) ✅

#### `PUT /api/cart/update`
- **Stored Procedure**: `sp_UpdateCartItem`
- **Parameters**:
  - `@UserID` (INT) ✅
  - `@ProductID` (INT) ✅
  - `@Quantity` (INT) ✅

---

### Orders Management (`routes/orders.js`)

#### `GET /api/orders`
- **Query**: Direct SQL query
- **Tables**: Orders, PaymentMethods, ShippingOptions, Addresses ✅
- **Columns**: All match schema ✅

#### `GET /api/orders/:id`
- **Query**: Direct SQL query
- **Tables**: Orders, PaymentMethods, ShippingOptions, Addresses, OrderItems, Products ✅

#### `POST /api/orders/create`
- **Stored Procedure**: `sp_CreateOrderFromCart`
- **Parameters**:
  - `@UserID` (INT) ✅
  - `@ShippingOptionID` (INT) ✅
  - `@PaymentMethodID` (INT) ✅
  - `@ShippingAddressID` (INT) ✅

#### `POST /api/orders/:id/pay`
- **Stored Procedure**: `sp_PayOrder`
- **Parameters**:
  - `@OrderID` (INT) ✅

#### `GET /api/orders/shipping/options`
- **Query**: Direct SQL query
- **Tables**: ShippingOptions, ShippingCompanies ✅

#### `GET /api/orders/payment/methods`
- **Query**: Direct SQL query
- **Tables**: PaymentMethods ✅

---

### Seller Management (`routes/seller.js`)

#### `POST /api/seller/shop`
- **Stored Procedure**: `sp_CreateShopWithAddress`
- **Parameters**:
  - `@SellerID` (INT) ✅
  - `@ShopName` (NVARCHAR(100)) ✅
  - `@Street` (NVARCHAR(255)) ✅
  - `@Ward` (NVARCHAR(100)) ✅
  - `@District` (NVARCHAR(100)) ✅
  - `@City` (NVARCHAR(100)) ✅

#### `GET /api/seller/shops`
- **Query**: Direct SQL query
- **Tables**: Shops, Addresses ✅

#### `POST /api/seller/products`
- **Stored Procedure**: `sp_AddProductToShop`
- **Parameters**:
  - `@SellerID` (INT) ✅
  - `@ShopID` (INT) ✅
  - `@ProductName` (NVARCHAR(100)) ✅
  - `@Price` (DECIMAL(12,2)) ✅
  - `@Description` (NVARCHAR(255)) ✅
  - `@Stock` (INT) ✅

#### `POST /api/seller/products/category`
- **Stored Procedure**: `sp_AddProductToCategory`
- **Parameters**:
  - `@SellerID` (INT) ✅
  - `@ProductID` (INT) ✅
  - `@CategoryID` (INT) ✅

#### `POST /api/seller/categories`
- **Stored Procedure**: `sp_CreateCategory`
- **Parameters**:
  - `@CategoryName` (NVARCHAR(100)) ✅

---

### User Management (`routes/user.js`)

#### `GET /api/user/me`
- **Query**: Direct SQL query
- **Tables**: Users, Roles ✅

#### `POST /api/user/address`
- **Stored Procedure**: `sp_AddShippingAddressForCus`
- **Parameters**:
  - `@UserID` (INT) ✅
  - `@Street` (NVARCHAR(255)) ✅
  - `@Ward` (NVARCHAR(100)) ✅
  - `@District` (NVARCHAR(100)) ✅
  - `@City` (NVARCHAR(100)) ✅

#### `GET /api/user/addresses`
- **Query**: Direct SQL query
- **Tables**: Addresses ✅

#### `GET /api/user/transactions`
- **Query**: Direct SQL query
- **Tables**: TransactionHistory ✅

---

### Products (`routes/products.js`)

#### `GET /api/products`
- **Query**: Direct SQL query with dynamic filters
- **Tables**: Products, Shops, ProductCategories, Categories ✅
- **Supports**: categoryId, shopId, search filters ✅

#### `GET /api/products/:id`
- **Query**: Direct SQL query
- **Tables**: Products, Shops, ProductCategories, Categories ✅

#### `GET /api/products/categories/all`
- **Query**: Direct SQL query
- **Tables**: Categories ✅

---

## ✅ Database Schema Verification

Tất cả các truy vấn SQL trực tiếp đều sử dụng đúng:
- Tên bảng (table names)
- Tên cột (column names)
- Foreign key relationships
- Data types

## ✅ Stored Procedures Verification

Tất cả các stored procedures được gọi với:
- Đúng tên stored procedure
- Đúng tên tham số (parameter names)
- Đúng kiểu dữ liệu (data types)
- Đúng thứ tự tham số (nếu có yêu cầu)

## 📝 Notes

- Tất cả stored procedures đều có trong `backend/database/query.sql`
- Tất cả tables và columns đều có trong `backend/database/CreateTable.sql`
- Đã sửa `sp_SignUp` để truyền `@RoleID` với giá trị mặc định là 3 (Customer)

## 🔍 Last Verified

- ✅ All API routes match stored procedures
- ✅ All SQL queries match database schema
- ✅ All parameter names and types are correct
- ✅ All table and column names are correct
