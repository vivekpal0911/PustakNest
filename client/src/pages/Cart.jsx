import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getCartSummary } = useCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (bookId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(bookId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout');
  };

  const cartSummary = getCartSummary();

  if (items.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <FaShoppingCart size={100} className="text-muted mb-4" />
            <h2>Your cart is empty</h2>
            <p className="text-muted mb-4">
              Looks like you haven't added any books to your cart yet.
            </p>
            <Button 
              as={Link} 
              to="/books" 
              variant="primary" 
              size="lg"
              className="btn-custom btn-custom-primary"
            >
              <FaArrowLeft className="me-2" />
              Continue Shopping
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">Shopping Cart</h1>
          <p className="text-muted">
            You have {items.length} item{items.length !== 1 ? 's' : ''} in your cart
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Cart Items */}
          {items.map((item) => (
            <Card key={item.book._id} className="cart-item mb-3">
              <Row className="g-0">
                <Col md={3}>
                  <img
                    src={item.book.coverImage}
                    alt={item.book.title}
                    className="img-fluid rounded"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                </Col>
                <Col md={9}>
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <h5 className="card-title">{item.book.title}</h5>
                        <p className="card-text text-muted">by {item.book.author}</p>
                        
                        <div className="mb-2">
                          {item.book.category && (
                            <Badge bg="secondary" className="me-1">
                              {item.book.category}
                            </Badge>
                          )}
                          {item.book.featured && (
                            <Badge bg="warning" text="dark" className="me-1">
                              Featured
                            </Badge>
                          )}
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          {item.book.discount > 0 ? (
                            <>
                              <span className="book-price me-2">
                                ${formatPrice(item.book.price, item.book.discount).discounted}
                              </span>
                              <span className="book-original-price">
                                ${formatPrice(item.book.price, item.book.discount).original}
                              </span>
                            </>
                          ) : (
                            <span className="book-price">
                              ${formatPrice(item.book.price).original}
                            </span>
                          )}
                        </div>

                        {item.book.stock < 10 && item.book.stock > 0 && (
                          <Alert variant="warning" className="py-2 mb-2">
                            <small>Only {item.book.stock} left in stock!</small>
                          </Alert>
                        )}
                      </Col>
                      
                      <Col md={4} className="text-end">
                        <div className="d-flex align-items-center justify-content-end mb-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.book._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <FaMinus />
                          </Button>
                          
                          <Form.Control
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.book._id, parseInt(e.target.value))}
                            min="1"
                            max={item.book.stock}
                            className="mx-2 text-center"
                            style={{ width: '60px' }}
                          />
                          
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleQuantityChange(item.book._id, item.quantity + 1)}
                            disabled={item.quantity >= item.book.stock}
                          >
                            <FaPlus />
                          </Button>
                        </div>
                        
                        <div className="mb-2">
                          <strong>Total: ${(formatPrice(item.book.price, item.book.discount).discounted * item.quantity).toFixed(2)}</strong>
                        </div>
                        
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeFromCart(item.book._id)}
                          className="btn-custom"
                        >
                          <FaTrash className="me-1" />
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          ))}

          {/* Cart Actions */}
          <div className="d-flex justify-content-between align-items-center">
            <Button
              variant="outline-secondary"
              onClick={clearCart}
              className="btn-custom"
            >
              Clear Cart
            </Button>
            
            <Button
              as={Link}
              to="/books"
              variant="outline-primary"
              className="btn-custom"
            >
              <FaArrowLeft className="me-2" />
              Continue Shopping
            </Button>
          </div>
        </Col>

        {/* Cart Summary */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '100px' }}>
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal ({items.length} items):</span>
                <span>${cartSummary.subtotal}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (10%):</span>
                <span>${cartSummary.tax}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping:</span>
                <span>
                  {parseFloat(cartSummary.shipping) === 0 ? 'Free' : `$${cartSummary.shipping}`}
                </span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">${cartSummary.total}</strong>
              </div>
              
              {parseFloat(cartSummary.subtotal) < 100 && (
                <Alert variant="info" className="small">
                  Add ${(100 - parseFloat(cartSummary.subtotal)).toFixed(2)} more to get free shipping!
                </Alert>
              )}
              
              <Button
                variant="primary"
                size="lg"
                className="w-100 btn-custom btn-custom-primary"
                onClick={handleCheckout}
                disabled={items.length === 0 || isCheckingOut}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
