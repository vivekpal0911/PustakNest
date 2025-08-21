import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Badge, InputGroup, Alert } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaEye, FaEdit, FaSearch, FaUserShield, FaUser, FaBan, FaCheck } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { authAPI, formatDate } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [roleUpdate, setRoleUpdate] = useState({
    role: '',
    notes: ''
  });
  
  const [statusUpdate, setStatusUpdate] = useState({
    isActive: true,
    notes: ''
  });

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery(
    ['admin-users', searchTerm, roleFilter, statusFilter],
    () => authAPI.getAllUsers({ 
      search: searchTerm, 
      role: roleFilter, 
      isActive: statusFilter 
    }),
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  );

  // Fetch user analytics
  const { data: analyticsData } = useQuery(
    ['user-analytics'],
    () => authAPI.getUserAnalytics(),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  // Update user role mutation
  const updateRoleMutation = useMutation(
    (data) => authAPI.updateUserRole(selectedUser?._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        queryClient.invalidateQueries(['user-analytics']);
        setShowRoleModal(false);
        setSelectedUser(null);
        setRoleUpdate({ role: '', notes: '' });
      },
      onError: (error) => {
        console.error('Error updating user role:', error);
      }
    }
  );

  // Update user status mutation
  const updateStatusMutation = useMutation(
    (data) => authAPI.updateUserStatus(selectedUser?._id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
        queryClient.invalidateQueries(['user-analytics']);
        setShowStatusModal(false);
        setSelectedUser(null);
        setStatusUpdate({ isActive: true, notes: '' });
      },
      onError: (error) => {
        console.error('Error updating user status:', error);
      }
    }
  );

  const handleRoleUpdate = async () => {
    if (!roleUpdate.role) return;
    
    try {
      await updateRoleMutation.mutateAsync({
        role: roleUpdate.role,
        notes: roleUpdate.notes.trim()
      });
    } catch (error) {
      // Error is handled in onError
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        isActive: statusUpdate.isActive,
        notes: statusUpdate.notes.trim()
      });
    } catch (error) {
      // Error is handled in onError
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="text-danger" />;
      case 'user':
        return <FaUser className="text-primary" />;
      default:
        return <FaUser className="text-secondary" />;
    }
  };

  const getStatusIcon = (isActive) => {
    return isActive ? 
      <FaCheck className="text-success" /> : 
      <FaBan className="text-danger" />;
  };

  const getLastSeen = (lastLogin) => {
    if (!lastLogin) return 'Never';
    
    const now = new Date();
    const lastLoginDate = new Date(lastLogin);
    const diffInHours = Math.floor((now - lastLoginDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return formatDate(lastLogin);
  };

  const filteredUsers = usersData?.users || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="error-message">
          <h4>Error loading users</h4>
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
              <h1 className="mb-2">Manage Users</h1>
              <p className="text-muted">View and manage user accounts and permissions</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" as={Link} to="/admin/dashboard">
                Dashboard
              </Button>
              <Button variant="outline-success">
                Export Users
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
                <h3 className="text-primary">{analyticsData.totalUsers}</h3>
                <p className="mb-0">Total Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{analyticsData.activeUsers}</h3>
                <p className="mb-0">Active Users</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{analyticsData.newUsersThisMonth}</h3>
                <p className="mb-0">New This Month</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">{analyticsData.adminUsers}</h3>
                <p className="mb-0">Admin Users</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Table */}
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Seen</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="rounded-circle"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ 
                                width: '40px', 
                                height: '40px', 
                                backgroundColor: '#e9ecef',
                                color: '#6c757d'
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <br />
                          <small className="text-muted">ID: {user._id.slice(-8)}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <small>{user.email}</small>
                        {user.phone && (
                          <>
                            <br />
                            <small className="text-muted">{user.phone}</small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {getRoleIcon(user.role)}
                        <Badge 
                          bg={user.role === 'admin' ? 'danger' : 'primary'} 
                          className="ms-2"
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {getStatusIcon(user.isActive)}
                        <Badge 
                          bg={user.isActive ? 'success' : 'secondary'} 
                          className="ms-2"
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <small>{getLastSeen(user.lastLogin)}</small>
                    </td>
                    <td>
                      <small>{formatDate(user.createdAt)}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          as={Link}
                          to={`/admin/users/${user._id}`}
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setRoleUpdate({ role: user.role, notes: '' });
                            setShowRoleModal(true);
                          }}
                          title="Change Role"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant={user.isActive ? "outline-danger" : "outline-success"}
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setStatusUpdate({ isActive: !user.isActive, notes: '' });
                            setShowStatusModal(true);
                          }}
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          {user.isActive ? <FaBan /> : <FaCheck />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No users found matching your criteria.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Update Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p><strong>User: {selectedUser.name}</strong></p>
              <p className="text-muted">Email: {selectedUser.email}</p>
              <p className="text-muted">Current Role: {selectedUser.role}</p>
              
              <Form.Group className="mb-3">
                <Form.Label>New Role</Form.Label>
                <Form.Select
                  value={roleUpdate.role}
                  onChange={(e) => setRoleUpdate({ ...roleUpdate, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label>Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={roleUpdate.notes}
                  onChange={(e) => setRoleUpdate({ ...roleUpdate, notes: e.target.value })}
                  placeholder="Add any notes about this role change..."
                />
              </Form.Group>

              <Alert variant="warning" className="mt-3">
                <strong>Warning:</strong> Changing a user's role will affect their access to admin features.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRoleUpdate}
            disabled={updateRoleMutation.isLoading || !roleUpdate.role}
          >
            {updateRoleMutation.isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {statusUpdate.isActive ? 'Activate User' : 'Deactivate User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p><strong>User: {selectedUser.name}</strong></p>
              <p className="text-muted">Email: {selectedUser.email}</p>
              <p className="text-muted">Current Status: {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
              
              <Form.Group>
                <Form.Label>Notes (optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  placeholder="Add any notes about this status change..."
                />
              </Form.Group>

              <Alert variant={statusUpdate.isActive ? "success" : "warning"} className="mt-3">
                {statusUpdate.isActive ? (
                  <>
                    <strong>Activating user:</strong> User will be able to access the platform normally.
                  </>
                ) : (
                  <>
                    <strong>Deactivating user:</strong> User will not be able to log in or access the platform.
                  </>
                )}
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant={statusUpdate.isActive ? "success" : "warning"}
            onClick={handleStatusUpdate}
            disabled={updateStatusMutation.isLoading}
          >
            {updateStatusMutation.isLoading ? 'Updating...' : 
              (statusUpdate.isActive ? 'Activate User' : 'Deactivate User')
            }
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminUsers;
