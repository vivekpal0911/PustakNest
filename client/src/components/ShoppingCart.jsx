import React, { useState, useEffect } from 'react';
import { Offcanvas, ListGroup, Button, Badge, Form, Alert } from 'react-bootstrap';
import { FaShoppingCart, FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ShoppingCart = ({ show, onHide }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (show) {
      loadCart();
    }
  }, [show]);

  const loadCart = () => {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  const saveCart = (items) => {
    localStorage.setItem('shoppingCart', JSON.stringify(items));
    setCartItems(items);
  };

  const addToCart = (book) => {
    const existingItem = cartItems.find(item => item._id === book._id);
    
    if (existingItem) {
      const updatedItems = cartItems.map(item =>
        item._id === book._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(updatedItems);
      toast.success(`"${book.title}" quantity updated in cart`);
    } else {
      const newItem = { ...book, quantity: 1 };
      const updatedItems = [...cartItems, newItem];
      saveCart(updatedItems);
      toast.success(`"${book.title}" added to cart`);
    }
  };

  const removeFromCart = (bookId) => {
    const updatedItems = cartItems.filter(item => item._id !== bookId);
    saveCart(updatedItems);
    toast.success('Item removed from cart');
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item =>
      item._id === bookId
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(updatedItems);
  };

  const clearCart = () => {
    saveCart([]);
    toast.success('Cart cleared');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discount > 0 
        ? item.price - (item.price * item.discount / 100)
        : item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // TODO: Implement checkout process
    toast.info('Checkout feature coming soon!');
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" size="lg">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <FaShoppingCart className="me-2" />
          Shopping Cart
          {getTotalItems() > 0 && (
            <Badge bg="primary" className="ms-2">{getTotalItems()}</Badge>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body>
        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <FaShoppingCart size={48} className="text-muted mb-3" />
            <h5>Your cart is empty</h5>
            <p className="text-muted">Add some books to get started!</p>
          </div>
        ) : (
          <>
            <ListGroup className="mb-3">
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id} className="d-flex align-items-center">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                    className="me-3"
                  />
                  
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.title}</h6>
                    <p className="text-muted mb-1">by {item.author}</p>
                    <div className="d-flex align-items-center">
                      <span className="fw-bold me-3">
                        ${item.discount > 0 
                          ? (item.price - (item.price * item.discount / 100)).toFixed(2)
                          : item.price.toFixed(2)
                        }
                      </span>
                      {item.discount > 0 && (
                        <Badge bg="danger" className="me-2">{item.discount}% OFF</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center me-3">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </Button>
                    <span className="mx-3 fw-bold">{item.quantity}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      <FaPlus />
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeFromCart(item._id)}
                  >
                    <FaTrash />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
            
            <div className="border-top pt-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Total ({getTotalItems()} items):</h5>
                <h4 className="text-primary">${getTotalPrice().toFixed(2)}</h4>
              </div>
              
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
                
                <Button
                  variant="outline-secondary"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default ShoppingCart;
