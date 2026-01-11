import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            🛒 E-Commerce
          </Link>
          
          <div className="navbar-links">
            <Link to="/products">Sản phẩm</Link>
            
            {user ? (
              <>
                <Link to="/cart">Giỏ hàng</Link>
                <Link to="/orders">Đơn hàng</Link>
                {user.RoleName === 'Seller' && (
                  <Link to="/seller">Quản lý Shop</Link>
                )}
                {user.RoleName === 'Admin' && (
                  <Link to="/admin">Admin Dashboard</Link>
                )}
                <div className="user-menu">
                  <Link to="/profile">{user.UserFullname || user.Username}</Link>
                  <span className="balance">💰 {parseInt(user.Balance || 0).toLocaleString('vi-VN')} đ</span>
                  <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">Đăng nhập</Link>
                <Link to="/signup" className="btn btn-primary">Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
