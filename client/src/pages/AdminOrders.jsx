import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Badge, InputGroup } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaEye, FaEdit, FaSearch, FaDownload, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ordersAPI, formatDate, getOrderStatusColor, getPaymentStatusColor } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminOrders = () => {
  const queryClient = useQueryClient();
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  
  const [paymentUpdate, setPaymentUpdate] = useState({
    paymentStatus: '',
    notes: ''
  });

  // Fetch orders
  const { data: ordersData, isLoading, error } = useQuery(
    ['admin-orders', searchTerm, statusFilter, paymentFilter, dateFilter],
    () => ordersAPI.getAllOrders({ 
      search: searchTerm, 
      status: statusFilter, 
      paymentStatus: paymentFilter,
      date: dateFilter
    }),
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  );

  // Fetch order analytics
  const { data: analyticsData } = useQuery(
    ['order-analytics'],
    () => ordersAPI.getOrderAnalytics(),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  // Update order status mutation
  const updateStatusMutation = useMutation(
    (data) => ordersAPI.updateOrderStatus(selectedOrder?._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-orders']);
        queryClient.invalidateQueries(['order-analytics']);
        setShowStatusModal(false);
        setSelectedOrder(null);
        setStatusUpdate({ status: '', notes: '' });
      },
      onError: (error) => {
        console.error('Error updating order status:', error);
      }
    }
  );

  // Update payment status mutation
  const updatePaymentMutation = useMutation(
    (data) => ordersAPI.updatePaymentStatus(selectedOrder?._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-orders']);
        queryClient.invalidateQueries(['order-analytics']);
        setShowPaymentModal(false);
        setSelectedOrder(null);
        setPaymentUpdate({ paymentStatus: '', notes: '' });
      },
      onError: (error) => {
        console.error('Error updating payment status:', error);
      }
    }
  );

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) return;
    
    try {
      await updateStatusMutation.mutateAsync({
        status: statusUpdate.status,
        notes: statusUpdate.notes.trim()
      });
    } catch (error) {
      // Error is handled in onError
    }
  };

  const handlePaymentUpdate = async () => {
    if (!paymentUpdate.paymentStatus) return;
    
    try {
      await updatePaymentMutation.mutateAsync({
        paymentStatus: paymentUpdate.paymentStatus,
        notes: paymentUpdate.notes.trim()
      });
    } catch (error) {
      // Error is handled in onError
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'processing':
        return '⚙️';
      case 'shipped':
        return '📦';
      case 'delivered':
        return '🎉';
      case 'cancelled':
        return '❌';
      default:
        return '❓';
    }
  };

  const getPaymentIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'paid':
        return '✅';
      case 'failed':
        return '❌';
      case 'refunded':
        return '↩️';
      default:
        return '❓';
    }
  };

  const filteredOrders = ordersData?.orders || [];

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

  return (
    <Container className="py-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2">Manage Orders</h1>
              <p className="text-muted">View and manage customer orders</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" as={Link} to="/admin/dashboard">
                <FaChartLine className="me-2" />
                Analytics
              </Button>
              <Button variant="outline-success">
                <FaDownload className="me-2" />
                Export
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Analytics Summary */}
      {analyticsData && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{analyticsData.totalOrders}</h3>
                <p className="mb-0">Total Orders</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{analyticsData.pendingOrders}</h3>
                <p className="mb-0">Pending</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{analyticsData.completedOrders}</h3>
                <p className="mb-0">Completed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">${analyticsData.totalRevenue?.toFixed(2)}</h3>
                <p className="mb-0">Total Revenue</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setPaymentFilter('');
                  setDateFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <div>
                        <strong>#{order._id.slice(-8)}</strong>
                        <br />
                        <small className="text-muted">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{order.user.name}</strong>
                        <br />
                        <small className="text-muted">{order.user.email}</small>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="d-flex align-items-center mb-1">
                            <img
                              src={item.book.coverImage}
                              alt={item.book.title}
                              style={{ width: '30px', height: '40px', objectFit: 'cover' }}
                              className="rounded me-2"
                            />
                            <div className="text-truncate">
                              <small>{item.book.title}</small>
                              <br />
                              <small className="text-muted">Qty: {item.quantity}</small>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <small className="text-muted">
                            +{order.items.length - 2} more
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>${order.total.toFixed(2)}</strong>
                        <br />
                        <small className="text-muted">
                          {order.paymentMethod.replace('_', ' ')}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{getStatusIcon(order.status)}</span>
                        <Badge bg={getOrderStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-2">{getPaymentIcon(order.paymentStatus)}</span>
                        <Badge bg={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div>
                        <small>{formatDate(order.createdAt)}</small>
                        {order.estimatedDelivery && (
                          <>
                            <br />
                            <small className="text-info">
                              Est: {formatDate(order.estimatedDelivery)}
                            </small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as={Link}
                          to={`/admin/orders/${order._id}`}
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusUpdate({ status: order.status, notes: '' });
                            setShowStatusModal(true);
                          }}
                          title="Update Status"
                        >
                          <FaEdit />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No orders found matching your criteria.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <p><strong>Order #{selectedOrder._id.slice(-8)}</strong></p>
              <p className="text-muted">Customer: {selectedOrder.user.name}</p>
              
              <Form.Group className="mb-3">
                <Form.Label>New Status</Form.Label>
                <Form.Select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  placeholder="Add any notes about this status update..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleStatusUpdate}
            disabled={updateStatusMutation.isLoading || !statusUpdate.status}
          >
            {updateStatusMutation.isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Payment Status Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Payment Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <p><strong>Order #{selectedOrder._id.slice(-8)}</strong></p>
              <p className="text-muted">Customer: {selectedOrder.user.name}</p>
              
              <Form.Group className="mb-3">
                <Form.Label>New Payment Status</Form.Label>
                <Form.Select
                  value={paymentUpdate.paymentStatus}
                  onChange={(e) => setPaymentUpdate({ ...paymentUpdate, paymentStatus: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={paymentUpdate.notes}
                  onChange={(e) => setPaymentUpdate({ ...paymentUpdate, notes: e.target.value })}
                  placeholder="Add any notes about this payment update..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePaymentUpdate}
            disabled={updatePaymentMutation.isLoading || !paymentUpdate.paymentStatus}
          >
            {updatePaymentMutation.isLoading ? 'Updating...' : 'Update Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminOrders;
