import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './SellerDashboard.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('shops');
  const [loading, setLoading] = useState(true);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [shopForm, setShopForm] = useState({
    shopName: '',
    street: '',
    ward: '',
    district: '',
    city: ''
  });
  const [productForm, setProductForm] = useState({
    shopId: '',
    productName: '',
    price: '',
    description: '',
    stock: ''
  });

  useEffect(() => {
    if (!user || user.RoleName !== 'Seller') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [shopsRes, categoriesRes] = await Promise.all([
        axios.get('/api/seller/shops'),
        axios.get('/api/products/categories/all')
      ]);
      setShops(shopsRes.data);
      setCategories(categoriesRes.data);
      if (shopsRes.data.length > 0) {
        fetchProducts(shopsRes.data[0].ShopID);
        setProductForm(prev => ({ ...prev, shopId: shopsRes.data[0].ShopID }));
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchProducts = async (shopId) => {
    try {
      const res = await axios.get(`/api/products?shopId=${shopId}`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createShop = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/seller/shop', shopForm);
      alert('Tạo shop thành công!');
      setShowShopForm(false);
      setShopForm({ shopName: '', street: '', ward: '', district: '', city: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi tạo shop');
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/seller/products', productForm);
      alert('Thêm sản phẩm thành công!');
      setShowProductForm(false);
      setProductForm({ shopId: productForm.shopId, productName: '', price: '', description: '', stock: '' });
      fetchProducts(productForm.shopId);
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi khi thêm sản phẩm');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="seller-dashboard">
      <div className="container">
        <h1>Quản lý Shop</h1>
        
        <div className="dashboard-tabs">
          <button
            className={activeTab === 'shops' ? 'active' : ''}
            onClick={() => setActiveTab('shops')}
          >
            Shops
          </button>
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Sản phẩm
          </button>
        </div>

        {activeTab === 'shops' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Danh sách Shops</h2>
              <button onClick={() => setShowShopForm(!showShopForm)} className="btn btn-primary">
                {showShopForm ? 'Hủy' : '+ Tạo Shop'}
              </button>
            </div>

            {showShopForm && (
              <form onSubmit={createShop} className="form-card">
                <h3>Tạo Shop mới</h3>
                <div className="form-group">
                  <label>Tên shop</label>
                  <input
                    type="text"
                    className="input"
                    value={shopForm.shopName}
                    onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Đường</label>
                  <input
                    type="text"
                    className="input"
                    value={shopForm.street}
                    onChange={(e) => setShopForm({ ...shopForm, street: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phường/Xã</label>
                  <input
                    type="text"
                    className="input"
                    value={shopForm.ward}
                    onChange={(e) => setShopForm({ ...shopForm, ward: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <input
                    type="text"
                    className="input"
                    value={shopForm.district}
                    onChange={(e) => setShopForm({ ...shopForm, district: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Thành phố</label>
                  <input
                    type="text"
                    className="input"
                    value={shopForm.city}
                    onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Tạo Shop</button>
              </form>
            )}

            <div className="shops-list">
              {shops.map(shop => (
                <div key={shop.ShopID} className="shop-card">
                  <h3>{shop.ShopName}</h3>
                  <p>{shop.Address}</p>
                  <p className="shop-date">Tạo ngày: {new Date(shop.CreatedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Sản phẩm</h2>
              {shops.length > 0 && (
                <button onClick={() => setShowProductForm(!showProductForm)} className="btn btn-primary">
                  {showProductForm ? 'Hủy' : '+ Thêm sản phẩm'}
                </button>
              )}
            </div>

            {shops.length === 0 ? (
              <p>Bạn cần tạo shop trước khi thêm sản phẩm</p>
            ) : (
              <>
                <div className="form-group">
                  <label>Chọn Shop</label>
                  <select
                    className="input"
                    value={productForm.shopId}
                    onChange={(e) => {
                      setProductForm({ ...productForm, shopId: e.target.value });
                      fetchProducts(e.target.value);
                    }}
                  >
                    {shops.map(shop => (
                      <option key={shop.ShopID} value={shop.ShopID}>{shop.ShopName}</option>
                    ))}
                  </select>
                </div>

                {showProductForm && (
                  <form onSubmit={createProduct} className="form-card">
                    <h3>Thêm sản phẩm mới</h3>
                    <div className="form-group">
                      <label>Tên sản phẩm</label>
                      <input
                        type="text"
                        className="input"
                        value={productForm.productName}
                        onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Giá</label>
                      <input
                        type="number"
                        className="input"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        required
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Mô tả</label>
                      <textarea
                        className="input"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số lượng</label>
                      <input
                        type="number"
                        className="input"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                        min="0"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">Thêm sản phẩm</button>
                  </form>
                )}

                <div className="products-list">
                  {products.map(product => (
                    <div key={product.ProductID} className="product-card">
                      <h3>{product.ProductName}</h3>
                      <p className="product-price">{parseInt(product.Price).toLocaleString('vi-VN')} đ</p>
                      <p className="product-stock">Còn lại: {product.Stock}</p>
                      <p className="product-description">{product.ProductDescription}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
