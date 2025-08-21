import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Nav } from 'react-bootstrap';
import { FaUser, FaLock, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    }
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfile()) return;
    
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handlePasswordSave = async () => {
    if (!validatePassword()) return;
    
    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSuccessMessage('Password changed successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Password change error:', error);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      name: user?.name || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || ''
      }
    });
    setErrors({});
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h1 className="mb-4">My Profile</h1>
          
          {successMessage && (
            <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          <Card>
            <Card.Body>
              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Row>
                  <Col md={3}>
                    <Nav variant="pills" className="flex-column">
                      <Nav.Item>
                        <Nav.Link eventKey="profile" className="d-flex align-items-center">
                          <FaUser className="me-2" />
                          Profile
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="password" className="d-flex align-items-center">
                          <FaLock className="me-2" />
                          Password
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Col>
                  
                  <Col md={9}>
                    <Tab.Content>
                      {/* Profile Tab */}
                      <Tab.Pane eventKey="profile">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h4>Personal Information</h4>
                          {!isEditing && (
                            <Button
                              variant="outline-primary"
                              onClick={() => setIsEditing(true)}
                              className="btn-custom"
                            >
                              <FaEdit className="me-2" />
                              Edit Profile
                            </Button>
                          )}
                        </div>

                        <Form>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="name"
                                  value={profileData.name}
                                  onChange={handleProfileChange}
                                  disabled={!isEditing}
                                  className={errors.name ? 'is-invalid' : ''}
                                />
                                {errors.name && (
                                  <Form.Control.Feedback type="invalid">
                                    {errors.name}
                                  </Form.Control.Feedback>
                                )}
                              </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  value={user?.email || ''}
                                  disabled
                                  className="bg-light"
                                />
                                <Form.Text className="text-muted">
                                  Email cannot be changed
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleProfileChange}
                              disabled={!isEditing}
                              placeholder="Enter phone number"
                              className={errors.phone ? 'is-invalid' : ''}
                            />
                            {errors.phone && (
                              <Form.Control.Feedback type="invalid">
                                {errors.phone}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>

                          <h5 className="mb-3">Address</h5>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Street Address</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="address.street"
                                  value={profileData.address.street}
                                  onChange={handleProfileChange}
                                  disabled={!isEditing}
                                  placeholder="Enter street address"
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="address.city"
                                  value={profileData.address.city}
                                  onChange={handleProfileChange}
                                  disabled={!isEditing}
                                  placeholder="Enter city"
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label>State</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="address.state"
                                  value={profileData.address.state}
                                  onChange={handleProfileChange}
                                  disabled={!isEditing}
                                  placeholder="Enter state"
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label>ZIP Code</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="address.zipCode"
                                  value={profileData.address.zipCode}
                                  onChange={handleProfileChange}
                                  disabled={!isEditing}
                                  placeholder="Enter ZIP code"
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label>Country</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="address.country"
                                  value={profileData.address.country}
                                  onChange={handleProfileChange}
                                  disabled={!isEditing}
                                  placeholder="Enter country"
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          {isEditing && (
                            <div className="d-flex gap-2">
                              <Button
                                variant="primary"
                                onClick={handleProfileSave}
                                className="btn-custom btn-custom-primary"
                              >
                                <FaSave className="me-2" />
                                Save Changes
                              </Button>
                              <Button
                                variant="outline-secondary"
                                onClick={cancelEdit}
                                className="btn-custom"
                              >
                                <FaTimes className="me-2" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </Form>
                      </Tab.Pane>

                      {/* Password Tab */}
                      <Tab.Pane eventKey="password">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h4>Change Password</h4>
                          {!isChangingPassword && (
                            <Button
                              variant="outline-primary"
                              onClick={() => setIsChangingPassword(true)}
                              className="btn-custom"
                            >
                              <FaEdit className="me-2" />
                              Change Password
                            </Button>
                          )}
                        </div>

                        {isChangingPassword ? (
                          <Form>
                            <Form.Group className="mb-3">
                              <Form.Label>Current Password</Form.Label>
                              <Form.Control
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                                className={errors.currentPassword ? 'is-invalid' : ''}
                              />
                              {errors.currentPassword && (
                                <Form.Control.Feedback type="invalid">
                                  {errors.currentPassword}
                                </Form.Control.Feedback>
                              )}
                            </Form.Group>

                            <Row>
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>New Password</Form.Label>
                                  <Form.Control
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                    className={errors.newPassword ? 'is-invalid' : ''}
                                  />
                                  {errors.newPassword && (
                                    <Form.Control.Feedback type="invalid">
                                      {errors.newPassword}
                                    </Form.Control.Feedback>
                                  )}
                                </Form.Group>
                              </Col>
                              
                              <Col md={6}>
                                <Form.Group className="mb-3">
                                  <Form.Label>Confirm New Password</Form.Label>
                                  <Form.Control
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    className={errors.confirmPassword ? 'is-invalid' : ''}
                                  />
                                  {errors.confirmPassword && (
                                    <Form.Control.Feedback type="invalid">
                                      {errors.confirmPassword}
                                    </Form.Control.Feedback>
                                  )}
                                </Form.Group>
                              </Col>
                            </Row>

                            <div className="d-flex gap-2">
                              <Button
                                variant="primary"
                                onClick={handlePasswordSave}
                                className="btn-custom btn-custom-primary"
                              >
                                <FaSave className="me-2" />
                                Change Password
                              </Button>
                              <Button
                                variant="outline-secondary"
                                onClick={cancelPasswordChange}
                                className="btn-custom"
                              >
                                <FaTimes className="me-2" />
                                Cancel
                              </Button>
                            </div>
                          </Form>
                        ) : (
                          <div className="text-center py-4">
                            <FaLock size={50} className="text-muted mb-3" />
                            <p className="text-muted">
                              Click the button above to change your password
                            </p>
                          </div>
                        )}
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
