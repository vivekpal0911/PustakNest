import React, { useState, useEffect, useContext } from 'react';
import { Navbar, Nav, Container, Button, Form, InputGroup, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBookOpen, FaSearch, FaShoppingCart, FaUser, FaSignOutAlt, FaHeart, FaCog, FaHome, FaList, FaClipboardList, FaUserShield } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext.jsx';

const NavigationBar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar 
      expand="lg" 
      style={{ height: '70px' }} 
      className={`navbar-custom ${scrolled ? 'scrolled' : ''}`}
      fixed="top"
    >
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/Pustaknest.png" alt="PustakNest" height="28" className="me-2" />
          <span className="gradient-text fw-bold fs-4">PustakNest</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Navigation Links */}
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`nav-link-custom ${isActive('/') ? 'active' : ''}`}
            >
              <FaHome className="me-1" />
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/books" 
              className={`nav-link-custom ${isActive('/books') ? 'active' : ''}`}
            >
              <FaList className="me-1" />
              Browse
            </Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/wishlist" 
                  className={`nav-link-custom ${isActive('/wishlist') ? 'active' : ''}`}
                >
                  <FaHeart className="me-1" />
                  Wishlist
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/orders" 
                  className={`nav-link-custom ${isActive('/orders') ? 'active' : ''}`}
                >
                  <FaClipboardList className="me-1" />
                  Orders
                </Nav.Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Nav.Link 
                as={Link} 
                to="/admin" 
                className={`nav-link-custom ${isActive('/admin') ? 'active' : ''}`}
              >
                <FaUserShield className="me-1" />
                Admin
              </Nav.Link>
            )}
          </Nav>

          {/* Search Bar */}
          <Form onSubmit={handleSearch} className="d-flex me-3">
            <InputGroup style={{ width: '300px' }}>
              <Form.Control
                type="search"
                placeholder="Search books, authors, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-end-0"
                style={{ borderRadius: '25px 0 0 25px' }}
              />
              <Button 
                type="submit" 
                variant="outline-secondary"
                style={{ borderRadius: '0 25px 25px 0' }}
              >
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>

          {/* Right Side Actions */}
          <Nav className="d-flex align-items-center">
            {/* Cart - Only show if authenticated */}
            {isAuthenticated && (
              <Nav.Link as={Link} to="/cart" className="position-relative me-3">
                <FaShoppingCart size={20} />
                <Badge 
                  bg="danger" 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.6rem' }}
                >
                  0
                </Badge>
              </Nav.Link>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-decoration-none d-flex align-items-center">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '35px', height: '35px' }}>
                    <FaUser className="text-white" size={16} />
                  </div>
                  <span className="text-white fw-bold">{user?.name || 'User'}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="mt-2">
                  <Dropdown.Header>
                    <div className="fw-bold">{user?.name}</div>
                    <small className="text-muted">{user?.email}</small>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" />
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/orders">
                    <FaClipboardList className="me-2" />
                    My Orders
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/wishlist">
                    <FaHeart className="me-2" />
                    Wishlist
                  </Dropdown.Item>
                  {user?.role === 'admin' && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to="/admin">
                        <FaCog className="me-2" />
                        Admin Panel
                      </Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button 
                as={Link} 
                to="/login?mode=login" 
                variant="warning" 
                size="sm"
                className="btn-custom"
              >
                Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
