import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaStar, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { formatPrice } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const BookCard = ({ book }) => {
  const { isAuthenticated, toggleWishlist } = useAuth();
  const { addToCart, isInCart } = useCart();
  
  const priceInfo = formatPrice(book.price, book.discount);
  const isBookInCart = isInCart(book._id);

  const handleAddToCart = () => {
    if (isAuthenticated) {
      addToCart(book, 1);
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  };

  const handleWishlistToggle = async () => {
    if (isAuthenticated) {
      await toggleWishlist(book._id);
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <Card className="book-card h-100">
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={book.coverImage} 
          alt={book.title}
          className="book-cover"
        />
        {book.discount > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 end-0 m-2"
          >
            -{book.discount}%
          </Badge>
        )}
        <div className="position-absolute top-0 start-0 m-2">
          <Button
            variant="light"
            size="sm"
            className="rounded-circle p-2"
            onClick={handleWishlistToggle}
            title="Add to wishlist"
          >
            <FaHeart className={book.isInWishlist ? 'text-danger' : 'text-muted'} />
          </Button>
        </div>
      </div>
      
      <Card.Body className="d-flex flex-column">
        <div className="mb-2">
          {book.category && (
            <Badge bg="secondary" className="me-1">
              {book.category}
            </Badge>
          )}
          {book.featured && (
            <Badge bg="warning" text="dark" className="me-1">
              Featured
            </Badge>
          )}
          {book.bestseller && (
            <Badge bg="success" className="me-1">
              Bestseller
            </Badge>
          )}
        </div>
        
        <Card.Title className="h6 mb-2 line-clamp-2">
          {book.title}
        </Card.Title>
        
        <Card.Text className="text-muted small mb-2">
          by {book.author}
        </Card.Text>
        
        <div className="mb-2">
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={i < Math.floor(book.rating.average) ? 'text-warning' : 'text-muted'} 
                size={14}
              />
            ))}
          </div>
          <small className="text-muted ms-1">
            ({book.rating.count} reviews)
          </small>
        </div>
        
        <div className="mt-auto">
          <div className="d-flex align-items-center mb-2">
            {book.discount > 0 ? (
              <>
                <span className="book-price me-2">${priceInfo.discounted}</span>
                <span className="book-original-price">${priceInfo.original}</span>
              </>
            ) : (
              <span className="book-price">${priceInfo.original}</span>
            )}
          </div>
          
          <div className="d-grid gap-2">
            <Button 
              as={Link} 
              to={`/books/${book._id}`}
              variant="outline-primary" 
              size="sm"
              className="btn-custom"
            >
              View Details
            </Button>
            
            <Button
              variant={isBookInCart ? "success" : "primary"}
              size="sm"
              className="btn-custom"
              onClick={handleAddToCart}
              disabled={book.stock === 0}
            >
              <FaShoppingCart className="me-2" />
              {isBookInCart ? 'In Cart' : book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
          
          {book.stock < 10 && book.stock > 0 && (
            <small className="text-warning d-block mt-2">
              Only {book.stock} left in stock!
            </small>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
