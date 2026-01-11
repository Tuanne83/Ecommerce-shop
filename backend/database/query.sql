--- USER MANAGEMENT


CREATE TRIGGER trg_CreateCartAfterSigingUp
ON Users
After INSERT AS
BEGIN
	INSERT INTO Carts (UserID)
    SELECT UserID
    FROM inserted i
    WHERE NOT EXISTS (
        SELECT 1 FROM Carts c WHERE c.UserID = i.UserID
    );
END;		


CREATE PROCEDURE sp_SignUp
    @Username NVARCHAR(50),
    @Fullname NVARCHAR(50),
    @Password NVARCHAR(255),
    @RoleID INT,
    @Email NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Users WHERE Username = @Username)
    BEGIN
        PRINT N'Username đã tồn tại';
        RETURN;
    END

    INSERT INTO Users (Username, UserFullname, UserPassword, Email, RoleID)
    VALUES (@Username, @Fullname, @Password, @Email, 3);

    PRINT N'Đăng ký thành công';
END;

/*
EXEC sp_SignUp
    @Username = 'user05',
    @Fullname = N'Người mua F',
    @RoleID = 3,
    @Password = '123456',
    @Email = 'user04@gmail.com';

SELECT * FROM Users ;
SELECT * FROM Carts;
*/


CREATE PROCEDURE sp_Login
    @Username NVARCHAR(50),
    @Password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra thông tin đăng nhập
    IF NOT EXISTS (
        SELECT 1
        FROM Users
        WHERE Username = @Username
          AND UserPassword = @Password
    )
    BEGIN
        PRINT N'Sai username hoặc password';
        RETURN;
    END

    -- Đăng nhập thành công → trả về thông tin user
    SELECT 
        u.UserID,
        u.Username,
        u.UserFullname,
        u.Email,
        r.RoleName,
        u.Balance,
        u.CreatedAt
    FROM Users u
    JOIN Roles r ON u.RoleID = r.RoleID
    WHERE u.Username = @Username
      AND u.UserPassword = @Password;
END;
GO

/*
    EXEC sp_Login N'user05',N'123456';
*/

CREATE PROCEDURE sp_AddShippingAddressForCus
    @UserID INT,
    @Street NVARCHAR(255),
    @Ward NVARCHAR(100),
    @District NVARCHAR(100),
    @City NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra User tồn tại và là Customer
    IF NOT EXISTS (
        SELECT 1
        FROM Users u
        JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.UserID = @UserID
          AND r.RoleName = 'Customer'
    )
    BEGIN
        PRINT N'Chỉ khách hàng (Customer) mới được thêm địa chỉ giao hàng';
        RETURN;
    END

    -- Thêm địa chỉ giao hàng
    INSERT INTO Addresses (Street, Ward, District, City, UserID)
    VALUES (@Street, @Ward, @District, @City, @UserID);

    PRINT N'Thêm địa chỉ giao hàng thành công';
END;
GO

/*
EXEC sp_AddShippingAddressForCus
    @UserID = 3,
    @Street = N'20 Nguyễn Trãi',
    @Ward = N'Thanh Xuân Trung',
    @District = N'Thanh Xuân',
    @City = N'Hà Nội';
*/


--- SHOP MANAGEMENT





CREATE PROCEDURE sp_CreateShopWithAddress
    @SellerID INT,
    @ShopName NVARCHAR(100),
    @Street NVARCHAR(255),
    @Ward NVARCHAR(100),
    @District NVARCHAR(100),
    @City NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra Seller
    IF NOT EXISTS (
        SELECT 1
        FROM Users u
        JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.UserID = @SellerID
          AND r.RoleName = 'Seller'
    )
    BEGIN
        PRINT N'Chỉ Seller mới được tạo shop';
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Thêm địa chỉ
        INSERT INTO Addresses (Street, Ward, District, City, UserID)
        VALUES (@Street, @Ward, @District, @City, @SellerID);

        DECLARE @AddressID INT = SCOPE_IDENTITY();

        -- 2. Tạo shop
        INSERT INTO Shops (ShopName, OwnerID, AddressID)
        VALUES (@ShopName, @SellerID, @AddressID);

        COMMIT TRANSACTION;
        PRINT N'Tạo shop và địa chỉ thành công';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        PRINT N'Lỗi khi tạo shop, dữ liệu đã được rollback';
    END CATCH
END;
GO



/*
    EXEC sp_CreateShopWithAddress
    @SellerID = 2, -- seller01
    @ShopName = N'Shop Test Seller',
    @Street = N'12 Trần Đại Nghĩa',
    @Ward = N'Bách Khoa',
    @District = N'Hai Bà Trưng',
    @City = N'Hà Nội';

select * from shops;
select * from Addresses
    EXEC sp_CreateShopWithAddress
    @SellerID = 3, -- user01 (Customer)
    @ShopName = N'Shop Fake',
    @Street = N'123 ABC',
    @Ward = N'X',
    @District = N'Y',
    @City = N'Hà Nội';
*/



--- PRODUCT MANAGEMENT

CREATE PROCEDURE sp_AddProductToShop
    @SellerID INT,
    @ShopID INT,
    @ProductName NVARCHAR(100),
    @Price DECIMAL(12,2),
    @Description NVARCHAR(255),
    @Stock INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra Seller hợp lệ
    IF NOT EXISTS (
        SELECT 1
        FROM Users u
        JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.UserID = @SellerID
          AND r.RoleName = 'Seller'
    )
    BEGIN
        PRINT N'Chỉ Seller mới được thêm sản phẩm';
        RETURN;
    END

    -- 2. Kiểm tra Shop thuộc Seller
    IF NOT EXISTS (
        SELECT 1
        FROM Shops
        WHERE ShopID = @ShopID
          AND OwnerID = @SellerID
    )
    BEGIN
        PRINT N'Shop không tồn tại hoặc không thuộc Seller này';
        RETURN;
    END

    -- 3. Thêm sản phẩm
    INSERT INTO Products (
        ProductName,
        Price,
        ProductDescription,
        Stock,
        ShopID
    )
    VALUES (
        @ProductName,
        @Price,
        @Description,
        @Stock,
        @ShopID
    );

    PRINT N'Thêm sản phẩm thành công';
END;
GO

/*
EXEC sp_AddProductToShop
    @SellerID = 2,
    @ShopID = 1,
    @ProductName = N'Áo thun nam',
    @Price = 199000,
    @Description = N'Cotton 100%',
    @Stock = 50;

select * from shops;
select * from products;
*/


CREATE PROCEDURE sp_CreateCategory
    @CategoryName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 FROM Categories WHERE CategoryName = @CategoryName
    )
    BEGIN
        PRINT N'Danh mục đã tồn tại';
        RETURN;
    END

    INSERT INTO Categories (CategoryName)
    VALUES (@CategoryName);

    PRINT N'Tạo danh mục thành công';
END;
GO

/*
EXEC sp_CreateCategory N'Áo nam';
EXEC sp_CreateCategory N'Giày thể thao';
select * from Categories
*/

CREATE PROCEDURE sp_AddProductToCategory
    @SellerID INT,
    @ProductID INT,
    @CategoryID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Kiểm tra Seller
    IF NOT EXISTS (
        SELECT 1
        FROM Users u
        JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.UserID = @SellerID
          AND r.RoleName = 'Seller'
    )
    BEGIN
        PRINT N'Chỉ Seller mới được gán sản phẩm vào danh mục';
        RETURN;
    END

    -- 2. Kiểm tra Product thuộc shop của Seller
    IF NOT EXISTS (
        SELECT 1
        FROM Products p
        JOIN Shops s ON p.ShopID = s.ShopID
        WHERE p.ProductID = @ProductID
          AND s.OwnerID = @SellerID
    )
    BEGIN
        PRINT N'Sản phẩm không tồn tại hoặc không thuộc shop của bạn';
        RETURN;
    END

    -- 3. Kiểm tra Category tồn tại
    IF NOT EXISTS (
        SELECT 1 FROM Categories WHERE CategoryID = @CategoryID
    )
    BEGIN
        PRINT N'Danh mục không tồn tại';
        RETURN;
    END

    -- 4. Tránh gán trùng
    IF EXISTS (
        SELECT 1
        FROM ProductCategories
        WHERE ProductID = @ProductID
          AND CategoryID = @CategoryID
    )
    BEGIN
        PRINT N'Sản phẩm đã thuộc danh mục này';
        RETURN;
    END

    -- 5. Gán
    INSERT INTO ProductCategories (ProductID, CategoryID)
    VALUES (@ProductID, @CategoryID);

    PRINT N'Gán sản phẩm vào danh mục thành công';
END;
GO
 
/*
EXEC sp_AddProductToCategory
    @SellerID = 2,
    @ProductID = 3,
    @CategoryID = 4;

select * from Categories;
select * from products;
select * from ProductCategories;
*/


--- CART AND ORDER MANAGEMENT

CREATE PROCEDURE sp_AddProductToCart
    @UserID INT,
    @ProductID INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS(
        SELECT 1 
        FROM Users u
        WHERE UserID = @UserID
    )
    BEGIN
        PRINT N'User không tồn tại';
        RETURN;
    END

    DECLARE @Stock INT;
    SELECT @Stock = Stock from Products where ProductID = @ProductID;

    IF @STOCK IS NULL
    BEGIN 
        PRINT N'Product không tồn tại';
        RETURN;
    END


    IF @Quantity <=0
    BEGIN 
        PRINT N'Không thể mua với số lượng <= 0';
        RETURN;
    END


    DECLARE @CartID INT;
    SELECT @CartID = CartID from Carts where UserID = @UserID;

    IF EXISTS (
        SELECT 1
        FROM CartItems
        WHERE CartID = @CartID AND ProductID = @ProductID
    )
    BEGIN
        UPDATE CartItems
        SET Quantity = Quantity+@Quantity
        WHERE CartID = @CartID
            AND ProductID = @ProductID
    END
    ELSE
    BEGIN
        INSERT INTO CartItems (CartID, ProductID, Quantity)
        VALUES (@CartID, @ProductID, @Quantity);
    END

    PRINT N'Thêm sản phẩm vào giỏ hàng thành công';
END

/*
EXEC sp_AddProductToCart @UserID=5, @ProductID=1, @Quantity=2;
select * from carts
select * from products
select * from cartItems
EXEC sp_AddProductToCart @UserID=5, @ProductID=1, @Quantity=3;
*/



CREATE PROCEDURE sp_UpdateCartItem
    @UserID INT,
    @ProductID INT,
    @Quantity INT
AS
BEGIN
    SET NOCOUNT ON;

     IF NOT EXISTS(
        SELECT 1 
        FROM Users u
        WHERE UserID = @UserID
    )
    BEGIN
        PRINT N'User không tồn tại';
        RETURN;
    END

    -- 1. Lấy CartID
    DECLARE @CartID INT;
    SELECT @CartID = CartID FROM Carts WHERE UserID = @UserID;

    IF @CartID IS NULL
    BEGIN
        PRINT N'Cart của user không tồn tại';
        RETURN;
    END

    -- 2. Kiểm tra sản phẩm tồn tại trong cart
    IF NOT EXISTS (
        SELECT 1 FROM CartItems
        WHERE CartID = @CartID 
            AND ProductID = @ProductID
    )
    BEGIN
        PRINT N'Sản phẩm không có trong giỏ hàng';
        RETURN;
    END

    -- 3. Cập nhật số lượng
    IF @Quantity > 0
    BEGIN
        UPDATE CartItems
        SET Quantity = @Quantity
        WHERE CartID = @CartID 
            AND ProductID = @ProductID;
        PRINT N'Cập nhật số lượng thành công';
    END
    ELSE
    BEGIN
        -- Nếu số lượng <=0 → xóa sản phẩm
        DELETE FROM CartItems
        WHERE CartID = @CartID 
            AND ProductID = @ProductID;
        PRINT N'Xóa sản phẩm khỏi giỏ hàng';
    END
END;

/*
EXEC sp_AddProductToCart @UserID=5, @ProductID=2, @Quantity=3
EXEC sp_UpdateCartItem @UserID=5, @ProductID=1, @Quantity=10;
select * from carts
select * from cartItems
EXEC sp_UpdateCartItem @UserID=5, @ProductID=1, @Quantity=-1
*/


CREATE FUNCTION fn_CartTotalAmount(@CartID INT)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @TotalAmount DECIMAL(12,2);

    SELECT @TotalAmount = SUM(p.Price * ci.Quantity)
    FROM CartItems ci
    JOIN Products p ON ci.ProductID = p.ProductID
    WHERE ci.CartID = @CartID;

    RETURN @TotalAmount;
END;
GO


CREATE PROCEDURE sp_CreateOrderFromCart
    @UserID INT,
    @ShippingOptionID INT,
    @PaymentMethodID INT,
    @ShippingAddressID INT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Lấy CartID
        DECLARE @CartID INT;
        SELECT @CartID = CartID FROM Carts 
                                WHERE UserID = @UserID;

        IF @CartID IS NULL
        BEGIN
            PRINT N'Cart của user không tồn tại';
            RETURN;
        END

        -- 2. Kiểm tra Cart có sản phẩm
        IF NOT EXISTS (SELECT 1 
                        FROM CartItems 
                        WHERE CartID = @CartID)
        BEGIN
            PRINT N'Giỏ hàng trống';
            RETURN;
        END

        -- 3. Kiểm tra đủ Stock
        IF EXISTS(
            SELECT 1 
            FROM CartItems ci
            JOIN Products p ON ci.ProductID = p.ProductID
            WHERE ci.CartID = @CartID 
                AND ci.Quantity > p.Stock
        )
        BEGIN
            PRINT N'Sản phẩm trong giỏ không đủ hàng';
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- 4. Tính tổng tiền sản phẩm + phí ship
        DECLARE @TotalAmount DECIMAL(12,2);
        DECLARE @ShippingCost DECIMAL(12,2);

        SELECT @ShippingCost = Cost FROM ShippingOptions 
                                    WHERE ShippingOptionID = @ShippingOptionID;
        SET @TotalAmount = dbo.fn_CartTotalAmount(@CartID) + ISNULL(@ShippingCost,0);

        -- 5. Tạo Order
        DECLARE @OrderID INT;
        INSERT INTO Orders (UserID, ShippingOptionID, PaymentMethodID, TotalAmount, ShippingAddressID)
        VALUES (@UserID, @ShippingOptionID, @PaymentMethodID, @TotalAmount, @ShippingAddressID);

        SET @OrderID = SCOPE_IDENTITY();

        -- 6. Tạo OrderItems, lưu giá tại thời điểm đặt
        INSERT INTO OrderItems (OrderID, ProductID, Price, Quantity)
        SELECT 
            @OrderID,
            ci.ProductID,
            p.Price,
            ci.Quantity
        FROM CartItems ci
        JOIN Products p ON ci.ProductID = p.ProductID
        WHERE ci.CartID = @CartID;

        -- 7. Cập nhật Stock của sản phẩm
        UPDATE p
        SET Stock = Stock - ci.Quantity
        FROM Products p
        JOIN CartItems ci ON p.ProductID = ci.ProductID
        WHERE ci.CartID = @CartID;

        -- 8. Xóa CartItems
        DELETE FROM CartItems WHERE CartID = @CartID;

        COMMIT TRANSACTION;
        PRINT N'Tạo đơn hàng thành công';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        PRINT N'Lỗi khi tạo đơn hàng, dữ liệu đã được rollback';
    END CATCH
END;
GO

/*
EXEC sp_CreateOrderFromCart
    @UserID = 5,
    @ShippingOptionID = 1,
    @PaymentMethodID = 1,
    @ShippingAddressID = 2;

select * from ShippingOptions
select * from PaymentMethods
select * from addresses
select * from orders
SELECT * FROM Products;
SELECT * FROM CartItems WHERE CartID = (SELECT CartID FROM Carts WHERE UserID=5);
*/



--- TRANSACTION MANAGEMENT
CREATE PROCEDURE sp_PayOrder
    @OrderID INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UserID INT;
    DECLARE @TotalAmount DECIMAL(12,2);
    DECLARE @CurrentBalance DECIMAL(12,2);
    DECLARE @OrderStatus NVARCHAR(50);
    DECLARE @ErrorMsg NVARCHAR(255) = '';

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Lấy thông tin Order
        SELECT 
            @UserID = UserID,
            @TotalAmount = TotalAmount,
            @OrderStatus = Status
        FROM Orders
        WHERE OrderID = @OrderID;

        IF @UserID IS NULL
            SET @ErrorMsg = N'Order không tồn tại';
        ELSE IF @OrderStatus <> 'Pending'
            SET @ErrorMsg = N'Chỉ Order đang Pending mới thanh toán được';
        ELSE
            SELECT @CurrentBalance = Balance FROM Users WHERE UserID = @UserID;

        IF @ErrorMsg = '' AND @CurrentBalance < @TotalAmount
            SET @ErrorMsg = N'Số dư không đủ để thanh toán';

        IF @ErrorMsg <> ''
        BEGIN
            PRINT @ErrorMsg;
            -- rollback và thoát TRY
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Trừ tiền user
        UPDATE Users
        SET Balance = Balance - @TotalAmount
        WHERE UserID = @UserID;

        -- Ghi TransactionHistory
        INSERT INTO TransactionHistory (UserID, Amount, TransactionType, Description)
        VALUES (@UserID, @TotalAmount, 'Payment', 'Thanh toán OrderID ' + CAST(@OrderID AS NVARCHAR(20)));

        -- Update Order Status = Paid
        UPDATE Orders
        SET Status = 'Paid'
        WHERE OrderID = @OrderID;

        COMMIT TRANSACTION;
        PRINT N'Thanh toán thành công, Order đã chuyển sang Paid';

    END TRY
    BEGIN CATCH
        -- Chỉ rollback nếu vẫn còn transaction
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        PRINT N'Lỗi khi thanh toán, dữ liệu đã được rollback';
        PRINT ERROR_MESSAGE();
    END CATCH
END;



/*
EXEC sp_PayOrder @OrderID = 1;
select * from users
select * from orders
update users
set balance = 100000000
where userID = 5

update orders
set status ='Pending' 
where userID = 5

select * from transactionHistory
*/

CREATE PROCEDURE sp_UpdateOrderStatus
    @OrderID INT,
    @NewStatus NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CurrentStatus NVARCHAR(50);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Lấy trạng thái hiện tại
        SELECT @CurrentStatus = Status
        FROM Orders
        WHERE OrderID = @OrderID;

        IF @CurrentStatus IS NULL
        BEGIN
            PRINT N'Order không tồn tại';
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Kiểm tra trạng thái hợp lệ
        IF @NewStatus NOT IN ('Pending', 'Paid', 'Shipping', 'Completed', 'Cancelled')
        BEGIN
            PRINT N'Trạng thái mới không hợp lệ';
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Chỉ cho phép chuyển trạng thái hợp lệ
        IF (@CurrentStatus = 'Pending' AND @NewStatus NOT IN ('Paid','Cancelled'))
            OR (@CurrentStatus = 'Paid' AND @NewStatus NOT IN ('Shipping','Cancelled'))
            OR (@CurrentStatus = 'Shipping' AND @NewStatus <> 'Completed')
            OR (@CurrentStatus IN ('Completed','Cancelled'))
        BEGIN
            PRINT N'Không thể chuyển trạng thái từ ' + @CurrentStatus + ' sang ' + @NewStatus;
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Cập nhật trạng thái
        UPDATE Orders
        SET Status = @NewStatus
        WHERE OrderID = @OrderID;

        COMMIT TRANSACTION;
        PRINT N'OrderID ' + CAST(@OrderID AS NVARCHAR(20)) + ' đã chuyển sang trạng thái: ' + @NewStatus;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        PRINT N'Lỗi khi cập nhật trạng thái đơn hàng';
        PRINT ERROR_MESSAGE();
    END CATCH
END;
GO
