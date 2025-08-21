import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { FaCreditCard, FaPaypal, FaLock, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cartItems, total, subtotal, tax, shipping, clearCart } = useCart();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [orderNotes, setOrderNotes] = useState('');
  
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'United States'
  });

  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // Create order mutation
  const createOrderMutation = useMutation(
    (orderData) => ordersAPI.createOrder(orderData),
    {
      onSuccess: (data) => {
        clearCart();
        queryClient.invalidateQueries(['orders']);
        navigate(`/orders/${data.order._id}`, { 
          state: { orderSuccess: true } 
        });
      },
      onError: (error) => {
        console.error('Error creating order:', error);
        setIsSubmitting(false);
      }
    }
  );

  const handleInputChange = (e, addressType) => {
    const { name, value } = e.target;
    
    if (addressType === 'shipping') {
      setShippingAddress(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Update billing address if same as shipping
      if (billingAddress.sameAsShipping) {
        setBillingAddress(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else if (addressType === 'billing') {
      setBillingAddress(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (addressType === 'payment') {
      setPaymentDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBillingToggle = (e) => {
    const isSame = e.target.checked;
    setBillingAddress(prev => ({
      ...prev,
      sameAsShipping: isSame
    }));
    
    if (isSame) {
      setBillingAddress(prev => ({
        ...prev,
        ...shippingAddress
      }));
    }
  };

  const validateForm = () => {
    // Validate shipping address
    const requiredShippingFields = ['name', 'phone', 'email', 'street', 'city', 'state', 'zipCode'];
    for (const field of requiredShippingFields) {
      if (!shippingAddress[field]?.trim()) {
        return `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    }

    // Validate billing address if different from shipping
    if (!billingAddress.sameAsShipping) {
      const requiredBillingFields = ['name', 'street', 'city', 'state', 'zipCode'];
      for (const field of requiredBillingFields) {
        if (!billingAddress[field]?.trim()) {
          return `Please fill in billing ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
        }
      }
    }

    // Validate payment details for credit card
    if (paymentMethod === 'credit_card') {
      const requiredPaymentFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
      for (const field of requiredPaymentFields) {
        if (!paymentDetails[field]?.trim()) {
          return `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          book: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress,
        billingAddress: billingAddress.sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
        paymentDetails: paymentMethod === 'credit_card' ? paymentDetails : {},
        notes: orderNotes.trim(),
        subtotal,
        tax,
        shipping,
        total
      };

      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      // Error is handled in onError
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h2>Your cart is empty</h2>
          <p className="text-muted">Add some books to your cart before checkout.</p>
          <Button variant="primary" onClick={() => navigate('/books')}>
            Continue Shopping
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Checkout</h1>
      
      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Left Column - Forms */}
          <Col lg={8}>
            {/* Shipping Address */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaMapMarkerAlt className="me-2" />
                  Shipping Address
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={shippingAddress.name}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Street Address *</Form.Label>
                  <Form.Control
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code *</Form.Label>
                      <Form.Control
                        type="text"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleInputChange(e, 'shipping')}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Country *</Form.Label>
                  <Form.Select
                    name="country"
                    value={shippingAddress.country}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    required
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Billing Address */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaUser className="me-2" />
                  Billing Address
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Same as shipping address"
                    checked={billingAddress.sameAsShipping}
                    onChange={handleBillingToggle}
                  />
                </Form.Group>

                {!billingAddress.sameAsShipping && (
                  <div>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={billingAddress.name}
                            onChange={(e) => handleInputChange(e, 'billing')}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Street Address *</Form.Label>
                      <Form.Control
                        type="text"
                        name="street"
                        value={billingAddress.street}
                        onChange={(e) => handleInputChange(e, 'billing')}
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>City *</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={billingAddress.city}
                            onChange={(e) => handleInputChange(e, 'billing')}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>State *</Form.Label>
                          <Form.Control
                            type="text"
                            name="state"
                            value={billingAddress.state}
                            onChange={(e) => handleInputChange(e, 'billing')}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>ZIP Code *</Form.Label>
                          <Form.Control
                            type="text"
                            name="zipCode"
                            value={billingAddress.zipCode}
                            onChange={(e) => handleInputChange(e, 'billing')}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Country *</Form.Label>
                      <Form.Select
                        name="country"
                        value={billingAddress.country}
                        onChange={(e) => handleInputChange(e, 'billing')}
                        required
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Payment Method */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaLock className="me-2" />
                  Payment Method
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label={
                      <div className="d-flex align-items-center">
                        <FaCreditCard className="me-2" />
                        Credit Card
                      </div>
                    }
                  />
                </Form.Group>

                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  label={
                    <div className="d-flex align-items-center">
                      <FaPaypal className="me-2" />
                      PayPal
                    </div>
                  }
                />

                {paymentMethod === 'credit_card' && (
                  <div className="mt-3 p-3 border rounded">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Card Number *</Form.Label>
                          <Form.Control
                            type="text"
                            name="cardNumber"
                            value={paymentDetails.cardNumber}
                            onChange={(e) => handleInputChange(e, 'payment')}
                            placeholder="1234 5678 9012 3456"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Expiry Date *</Form.Label>
                          <Form.Control
                            type="text"
                            name="expiryDate"
                            value={paymentDetails.expiryDate}
                            onChange={(e) => handleInputChange(e, 'payment')}
                            placeholder="MM/YY"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>CVV *</Form.Label>
                          <Form.Control
                            type="text"
                            name="cvv"
                            value={paymentDetails.cvv}
                            onChange={(e) => handleInputChange(e, 'payment')}
                            placeholder="123"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Cardholder Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardholderName"
                        value={paymentDetails.cardholderName}
                        onChange={(e) => handleInputChange(e, 'payment')}
                        placeholder="Name on card"
                        required
                      />
                    </Form.Group>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <Alert variant="info">
                    You will be redirected to PayPal to complete your payment after placing the order.
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Order Notes */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Notes</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add any special instructions or notes for your order..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column - Order Summary */}
          <Col lg={4}>
            <Card className="sticky-top" style={{ top: '100px' }}>
              <Card.Header>
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                {/* Cart Items */}
                <div className="mb-3">
                  {cartItems.map((item, index) => (
                    <div key={index} className="d-flex align-items-center mb-2 pb-2 border-bottom">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        style={{ width: '50px', height: '65px', objectFit: 'cover' }}
                        className="rounded me-2"
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.title}</h6>
                        <small className="text-muted">Qty: {item.quantity}</small>
                      </div>
                      <div className="text-end">
                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <span>Shipping:</span>
                    <span>
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong className="text-primary h5 mb-0">${total.toFixed(2)}</strong>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Processing...
                      </>
                    ) : (
                      `Place Order - $${total.toFixed(2)}`
                    )}
                  </Button>

                  <div className="text-center mt-2">
                    <small className="text-muted">
                      <FaLock className="me-1" />
                      Secure checkout powered by SSL encryption
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Checkout;
