import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FaEnvelope, FaBookOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './login.css';   // <-- CSS import yahan hai

const UnifiedSignup = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const modeFromURL = searchParams.get('mode');
  
  const [loginMode, setLoginMode] = useState(modeFromURL === 'signup' ? 'signup' : 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, login } = useAuth();
  const navigate = useNavigate();

  // ✅ Validation methods
  const validateSignup = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handlers
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setIsLoading(true);
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      if (result.success) {
        toast.success('Registration successful! Welcome to PustakNest!');
        navigate('/');
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    try {
      const result = await login(formData.email.trim(), formData.password);
      if (result.success) {
        toast.success('Login successful! Welcome back!');
        navigate('/');
      } else {
        toast.error(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldMap = {
      'signup-name': 'name',
      'signup-email': 'email',
      'signup-password': 'password',
      'signup-confirmPassword': 'confirmPassword',
      'login-email': 'email',
      'login-password': 'password'
    };
    const actualName = fieldMap[name] || name;
    setFormData(prev => ({ ...prev, [actualName]: value }));

    if (errors[actualName]) {
      setErrors(prev => ({ ...prev, [actualName]: '' }));
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={7} lg={6}>
            <Card className="unified-signup-card shadow-lg card-animated fade-in">
              <Card.Body className="p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <img src="/Pustaknest.png" alt="PustakNest" height="28" className="me-2" />
                    <h4 className="gradient-text fw-bold mb-0">PustakNest</h4>
                  </div>
                  <h6 className="fw-bold text-dark mb-2">Hello again! Exciting offer waiting for you</h6>
                </div>

                {/* Toggle Signup/Login */}
                <div className="login-mode-toggle mb-3">
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="loginMode"
                      id="signupMode"
                      checked={loginMode === 'signup'}
                      onChange={() => {
                        setLoginMode('signup');
                        setErrors({});
                        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                      }}
                    />
                    <label className="btn btn-outline-warning" htmlFor="signupMode">
                      <FaEnvelope className="me-1" /> Sign Up
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="loginMode"
                      id="loginMode"
                      checked={loginMode === 'login'}
                      onChange={() => {
                        setLoginMode('login');
                        setErrors({});
                        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                      }}
                    />
                    <label className="btn btn-outline-warning" htmlFor="loginMode">
                      <FaEnvelope className="me-1" /> Login
                    </label>
                  </div>
                </div>

                {/* Form Section */}
                <Row className="align-items-center">
                  <Col lg={4} className="mb-4 mb-lg-0">
                    <div className="text-center">
                      <h6 className="gradient-text mb-2">Welcome to PustakNest</h6>
                      <p className="text-muted small">
                        {loginMode === 'signup'
                          ? 'Join our community of book lovers.'
                          : 'Welcome back! Continue your journey.'}
                      </p>
                      <div className="mt-3">
                        <FaBookOpen size={40} className="text-primary opacity-25 floating" />
                      </div>
                    </div>
                  </Col>

                  <Col lg={8}>
                    {loginMode === 'signup' ? (
                      <Form onSubmit={handleSignup} autoComplete="off">
                        <h6 className="fw-bold mb-3">Create Account</h6>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                type="text"
                                name="signup-name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className={errors.name ? 'is-invalid' : ''}
                                size="sm"
                              />
                              {errors.name && <div className="invalid-feedback d-block small">{errors.name}</div>}
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                type="email"
                                name="signup-email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className={errors.email ? 'is-invalid' : ''}
                                size="sm"
                              />
                              {errors.email && <div className="invalid-feedback d-block small">{errors.email}</div>}
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                type="password"
                                name="signup-password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className={errors.password ? 'is-invalid' : ''}
                                size="sm"
                              />
                              {errors.password && <div className="invalid-feedback d-block small">{errors.password}</div>}
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                type="password"
                                name="signup-confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                className={errors.confirmPassword ? 'is-invalid' : ''}
                                size="sm"
                              />
                              {errors.confirmPassword && (
                                <div className="invalid-feedback d-block small">{errors.confirmPassword}</div>
                              )}
                            </Form.Group>
                          </Col>
                        </Row>

                        <Button type="submit" variant="warning" size="sm" className="w-100 fw-bold" disabled={isLoading}>
                          {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                      </Form>
                    ) : (
                      <Form onSubmit={handleLogin} autoComplete="off">
                        <h6 className="fw-bold mb-3">Login to Your Account</h6>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                type="email"
                                name="login-email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className={errors.email ? 'is-invalid' : ''}
                                size="sm"
                              />
                              {errors.email && <div className="invalid-feedback d-block small">{errors.email}</div>}
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Control
                                type="password"
                                name="login-password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className={errors.password ? 'is-invalid' : ''}
                                size="sm"
                              />
                              {errors.password && <div className="invalid-feedback d-block small">{errors.password}</div>}
                            </Form.Group>
                          </Col>
                        </Row>
                        <Button type="submit" variant="warning" size="sm" className="w-100 fw-bold" disabled={isLoading}>
                          {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                      </Form>
                    )}
                  </Col>
                </Row>

                {/* Footer */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    By Proceeding, I agree to my data being processed as per{' '}
                    <a href="#" className="form-link">Razorpay's Privacy Policy</a>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UnifiedSignup;
