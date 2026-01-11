import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('/api/cart/add', { productId: id, quantity });
      setMessage('Đã thêm vào giỏ hàng!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Lỗi khi thêm vào giỏ hàng');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!product) {
    return <div className="container"><p>Sản phẩm không tồn tại</p></div>;
  }

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-content">
          <div className="product-image-large">🛍️</div>
          
          <div className="product-detail-info">
            <h1>{product.ProductName}</h1>
            <p className="product-shop-name">Shop: {product.ShopName}</p>
            <p className="product-price-large">
              {parseInt(product.Price).toLocaleString('vi-VN')} đ
            </p>
            <p className="product-description">{product.ProductDescription}</p>
            
            {product.Categories && (
              <div className="product-categories">
                <strong>Danh mục:</strong> {product.Categories}
              </div>
            )}
            
            <div className="product-stock-info">
              <strong>Còn lại:</strong> {product.Stock} sản phẩm
            </div>

            {message && (
              <div className={message.includes('Lỗi') ? 'error' : 'success'}>
                {message}
              </div>
            )}

            <div className="product-actions">
              <div className="quantity-selector">
                <label>Số lượng:</label>
                <input
                  type="number"
                  min="1"
                  max={product.Stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="quantity-input"
                />
              </div>
              <button
                onClick={addToCart}
                className="btn btn-primary"
                disabled={product.Stock === 0}
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
