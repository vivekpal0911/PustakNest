import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaEye, FaClock, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ordersAPI, formatDate, getOrderStatusColor } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { data: ordersData, isLoading, error } = useQuery(
    ['orders', currentPage],
    () => ordersAPI.getUserOrders({ page: currentPage, limit: pageSize }),
    { keepPreviousData: true }
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-warning" />;
      case 'confirmed':
      case 'processing':
        return <FaTruck className="text-info" />;
      case 'shipped':
        return <FaTruck className="text-primary" />;
      case 'delivered':
        return <FaCheckCircle className="text-success" />;
      case 'cancelled':
        return <FaTimesCircle className="text-danger" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="error-message">
          <h4>Error loading orders</h4>
          <p>{error.message}</p>
        </div>
      </Container>
    );
  }

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination || {};

  if (orders.length === 0) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <FaClock size={100} className="text-muted mb-4" />
            <h2>No orders yet</h2>
            <p className="text-muted mb-4">
              You haven't placed any orders yet. Start shopping to see your order history here.
            </p>
            <Button 
              as={Link} 
              to="/books" 
              variant="primary" 
              size="lg"
              className="btn-custom btn-custom-primary"
            >
              Browse Books
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
          <h1 className="mb-3">My Orders</h1>
          <p className="text-muted">
            Track your orders and view order history
          </p>
        </Col>
      </Row>

      {/* Orders List */}
      <Row>
        <Col>
          {orders.map((order) => (
            <Card key={order._id} className="order-card mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={3}>
                    <div className="d-flex align-items-center mb-2">
                      {getStatusIcon(order.status)}
                      <span className="ms-2">
                        <Badge bg={getOrderStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </span>
                    </div>
                    <small className="text-muted">
                      Order #{order._id.slice(-8)}
                    </small>
                    <br />
                    <small className="text-muted">
                      {formatDate(order.createdAt)}
                    </small>
                  </Col>
                  
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</strong>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="d-flex align-items-center">
                          <img
                            src={item.book.coverImage}
                            alt={item.book.title}
                            style={{ width: '40px', height: '50px', objectFit: 'cover' }}
                            className="rounded me-2"
                          />
                          <div>
                            <small className="d-block">{item.book.title}</small>
                            <small className="text-muted">Qty: {item.quantity}</small>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <small className="text-muted">
                          +{order.items.length - 3} more
                        </small>
                      )}
                    </div>
                  </Col>
                  
                  <Col md={3} className="text-end">
                    <div className="mb-2">
                      <strong className="text-primary">
                        ${order.total.toFixed(2)}
                      </strong>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">
                        Payment: {order.paymentStatus}
                      </small>
                    </div>
                    <Button
                      as={Link}
                      to={`/orders/${order._id}`}
                      variant="outline-primary"
                      size="sm"
                      className="btn-custom"
                    >
                      <FaEye className="me-2" />
                      View Details
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination className="pagination-custom">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              
              {[...Array(pagination.pages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;
                const isNearCurrent = Math.abs(page - currentPage) <= 2;
                
                if (isNearCurrent || page === 1 || page === pagination.pages) {
                  return (
                    <Pagination.Item
                      key={page}
                      active={isCurrentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                } else if (page === 2 || page === pagination.pages - 1) {
                  return <Pagination.Ellipsis key={page} />;
                }
                return null;
              })}
              
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(pagination.pages)}
                disabled={currentPage === pagination.pages}
              />
            </Pagination>
          </Col>
        </Row>
      )}

      {/* Summary */}
      <Row className="mt-4">
        <Col className="text-center">
          <p className="text-muted">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} orders
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Orders;
