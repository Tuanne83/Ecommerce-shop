import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const payOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn thanh toán đơn hàng này?')) {
      return;
    }

    try {
      await axios.post(`/api/orders/${orderId}/pay`);
      alert('Thanh toán thành công!');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi thanh toán');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'var(--warning)';
      case 'Paid': return 'var(--primary)';
      case 'Shipping': return 'var(--secondary)';
      case 'Completed': return 'var(--secondary)';
      case 'Cancelled': return 'var(--danger)';
      default: return 'var(--gray-500)';
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>Đơn hàng của tôi</h1>
        
        {orders.length === 0 ? (
          <div className="empty-orders">
            <p>Bạn chưa có đơn hàng nào</p>
            <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.OrderID} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Đơn hàng #{order.OrderID}</h3>
                    <p className="order-date">
                      {new Date(order.OrderDate).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <span
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.Status) }}
                  >
                    {order.Status}
                  </span>
                </div>
                
                <div className="order-info">
                  <p><strong>Địa chỉ giao hàng:</strong> {order.ShippingAddress}</p>
                  <p><strong>Phương thức vận chuyển:</strong> {order.ShippingOption}</p>
                  <p><strong>Phương thức thanh toán:</strong> {order.PaymentMethod}</p>
                </div>
                
                <div className="order-footer">
                  <p className="order-total">
                    Tổng tiền: <strong>{parseInt(order.TotalAmount).toLocaleString('vi-VN')} đ</strong>
                  </p>
                  {order.Status === 'Pending' && (
                    <button
                      onClick={() => payOrder(order.OrderID)}
                      className="btn btn-primary"
                    >
                      Thanh toán
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
