import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <img src="/Pustaknest.png" alt="PustakNest" height="22" className="me-2" />
              <span className="gradient-text fw-bold fs-5">PustakNest</span>
            </div>
            <p className="text-muted small mt-2 mb-0">
              Your premier destination for discovering amazing stories.
            </p>
          </Col>
          
          <Col md={6} className="text-center text-md-end">
            <div className="d-flex flex-column flex-md-row justify-content-center justify-content-md-end align-items-center gap-3">
              <Link to="/books" className="text-white text-decoration-none small">
                Browse Books
              </Link>
              <Link to="/login" className="text-white text-decoration-none small">
                Login
              </Link>
              <a href="mailto:hello@pustaknest.com" className="text-white text-decoration-none small">
                Contact
              </a>
            </div>
          </Col>
        </Row>
        
        <hr className="my-3" />
        
        <Row className="text-center">
          <Col>
            <small className="text-muted">
              © 2025 PustakNest. Made with <FaHeart className="text-danger" /> for book lovers.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
