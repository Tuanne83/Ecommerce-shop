use master

create database project_20251;

use project_20251

CREATE TABLE Roles (
    RoleID INT IDENTITY PRIMARY KEY,
    RoleName NVARCHAR(50) 
);

CREATE TABLE Users (
    UserID INT IDENTITY PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    UserFullname NVARCHAR(50) NOT NULL,
    UserPassword NVARCHAR(255) NOT NULL,
    Email NVARCHAR(100),
    RoleID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    Balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
);

CREATE TABLE Addresses (
    AddressID INT IDENTITY PRIMARY KEY,
    Street NVARCHAR(255),
    Ward NVARCHAR(100),
    District NVARCHAR(100),
    City NVARCHAR(100),
    UserID INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Shops (
    ShopID INT IDENTITY PRIMARY KEY,
    ShopName NVARCHAR(100) ,
    OwnerID INT NOT NULL,
    AddressID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (OwnerID) REFERENCES Users(UserID),
    FOREIGN KEY (AddressID) REFERENCES Addresses(AddressID)
);

CREATE TABLE Products (
    ProductID INT IDENTITY PRIMARY KEY,
    ShopID INT NOT NULL,
    ProductName NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Stock INT CHECK (Stock >= 0),
    ProductDescription NVARCHAR(200),
    FOREIGN KEY (ShopID) REFERENCES Shops(ShopID)
);

CREATE TABLE Categories (
    CategoryID INT IDENTITY PRIMARY KEY,
    CategoryName NVARCHAR(100) UNIQUE
);


CREATE TABLE ProductCategories (
    ProductID INT,
    CategoryID INT,
    PRIMARY KEY (ProductID, CategoryID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

CREATE TABLE Carts (
    CartID INT IDENTITY PRIMARY KEY,
    UserID INT UNIQUE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE CartItems (
    CartItemID INT IDENTITY PRIMARY KEY,
    CartID INT,
    ProductID INT,
    Quantity INT CHECK (Quantity > 0),
    FOREIGN KEY (CartID) REFERENCES Carts(CartID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

CREATE TABLE ShippingCompanies (
    CompanyID INT IDENTITY PRIMARY KEY,
    CompanyName NVARCHAR(100)
);

CREATE TABLE ShippingOptions (
    ShippingOptionID INT IDENTITY PRIMARY KEY,
    CompanyID INT,
    OptionName NVARCHAR(100),
    Cost DECIMAL(10,2),
    FOREIGN KEY (CompanyID) REFERENCES ShippingCompanies(CompanyID)
);

CREATE TABLE PaymentMethods (
    PaymentMethodID INT IDENTITY PRIMARY KEY,
    MethodName NVARCHAR(50) -- COD, Credit Card, Momo...
);

CREATE TABLE Orders (
    OrderID INT IDENTITY PRIMARY KEY,
    UserID INT NOT NULL,
    OrderDate DATETIME DEFAULT GETDATE(),
    ShippingOptionID INT NOT NULL,
    PaymentMethodID INT NOT NULL,
    TotalAmount DECIMAL(12,2) CHECK (TotalAmount >= 0),
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    ShippingAddressID INT NOT NULL,
    CHECK (Status IN ('Pending','Paid','Shipping','Completed','Cancelled')),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (ShippingOptionID) REFERENCES ShippingOptions(ShippingOptionID),
    FOREIGN KEY (PaymentMethodID) REFERENCES PaymentMethods(PaymentMethodID),
    FOREIGN KEY (ShippingAddressID) REFERENCES Addresses(AddressID)
);

CREATE TABLE OrderItems (
    OrderItemID INT IDENTITY PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Quantity INT CHECK (Quantity > 0),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

CREATE TABLE TransactionHistory (
    TransactionID INT IDENTITY PRIMARY KEY,
    UserID INT NOT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    TransactionType NVARCHAR(20) NOT NULL CHECK (TransactionType IN ('TopUp','Payment','Refund')), -- TopUp, Payment, Refund
    Description NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);



CREATE INDEX idx_users_role ON Users(RoleID);
CREATE INDEX idx_addresses_user ON Addresses(UserID);
CREATE INDEX idx_shops_owner ON Shops(OwnerID);
CREATE INDEX idx_products_shop ON Products(ShopID);
CREATE INDEX idx_orders_user ON Orders(UserID);
CREATE INDEX idx_orderitems_order ON OrderItems(OrderID);



INSERT INTO Roles (RoleName)
VALUES ('Admin'), ('Seller'), ('Customer');


INSERT INTO PaymentMethods (MethodName)
VALUES ('Cash'), ('Credit Card'), ('Momo'), ('ZaloPay');

INSERT INTO ShippingCompanies (CompanyName)
VALUES ('GHN'), ('GHTK'), ('Viettel Post');

INSERT INTO ShippingOptions (CompanyID, OptionName, Cost)
VALUES
(1, 'Standard', 30000),
(1, 'Express', 50000),
(2, 'Standard', 25000);


INSERT INTO Users (Username, UserFullname, UserPassword, Email, RoleID)
VALUES 
('admin', N'Admin', 'admin', 'admin@gmail.com', 1),
('seller01', N'Người bán A', '123456', 'seller@gmail.com', 2),
('user01', N'Người mua A', '123456', 'user@gmail.com', 3);


INSERT INTO Addresses (Street, Ward, District, City, UserID)
VALUES 
(N'123 Trần Đại Nghĩa', N'Bách Khoa', N'Hai Bà Trưng', N'Hà Nội', 2),
(N'456 Giải Phóng', N'Phương Mai', N'Đống Đa', N'Hà Nội', 3);


INSERT INTO Shops (ShopName, OwnerID, AddressID)
VALUES (N'Shop Bách Khoa', 2, 1);

INSERT INTO Categories (CategoryName)
VALUES (N'Điện tử'), (N'Sách'), (N'Quần áo');

INSERT INTO Products (ShopID, ProductName, Price, Stock, ProductDescription)
VALUES
(1, N'Tai nghe Bluetooth', 250000, 100, N'Âm thanh tốt'),
(1, N'Sách SQL Cơ Bản', 120000, 50, N'Học SQL từ A-Z');

INSERT INTO ProductCategories (ProductID, CategoryID)
VALUES
(1, 1),
(2, 2);



SELECT name AS TableName
FROM sys.tables
ORDER BY name;


SELECT * FROM Roles;
SELECT * FROM Users;
SELECT * FROM Addresses;
SELECT * FROM Shops;
SELECT * FROM Products;
SELECT * FROM Categories;
SELECT * FROM ProductCategories;
SELECT * FROM Carts;
SELECT * FROM CartItems;
SELECT * FROM ShippingCompanies;
SELECT * FROM ShippingOptions;
SELECT * FROM PaymentMethods;
SELECT * FROM Orders;
SELECT * FROM OrderItems;
SELECT * FROM TransactionHistory;

ALTER TABLE Addresses
ALTER COLUMN Street NVARCHAR(255) NOT NULL;

ALTER TABLE Addresses
ALTER COLUMN Ward NVARCHAR(100) NOT NULL;

ALTER TABLE Addresses
ALTER COLUMN District NVARCHAR(100) NOT NULL;

ALTER TABLE Addresses
ALTER COLUMN City NVARCHAR(100) NOT NULL;


ALTER TABLE Shops
ALTER COLUMN ShopName NVARCHAR(100) NOT NULL;


