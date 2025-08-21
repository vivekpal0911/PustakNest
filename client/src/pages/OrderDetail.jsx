import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaArrowLeft, FaTimes, FaEdit, FaCheckCircle, FaTruck, FaClock } from 'react-icons/fa';
import { ordersAPI, formatDate, getOrderStatusColor, getPaymentStatusColor } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch order details
  const { data: orderData, isLoading, error } = useQuery(
    ['order', id],
    () => ordersAPI.getOrderById(id),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  // Cancel order mutation
  const cancelOrderMutation = useMutation(
    (data) => ordersAPI.cancelOrder(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders']);
        queryClient.invalidateQueries(['order', id]);
        setShowCancelModal(false);
        setCancelReason('');
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error('Error cancelling order:', error);
        setIsSubmitting(false);
      }
    }
  );

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await cancelOrderMutation.mutateAsync({ reason: cancelReason.trim() });
    } catch (error) {
      // Error is handled in onError
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-warning" />;
      case 'confirmed':
      case 'processing':
        return <FaCheckCircle className="text-info" />;
      case 'shipped':
        return <FaTruck className="text-primary" />;
      case 'delivered':
        return <FaCheckCircle className="text-success" />;
      case 'cancelled':
        return <FaTimes className="text-danger" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="error-message">
          <h4>Error loading order</h4>
          <p>{error.message}</p>
        </div>
      </Container>
    );
  }

  const order = orderData?.order;

  if (!order) {
    return (
      <Container className="py-5">
        <div className="error-message">
          <h4>Order not found</h4>
          <p>The order you're looking for doesn't exist.</p>
        </div>
      </Container>
    );
  }

  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);

  return (
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <Button
            as={Link}
            to="/orders"
            variant="outline-secondary"
            className="mb-3"
          >
            <FaArrowLeft className="me-2" />
            Back to Orders
          </Button>
          <h1 className="mb-2">Order Details</h1>
          <p className="text-muted">
            Order #{order._id.slice(-8)} • {formatDate(order.createdAt)}
          </p>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Order Status */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                {getStatusIcon(order.status)}
                <span className="ms-3">
                  <Badge bg={getOrderStatusColor(order.status)} size="lg">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </span>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <strong>Payment Status:</strong>
                  <Badge 
                    bg={getPaymentStatusColor(order.paymentStatus)} 
                    className="ms-2"
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div className="col-md-6">
                  <strong>Payment Method:</strong>
                  <span className="ms-2 text-capitalize">
                    {order.paymentMethod.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {order.estimatedDelivery && (
                <div className="mt-3">
                  <strong>Estimated Delivery:</strong>
                  <span className="ms-2">{formatDate(order.estimatedDelivery)}</span>
                </div>
              )}

              {order.deliveredAt && (
                <div className="mt-3">
                  <strong>Delivered On:</strong>
                  <span className="ms-2">{formatDate(order.deliveredAt)}</span>
                </div>
              )}

              {order.cancelledAt && (
                <div className="mt-3">
                  <strong>Cancelled On:</strong>
                  <span className="ms-2">{formatDate(order.cancelledAt)}</span>
                  {order.cancellationReason && (
                    <div className="mt-2">
                      <strong>Reason:</strong>
                      <span className="ms-2">{order.cancellationReason}</span>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Order Items */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body>
              {order.items.map((item, index) => (
                <div key={index} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                  <img
                    src={item.book.coverImage}
                    alt={item.book.title}
                    style={{ width: '80px', height: '100px', objectFit: 'cover' }}
                    className="rounded me-3"
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.book.title}</h6>
                    <p className="text-muted mb-1">by {item.book.author}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Qty: {item.quantity}</span>
                      <span className="text-primary">
                        ${item.price.toFixed(2)} each
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Shipping Address */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Shipping Address</h5>
            </Card.Header>
            <Card.Body>
              <div>
                <strong>{order.shippingAddress.name}</strong><br />
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}<br />
                Phone: {order.shippingAddress.phone}
              </div>
            </Card.Body>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Order Notes</h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-0">{order.notes}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Order Summary */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '100px' }}>
            <Card.Header>
              <h5 className="mb-0">Order Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Shipping:</span>
                <span>
                  {order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}
                </span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">${order.total.toFixed(2)}</strong>
              </div>

              {canCancel && (
                <Button
                  variant="outline-danger"
                  className="w-100 mb-2"
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Order
                </Button>
              )}

              <Button
                as={Link}
                to="/books"
                variant="outline-primary"
                className="w-100"
              >
                Continue Shopping
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cancel Order Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this order?</p>
          <Form.Group>
            <Form.Label>Reason for cancellation (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancelling this order..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Order
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default OrderDetail;
