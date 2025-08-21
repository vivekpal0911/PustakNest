import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaBook, FaUsers, FaShoppingCart, FaDollarSign, FaChartBar, FaCog } from 'react-icons/fa';
import { ordersAPI, booksAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
  // Fetch analytics data
  const { data: orderAnalytics, isLoading: orderLoading } = useQuery(
    'orderAnalytics',
    () => ordersAPI.getOrderAnalytics(),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  const { data: bookAnalytics, isLoading: bookLoading } = useQuery(
    'bookAnalytics',
    () => booksAPI.getBookAnalytics(),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  if (orderLoading || bookLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">Admin Dashboard</h1>
          <p className="text-muted">
            Welcome back! Here's an overview of your bookstore performance.
          </p>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="admin-dashboard-card text-center">
            <Card.Body>
              <FaBook size={40} className="mb-3" />
              <h3>{bookAnalytics?.totalBooks || 0}</h3>
              <p>Total Books</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="admin-dashboard-card text-center">
            <Card.Body>
              <FaUsers size={40} className="mb-3" />
              <h3>{orderAnalytics?.totalOrders || 0}</h3>
              <p>Total Orders</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="admin-dashboard-card text-center">
            <Card.Body>
              <FaShoppingCart size={40} className="mb-3" />
              <h3>{orderAnalytics?.monthlyOrders || 0}</h3>
              <p>Orders This Month</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="admin-dashboard-card text-center">
            <Card.Body>
              <FaDollarSign size={40} className="mb-3" />
              <h3>${(orderAnalytics?.monthlyRevenue || 0).toFixed(2)}</h3>
              <p>Revenue This Month</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Overview */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Revenue Overview</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-primary">${(orderAnalytics?.totalRevenue || 0).toFixed(2)}</h4>
                    <p className="text-muted">Total Revenue</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-success">${(orderAnalytics?.monthlyRevenue || 0).toFixed(2)}</h4>
                    <p className="text-muted">Monthly Revenue</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Book Statistics</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <h4 className="text-info">{bookAnalytics?.totalReviews || 0}</h4>
                <p className="text-muted">Total Reviews</p>
                <h4 className="text-warning">{bookAnalytics?.avgRating?.toFixed(1) || 0}</h4>
                <p className="text-muted">Average Rating</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <Button
                    as={Link}
                    to="/admin/books"
                    variant="outline-primary"
                    className="w-100 btn-custom"
                  >
                    <FaBook className="me-2" />
                    Manage Books
                  </Button>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Button
                    as={Link}
                    to="/admin/orders"
                    variant="outline-success"
                    className="w-100 btn-custom"
                  >
                    <FaShoppingCart className="me-2" />
                    Manage Orders
                  </Button>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Button
                    as={Link}
                    to="/admin/users"
                    variant="outline-info"
                    className="w-100 btn-custom"
                  >
                    <FaUsers className="me-2" />
                    Manage Users
                  </Button>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Button
                    as={Link}
                    to="/admin/analytics"
                    variant="outline-warning"
                    className="w-100 btn-custom"
                  >
                    <FaChartBar className="me-2" />
                    View Analytics
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Orders</h5>
            </Card.Header>
            <Card.Body>
              {orderAnalytics?.recentOrders?.length > 0 ? (
                orderAnalytics.recentOrders.map((order, index) => (
                  <div key={order._id || index} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <strong>{order.user?.name || 'Unknown User'}</strong>
                      <br />
                      <small className="text-muted">
                        Order #{order._id?.slice(-8) || 'N/A'} - ${order.total?.toFixed(2) || 0}
                      </small>
                    </div>
                    <Badge bg={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted">No recent orders</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Categories</h5>
            </Card.Header>
            <Card.Body>
              {bookAnalytics?.categoryStats?.length > 0 ? (
                bookAnalytics.categoryStats.slice(0, 5).map((category, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <span>{category._id}</span>
                    <Badge bg="primary">{category.count} books</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted">No category data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Helper function to get order status color
const getOrderStatusColor = (status) => {
  const statusColors = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'primary',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger'
  };
  return statusColors[status] || 'secondary';
};

export default AdminDashboard;
