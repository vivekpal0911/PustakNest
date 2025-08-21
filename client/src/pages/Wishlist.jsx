import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { FaHeart, FaTrash, FaShoppingCart, FaEye, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist || []);
      } else {
        throw new Error('Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      const response = await fetch(`/api/wishlist/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(prev => prev.filter(book => book._id !== bookId));
        toast.success('Book removed from wishlist');
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const clearWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setWishlist([]);
        toast.success('Wishlist cleared');
      } else {
        throw new Error('Failed to clear wishlist');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  const handleAddToCart = (book) => {
    addToCart(book, 1);
    toast.success(`"${book.title}" added to cart`);
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Alert variant="info">
              <h4>Login Required</h4>
              <p>Please login to view your wishlist.</p>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-3">Loading your wishlist...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2">My Wishlist</h1>
              <p className="text-muted">
                {wishlist.length} book{wishlist.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            {wishlist.length > 0 && (
              <Button
                variant="outline-danger"
                onClick={clearWishlist}
                className="btn-custom"
              >
                <FaTrash className="me-2" />
                Clear All
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {wishlist.length === 0 ? (
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <div className="py-5">
              <FaHeart size={64} className="text-muted mb-3" />
              <h4>Your wishlist is empty</h4>
              <p className="text-muted mb-4">
                Start building your reading list by adding books you'd like to read!
              </p>
              <Link to="/books" className="btn btn-primary">
                Browse Books
              </Link>
            </div>
          </Col>
        </Row>
      ) : (
        <Row>
          {wishlist.map((book) => (
            <Col key={book._id} lg={4} md={6} className="mb-4">
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
                      variant="danger"
                      size="sm"
                      className="rounded-circle p-2"
                      onClick={() => removeFromWishlist(book._id)}
                      title="Remove from wishlist"
                    >
                      <FaHeart />
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
                          className={i < Math.floor(book.rating?.average || 0) ? 'text-warning' : 'text-muted'}
                          size={14}
                        />
                      ))}
                    </div>
                    <small className="text-muted ms-1">
                      ({book.rating?.count || 0} reviews)
                    </small>
                  </div>

                  <div className="mt-auto">
                    <div className="d-flex align-items-center mb-2">
                      {book.discount > 0 ? (
                        <>
                          <span className="book-price me-2">
                            ${(book.price - (book.price * book.discount / 100)).toFixed(2)}
                          </span>
                          <span className="book-original-price">${book.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="book-price">${book.price.toFixed(2)}</span>
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
                        <FaEye className="me-2" />
                        View Details
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        className="btn-custom"
                        onClick={() => handleAddToCart(book)}
                        disabled={book.stock === 0}
                      >
                        <FaShoppingCart className="me-2" />
                        {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
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
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Wishlist;
