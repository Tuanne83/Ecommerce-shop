import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const categoryId = searchParams.get('category');
  const shopId = searchParams.get('shop');

  useEffect(() => {
    fetchData();
  }, [categoryId, shopId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryId) params.categoryId = categoryId;
      if (shopId) params.shopId = shopId;
      if (search) params.search = search;

      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/products', { params }),
        axios.get('/api/products/categories/all')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1>Sản phẩm</h1>
        
        <div className="products-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="input"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Tìm kiếm</button>
          </form>

          <div className="categories-filter">
            <Link 
              to="/products" 
              className={`category-filter ${!categoryId ? 'active' : ''}`}
            >
              Tất cả
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.CategoryID}
                to={`/products?category=${cat.CategoryID}`}
                className={`category-filter ${categoryId == cat.CategoryID ? 'active' : ''}`}
              >
                {cat.CategoryName}
              </Link>
            ))}
          </div>
        </div>

        <div className="products-grid">
          {products.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
              Không tìm thấy sản phẩm nào
            </p>
          ) : (
            products.map(product => (
              <Link key={product.ProductID} to={`/products/${product.ProductID}`} className="product-card">
                <div className="product-image">🛍️</div>
                <div className="product-info">
                  <h3>{product.ProductName}</h3>
                  <p className="product-shop">{product.ShopName}</p>
                  <p className="product-price">{parseInt(product.Price).toLocaleString('vi-VN')} đ</p>
                  <p className="product-stock">Còn lại: {product.Stock}</p>
                  {product.Categories && (
                    <p className="product-categories">{product.Categories}</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
