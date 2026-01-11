import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    shippingAddressId: '',
    shippingOptionId: '',
    paymentMethodId: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [cartRes, addressesRes, shippingRes, paymentRes] = await Promise.all([
        axios.get('/api/cart'),
        axios.get('/api/user/addresses'),
        axios.get('/api/orders/shipping/options'),
        axios.get('/api/orders/payment/methods')
      ]);
      setCartItems(cartRes.data);
      setAddresses(addressesRes.data);
      setShippingOptions(shippingRes.data);
      setPaymentMethods(paymentRes.data);
      if (addressesRes.data.length > 0) {
        setFormData(prev => ({ ...prev, shippingAddressId: addressesRes.data[0].AddressID }));
      }
      if (shippingRes.data.length > 0) {
        setFormData(prev => ({ ...prev, shippingOptionId: shippingRes.data[0].ShippingOptionID }));
      }
      if (paymentRes.data.length > 0) {
        setFormData(prev => ({ ...prev, paymentMethodId: paymentRes.data[0].PaymentMethodID }));
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.shippingAddressId || !formData.shippingOptionId || !formData.paymentMethodId) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post('/api/orders/create', formData);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.Price * item.Quantity, 0);
  const selectedShipping = shippingOptions.find(s => s.ShippingOptionID == formData.shippingOptionId);
  const finalTotal = total + (selectedShipping?.Cost || 0);

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <p>Giỏ hàng trống</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Thanh toán</h1>
        
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-content">
            <div className="checkout-form-section">
              <h2>Địa chỉ giao hàng</h2>
              {addresses.length === 0 ? (
                <p>Bạn chưa có địa chỉ. Vui lòng thêm địa chỉ trong trang Profile.</p>
              ) : (
                <div className="form-group">
                  <select
                    className="input"
                    value={formData.shippingAddressId}
                    onChange={(e) => setFormData({ ...formData, shippingAddressId: e.target.value })}
                    required
                  >
                    {addresses.map(addr => (
                      <option key={addr.AddressID} value={addr.AddressID}>
                        {addr.FullAddress}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <h2>Phương thức vận chuyển</h2>
              <div className="form-group">
                <select
                  className="input"
                  value={formData.shippingOptionId}
                  onChange={(e) => setFormData({ ...formData, shippingOptionId: e.target.value })}
                  required
                >
                  {shippingOptions.map(option => (
                    <option key={option.ShippingOptionID} value={option.ShippingOptionID}>
                      {option.CompanyName} - {option.OptionName} ({parseInt(option.Cost).toLocaleString('vi-VN')} đ)
                    </option>
                  ))}
                </select>
              </div>

              <h2>Phương thức thanh toán</h2>
              <div className="form-group">
                <select
                  className="input"
                  value={formData.paymentMethodId}
                  onChange={(e) => setFormData({ ...formData, paymentMethodId: e.target.value })}
                  required
                >
                  {paymentMethods.map(method => (
                    <option key={method.PaymentMethodID} value={method.PaymentMethodID}>
                      {method.MethodName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="checkout-summary">
              <div className="summary-card">
                <h2>Đơn hàng</h2>
                <div className="order-items">
                  {cartItems.map(item => (
                    <div key={item.CartItemID} className="order-item">
                      <span>{item.ProductName} x {item.Quantity}</span>
                      <span>{(item.Price * item.Quantity).toLocaleString('vi-VN')} đ</span>
                    </div>
                  ))}
                </div>
                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{total.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>{(selectedShipping?.Cost || 0).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng cộng:</span>
                  <span>{finalTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                {error && <div className="error">{error}</div>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || addresses.length === 0}
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
