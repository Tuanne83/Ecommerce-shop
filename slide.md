
### 4.2. Purpose of Indexes

- **idx_users_role**: Optimize queries to find users by RoleID (role-based access)
- **idx_addresses_user**: Optimize queries for addresses by UserID
- **idx_shops_owner**: Optimize queries for shops by OwnerID (Seller)
- **idx_products_shop**: Optimize queries for products by ShopID
- **idx_orders_user**: Optimize queries for orders by UserID
- **idx_orderitems_order**: Optimize queries for order details by OrderID

**Total Number of Indexes: 6**

---

## 5. Function

### 5.1. List of Functions

#### **fn_CartTotalAmount** - Calculate Shopping Cart Total Amount

```sql
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
```

**Function**: Calculate the total amount of all products in the shopping cart
- **Input**: CartID
- **Output**: Total amount (DECIMAL(12,2))
- **Usage**: Called in stored procedure `sp_CreateOrderFromCart` to calculate order total

**Total Number of Functions: 1**

---

## 6. Trigger

### 6.1. List of Triggers

#### **trg_CreateCartAfterSigingUp** - Automatically Create Cart After Registration

```sql
CREATE TRIGGER trg_CreateCartAfterSigingUp
ON Users
AFTER INSERT AS
BEGIN
    INSERT INTO Carts (UserID)
    SELECT UserID
    FROM inserted i
    WHERE NOT EXISTS (
        SELECT 1 FROM Carts c WHERE c.UserID = i.UserID
    );
END;
```

**Function**: 
- Trigger: After INSERT into Users table
- Action: Automatically create a shopping cart (Cart) for newly registered users
- Condition: Check if user doesn't already have a cart before creating

**Reason for Use**: 
- Ensures every user has a cart immediately after registration
- Automates the process, no manual call needed

**Total Number of Triggers: 1**

---

## 7. Stored ProceDure

### 7.1. List of Stored Procedures

#### **USER MANAGEMENT**

1. **sp_SignUp** - User Registration
   - Input: @Username, @Fullname, @Password, @RoleID, @Email
   - Function: Check if username exists, create new user (default RoleID=3 - Customer)
   - Output: Success/failure message

2. **sp_Login** - User Login
   - Input: @Username, @Password
   - Function: Validate login credentials, return user information and role
   - Output: SELECT user information (UserID, Username, UserFullname, Email, RoleName, Balance, CreatedAt)

3. **sp_AddShippingAddressForCus** - Add Shipping Address (Customer only)
   - Input: @UserID, @Street, @Ward, @District, @City
   - Function: Check if user is Customer, add shipping address
   - Output: Success/failure message

#### **SHOP MANAGEMENT**

4. **sp_CreateShopWithAddress** - Create Shop with Address (Seller only)
   - Input: @SellerID, @ShopName, @Street, @Ward, @District, @City
   - Function: Validate Seller, create Address and Shop in transaction
   - Output: Success/failure message

#### **PRODUCT MANAGEMENT**

5. **sp_AddProductToShop** - Add Product to Shop (Seller only)
   - Input: @SellerID, @ShopID, @ProductName, @Price, @Description, @Stock
   - Function: Validate Seller and Shop ownership, add product
   - Output: Success/failure message

6. **sp_CreateCategory** - Create Category
   - Input: @CategoryName
   - Function: Check if category exists, create new category
   - Output: Success/failure message

7. **sp_AddProductToCategory** - Assign Product to Category (Seller only)
   - Input: @SellerID, @ProductID, @CategoryID
   - Function: Validate Seller, Product belongs to Seller's shop, Category exists, prevent duplicates
   - Output: Success/failure message

#### **CART AND ORDER MANAGEMENT**

8. **sp_AddProductToCart** - Add Product to Cart
   - Input: @UserID, @ProductID, @Quantity
   - Function: Validate User and Product exist, quantity > 0, if product already in cart then accumulate quantity
   - Output: Success/failure message

9. **sp_UpdateCartItem** - Update Cart Item Quantity
   - Input: @UserID, @ProductID, @Quantity
   - Function: If Quantity > 0 then update, if <= 0 then remove from cart
   - Output: Success/failure message

10. **sp_CreateOrderFromCart** - Create Order from Cart
    - Input: @UserID, @ShippingOptionID, @PaymentMethodID, @ShippingAddressID
    - Function: 
      - Check cart has products
      - Check sufficient stock
      - Calculate total amount (products + shipping) using function fn_CartTotalAmount
      - Create Order and OrderItems (save price at order time)
      - Update Stock
      - Clear CartItems
    - Output: Success/failure message
    - Uses TRANSACTION to ensure data integrity

#### **TRANSACTION MANAGEMENT**

11. **sp_PayOrder** - Pay Order
    - Input: @OrderID
    - Function:
      - Check Order exists and Status = 'Pending'
      - Check sufficient balance
      - Deduct User balance
      - Record TransactionHistory
      - Update Order Status = 'Paid'
    - Output: Success/failure message
    - Uses TRANSACTION to ensure data integrity

12. **sp_UpdateOrderStatus** - Update Order Status
    - Input: @OrderID, @NewStatus
    - Function:
      - Validate status: 'Pending', 'Paid', 'Shipping', 'Completed', 'Cancelled'
      - Check status transition rules:
        - Pending → Paid or Cancelled
        - Paid → Shipping or Cancelled
        - Shipping → Completed
        - Completed/Cancelled → Cannot transition
    - Output: Success/failure message
    - Uses TRANSACTION to ensure data integrity

**Total Number of Stored Procedures: 12**
