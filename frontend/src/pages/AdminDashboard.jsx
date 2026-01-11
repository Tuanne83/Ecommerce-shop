import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('statistics');
  const [loading, setLoading] = useState(true);
  
  // Statistics
  const [statistics, setStatistics] = useState(null);
  
  // Data
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user || user.RoleName !== 'Admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'statistics') {
        const res = await axios.get('/api/admin/statistics');
        setStatistics(res.data);
      } else if (activeTab === 'users') {
        const [usersRes, rolesRes] = await Promise.all([
          axios.get('/api/admin/users'),
          axios.get('/api/admin/roles')
        ]);
        setUsers(usersRes.data);
        setRoles(rolesRes.data);
      } else if (activeTab === 'shops') {
        const res = await axios.get('/api/admin/shops');
        setShops(res.data);
      } else if (activeTab === 'products') {
        const res = await axios.get('/api/admin/products');
        setProducts(res.data);
      } else if (activeTab === 'orders') {
        const res = await axios.get('/api/admin/orders');
        setOrders(res.data);
      } else if (activeTab === 'categories') {
        const res = await axios.get('/api/admin/categories');
        setCategories(res.data);
      } else if (activeTab === 'transactions') {
        const res = await axios.get('/api/admin/transactions');
        setTransactions(res.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, roleId) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { roleId });
      alert('Cập nhật role thành công!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật');
    }
  };

  const updateUserBalance = async (userId, balance) => {
    try {
      await axios.put(`/api/admin/users/${userId}/balance`, { balance });
      alert('Cập nhật số dư thành công!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này?')) return;
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      alert('Xóa user thành công!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status });
      alert('Cập nhật trạng thái thành công!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi cập nhật');
    }
  };

  const deleteShop = async (shopId) => {
    if (!window.confirm('Bạn có chắc muốn xóa shop này?')) return;
    try {
      await axios.delete(`/api/admin/shops/${shopId}`);
      alert('Xóa shop thành công!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa');
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await axios.delete(`/api/admin/products/${productId}`);
      alert('Xóa sản phẩm thành công!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await axios.delete(`/api/admin/categories/${categoryId}`);
      alert('Xóa danh mục thành công!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi xóa');
    }
  };

  if (loading && activeTab === 'statistics') {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>
        
        <div className="dashboard-tabs">
          <button
            className={activeTab === 'statistics' ? 'active' : ''}
            onClick={() => setActiveTab('statistics')}
          >
            📊 Thống kê
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={activeTab === 'shops' ? 'active' : ''}
            onClick={() => setActiveTab('shops')}
          >
            🏪 Shops
          </button>
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            📦 Products
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            🛒 Orders
          </button>
          <button
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            🏷️ Categories
          </button>
          <button
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            💳 Transactions
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'statistics' && statistics && (
            <div className="statistics-grid">
              <div className="stat-card">
                <h3>Tổng Users</h3>
                <p className="stat-number">{statistics.users}</p>
              </div>
              <div className="stat-card">
                <h3>Tổng Shops</h3>
                <p className="stat-number">{statistics.shops}</p>
              </div>
              <div className="stat-card">
                <h3>Tổng Products</h3>
                <p className="stat-number">{statistics.products}</p>
              </div>
              <div className="stat-card">
                <h3>Tổng Orders</h3>
                <p className="stat-number">{statistics.orders}</p>
              </div>
              <div className="stat-card">
                <h3>Doanh thu</h3>
                <p className="stat-number">{parseInt(statistics.revenue || 0).toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="stat-card">
                <h3>Đơn chờ xử lý</h3>
                <p className="stat-number">{statistics.pendingOrders}</p>
              </div>
              <div className="stat-card">
                <h3>Đơn hoàn thành</h3>
                <p className="stat-number">{statistics.completedOrders}</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-table-section">
              <h2>Quản lý Users</h2>
              {loading ? (
                <div className="loading"><div className="spinner"></div></div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Số dư</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.UserID}>
                        <td>{u.UserID}</td>
                        <td>{u.Username}</td>
                        <td>{u.UserFullname}</td>
                        <td>{u.Email}</td>
                        <td>
                          <select
                            value={u.RoleID}
                            onChange={(e) => updateUserRole(u.UserID, parseInt(e.target.value))}
                          >
                            {roles.map(r => (
                              <option key={r.RoleID} value={r.RoleID}>{r.RoleName}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            value={u.Balance}
                            onChange={(e) => updateUserBalance(u.UserID, parseFloat(e.target.value))}
                            onBlur={(e) => updateUserBalance(u.UserID, parseFloat(e.target.value))}
                            style={{ width: '120px' }}
                          />
                        </td>
                        <td>{new Date(u.CreatedAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <button
                            onClick={() => deleteUser(u.UserID)}
                            className="btn btn-danger"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'shops' && (
            <div className="admin-table-section">
              <h2>Quản lý Shops</h2>
              {loading ? (
                <div className="loading"><div className="spinner"></div></div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên Shop</th>
                      <th>Chủ shop</th>
                      <th>Địa chỉ</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shops.map(s => (
                      <tr key={s.ShopID}>
                        <td>{s.ShopID}</td>
                        <td>{s.ShopName}</td>
                        <td>{s.OwnerName} ({s.OwnerUsername})</td>
                        <td>{s.Address}</td>
                        <td>{new Date(s.CreatedAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <button
                            onClick={() => deleteShop(s.ShopID)}
                            className="btn btn-danger"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="admin-table-section">
              <h2>Quản lý Products</h2>
              {loading ? (
                <div className="loading"><div className="spinner"></div></div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên sản phẩm</th>
                      <th>Giá</th>
                      <th>Tồn kho</th>
                      <th>Shop</th>
                      <th>Chủ shop</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.ProductID}>
                        <td>{p.ProductID}</td>
                        <td>{p.ProductName}</td>
                        <td>{parseInt(p.Price).toLocaleString('vi-VN')} đ</td>
                        <td>{p.Stock}</td>
                        <td>{p.ShopName}</td>
                        <td>{p.ShopOwner}</td>
                        <td>
                          <button
                            onClick={() => deleteProduct(p.ProductID)}
                            className="btn btn-danger"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-table-section">
              <h2>Quản lý Orders</h2>
              {loading ? (
                <div className="loading"><div className="spinner"></div></div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Ngày đặt</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thanh toán</th>
                      <th>Vận chuyển</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.OrderID}>
                        <td>{o.OrderID}</td>
                        <td>{new Date(o.OrderDate).toLocaleDateString('vi-VN')}</td>
                        <td>{o.UserFullname} ({o.Username})</td>
                        <td>{parseInt(o.TotalAmount).toLocaleString('vi-VN')} đ</td>
                        <td>
                          <select
                            value={o.Status}
                            onChange={(e) => updateOrderStatus(o.OrderID, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Shipping">Shipping</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{o.PaymentMethod}</td>
                        <td>{o.ShippingOption}</td>
                        <td>-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="admin-table-section">
              <h2>Quản lý Categories</h2>
              {loading ? (
                <div className="loading"><div className="spinner"></div></div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên danh mục</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c.CategoryID}>
                        <td>{c.CategoryID}</td>
                        <td>{c.CategoryName}</td>
                        <td>
                          <button
                            onClick={() => deleteCategory(c.CategoryID)}
                            className="btn btn-danger"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="admin-table-section">
              <h2>Lịch sử Transactions</h2>
              {loading ? (
                <div className="loading"><div className="spinner"></div></div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Số tiền</th>
                      <th>Loại</th>
                      <th>Mô tả</th>
                      <th>Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.TransactionID}>
                        <td>{t.TransactionID}</td>
                        <td>{t.UserFullname} ({t.Username})</td>
                        <td className={t.TransactionType === 'Payment' ? 'negative' : 'positive'}>
                          {t.TransactionType === 'Payment' ? '-' : '+'}
                          {parseInt(t.Amount).toLocaleString('vi-VN')} đ
                        </td>
                        <td>
                          <span className={`transaction-type ${t.TransactionType.toLowerCase()}`}>
                            {t.TransactionType}
                          </span>
                        </td>
                        <td>{t.Description}</td>
                        <td>{new Date(t.CreatedAt).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
