import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/products/categories/all')
      ]);
      setProducts(productsRes.data.slice(0, 8));
      setCategories(categoriesRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Chào mừng đến với E-Commerce Platform</h1>
          <p>Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất</p>
          <Link to="/products" className="btn btn-primary">Xem sản phẩm</Link>
        </div>
      </section>

      <section className="categories-section">
        <div className="container">
          <h2>Danh mục sản phẩm</h2>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.CategoryID} to={`/products?category=${cat.CategoryID}`} className="category-card">
                <div className="category-icon">📦</div>
                <h3>{cat.CategoryName}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <h2>Sản phẩm nổi bật</h2>
          <div className="products-grid">
            {products.map(product => (
              <Link key={product.ProductID} to={`/products/${product.ProductID}`} className="product-card">
                <div className="product-image">🛍️</div>
                <div className="product-info">
                  <h3>{product.ProductName}</h3>
                  <p className="product-shop">{product.ShopName}</p>
                  <p className="product-price">{parseInt(product.Price).toLocaleString('vi-VN')} đ</p>
                  <p className="product-stock">Còn lại: {product.Stock}</p>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/products" className="btn btn-secondary">Xem tất cả sản phẩm</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
