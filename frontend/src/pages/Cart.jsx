import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await axios.get('/api/cart');
      setCartItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await axios.put('/api/cart/update', { productId, quantity });
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật');
    }
  };

  const removeItem = async (productId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      await updateQuantity(productId, 0);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.Price * item.Quantity, 0);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Giỏ hàng</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Giỏ hàng của bạn đang trống</p>
            <Link to="/products" className="btn btn-primary">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.CartItemID} className="cart-item">
                  <div className="cart-item-info">
                    <h3>{item.ProductName}</h3>
                    <p className="cart-item-shop">{item.ShopName}</p>
                    <p className="cart-item-price">
                      {parseInt(item.Price).toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.ProductID, item.Quantity - 1)}
                        disabled={item.Quantity <= 1}
                        className="btn-quantity"
                      >
                        -
                      </button>
                      <span className="quantity">{item.Quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.ProductID, item.Quantity + 1)}
                        disabled={item.Quantity >= item.Stock}
                        className="btn-quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="cart-item-total">
                      {(item.Price * item.Quantity).toLocaleString('vi-VN')} đ
                    </p>
                    <button
                      onClick={() => removeItem(item.ProductID)}
                      className="btn btn-danger"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="summary-card">
                <h2>Tổng cộng</h2>
                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{total.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng tiền:</span>
                  <span>{total.toLocaleString('vi-VN')} đ</span>
                </div>
                <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                  Thanh toán
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
