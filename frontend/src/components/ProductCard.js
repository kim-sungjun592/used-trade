import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MapPin, RefreshCw, Coins } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './ProductCard.css';

const CONDITION_LABEL = { '최상': '최상', '상': '상', '중상': '중상', '중': '중', '하': '하' };
const CONDITION_COLOR = { '최상': 'green', '상': 'green', '중상': 'coral', '중': 'navy', '하': 'yellow' };

export default function ProductCard({ product, onEdit, onDelete, isOwner }) {
  const { toggleLike, likedItems, currentUser } = useApp();
  const liked = likedItems.has(product.id);

  return (
    <div className="product-card card">
      {/* Image */}
      <div className="product-img-wrap">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'}
            alt={product.title}
            className="product-img"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop'; }}
          />
        </Link>

        {/* Condition Badge */}
        <span className={`condition-badge badge badge-${CONDITION_COLOR[product.condition] || 'navy'}`}>
          {CONDITION_LABEL[product.condition] || product.condition}
        </span>

        {/* Exchange Badge */}
        {product.exchangeable && (
          <span className="exchange-badge">
            <RefreshCw size={10} /> 교환가능
          </span>
        )}

        {/* Like Button */}
        <button
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={() => toggleLike(product.id)}
          aria-label="찜하기"
        >
          <Heart size={16} fill={liked ? '#FF4757' : 'none'} color={liked ? '#FF4757' : '#fff'} />
        </button>
      </div>

      {/* Info */}
      <div className="product-info">
        <span className="product-category badge badge-navy">{product.category}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-title">{product.title}</h3>
        </Link>

        <div className="product-price-row">
          <span className="product-price">{product.price.toLocaleString()}원</span>
          <span className="product-points">
            <Coins size={12} />
            {product.points?.toLocaleString()}P
          </span>
        </div>

        <div className="product-meta">
          <span><MapPin size={11} />{product.location}</span>
          <span><Eye size={11} />{product.views}</span>
          <span><Heart size={11} />{product.likes}</span>
        </div>

        <div className="product-seller">
          <div className="seller-avatar">{product.seller?.charAt(0)}</div>
          <span>{product.seller}</span>
          <span className="product-date">· {product.createdAt}</span>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="product-actions">
            <button className="btn btn-ghost btn-xs" onClick={() => onEdit(product)}>수정</button>
            <button className="btn btn-danger btn-xs" onClick={() => onDelete(product.id)}>삭제</button>
          </div>
        )}
      </div>
    </div>
  );
}
