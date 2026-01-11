import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: '',
    ward: '',
    district: '',
    city: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [userRes, addressesRes, transactionsRes] = await Promise.all([
        axios.get('/api/user/me'),
        axios.get('/api/user/addresses'),
        axios.get('/api/user/transactions')
      ]);
      setUserInfo(userRes.data);
      setAddresses(addressesRes.data);
      setTransactions(transactionsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/user/address', addressForm);
      alert('Thêm địa chỉ thành công!');
      setShowAddressForm(false);
      setAddressForm({ street: '', ward: '', district: '', city: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi thêm địa chỉ');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>Thông tin cá nhân</h1>
        
        <div className="profile-content">
          <div className="profile-section">
            <h2>Thông tin tài khoản</h2>
            <div className="info-card">
              <p><strong>Username:</strong> {userInfo?.Username}</p>
              <p><strong>Họ và tên:</strong> {userInfo?.UserFullname}</p>
              <p><strong>Email:</strong> {userInfo?.Email}</p>
              <p><strong>Vai trò:</strong> {userInfo?.RoleName}</p>
              <p><strong>Số dư:</strong> <span className="balance">{parseInt(userInfo?.Balance || 0).toLocaleString('vi-VN')} đ</span></p>
              <p><strong>Ngày tạo:</strong> {new Date(userInfo?.CreatedAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2>Địa chỉ giao hàng</h2>
              <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn btn-primary">
                {showAddressForm ? 'Hủy' : '+ Thêm địa chỉ'}
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={addAddress} className="form-card">
                <div className="form-group">
                  <label>Đường</label>
                  <input
                    type="text"
                    className="input"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phường/Xã</label>
                  <input
                    type="text"
                    className="input"
                    value={addressForm.ward}
                    onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <input
                    type="text"
                    className="input"
                    value={addressForm.district}
                    onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Thành phố</label>
                  <input
                    type="text"
                    className="input"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Thêm địa chỉ</button>
              </form>
            )}

            <div className="addresses-list">
              {addresses.map(addr => (
                <div key={addr.AddressID} className="address-card">
                  <p>{addr.FullAddress}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h2>Lịch sử giao dịch</h2>
            <div className="transactions-list">
              {transactions.length === 0 ? (
                <p>Chưa có giao dịch nào</p>
              ) : (
                transactions.map(trans => (
                  <div key={trans.TransactionID} className="transaction-card">
                    <div className="transaction-header">
                      <span className={`transaction-type ${trans.TransactionType.toLowerCase()}`}>
                        {trans.TransactionType}
                      </span>
                      <span className={`transaction-amount ${trans.TransactionType === 'Payment' ? 'negative' : 'positive'}`}>
                        {trans.TransactionType === 'Payment' ? '-' : '+'}
                        {parseInt(trans.Amount).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <p className="transaction-desc">{trans.Description}</p>
                    <p className="transaction-date">
                      {new Date(trans.CreatedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
