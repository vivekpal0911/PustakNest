import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FaStar, FaArrowRight, FaBookOpen, FaUsers, FaShippingFast, FaHeart, FaShoppingCart, FaSearch, FaGift, FaAward } from 'react-icons/fa';
import { booksAPI, formatPrice } from '../services/api.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch featured books
  const { data: featuredBooks, isLoading: featuredLoading } = useQuery(
    'featuredBooks',
    () => booksAPI.getFeaturedBooks({ limit: 6 }),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  // Fetch bestseller books
  const { data: bestsellerBooks, isLoading: bestsellerLoading } = useQuery(
    'bestsellerBooks',
    () => booksAPI.getBestsellerBooks({ limit: 6 }),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderBookCard = (book) => {
    const priceInfo = formatPrice(book.price, book.discount);
    
    return (
      <Col key={book._id} lg={4} md={6} className="mb-4">
        <Card className="book-card h-100 card-animated">
          <div className="position-relative">
            <Card.Img 
              variant="top" 
              src={book.coverImage} 
              alt={book.title}
              className="book-cover"
            />
            {book.discount > 0 && (
              <Badge 
                bg="danger" 
                className="position-absolute top-0 end-0 m-2 book-discount"
              >
                -{book.discount}%
              </Badge>
            )}
            <div className="position-absolute top-0 start-0 m-2">
              <FaHeart className="wishlist-heart text-danger" size={20} />
            </div>
          </div>
          <Card.Body className="d-flex flex-column">
            <div className="mb-2">
              {book.category && (
                <Badge bg="secondary" className="me-1 category-badge">
                  {book.category}
                </Badge>
              )}
              {book.featured && (
                <Badge bg="warning" text="dark">
                  <FaAward className="me-1" />
                  Featured
                </Badge>
              )}
            </div>
            <Card.Title className="h6 mb-2 gradient-text">{book.title}</Card.Title>
            <Card.Text className="text-muted small mb-2">
              by {book.author}
            </Card.Text>
            <div className="mb-2">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={i < Math.floor(book.rating.average) ? 'text-warning' : 'text-muted'} 
                  />
                ))}
              </div>
              <small className="text-muted ms-1">
                ({book.rating.count} reviews)
              </small>
            </div>
            <div className="mt-auto">
              <div className="d-flex align-items-center mb-2">
                {book.discount > 0 ? (
                  <>
                    <span className="book-price me-2">${priceInfo.discounted}</span>
                    <span className="book-original-price">${priceInfo.original}</span>
                  </>
                ) : (
                  <span className="book-price">${priceInfo.original}</span>
                )}
              </div>
              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to={`/books/${book._id}`}
                  variant="outline-primary" 
                  size="sm"
                  className="btn-custom"
                >
                  <FaBookOpen className="me-2" />
                  View Details
                </Button>
                <Button 
                  variant="success" 
                  size="sm"
                  className="btn-custom"
                >
                  <FaShoppingCart className="me-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  const heroSlides = [
    {
      title: "Discover Your Next Great Read",
      subtitle: "Explore thousands of books across all genres. From bestsellers to hidden gems, find your perfect story.",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      cta: "Browse Books"
    },
    {
      title: "Exclusive Deals & Discounts",
      subtitle: "Get amazing discounts on bestselling books. Limited time offers on your favorite authors.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      cta: "Shop Deals"
    },
    {
      title: "Join Our Reading Community",
      subtitle: "Connect with fellow book lovers, share reviews, and discover new recommendations.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      cta: "Join Now"
    }
  ];

  return (
    <div>
      {/* Hero Section with Carousel */}
      <section className="hero-section">
        <Carousel 
          activeIndex={currentSlide} 
          onSelect={(selectedIndex) => setCurrentSlide(selectedIndex)}
          interval={5000}
          controls={false}
          indicators={false}
          className="hero-carousel"
        >
          {heroSlides.map((slide, index) => (
            <Carousel.Item key={index}>
              <div className="hero-slide" style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '60vh',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Container>
                  <Row className="align-items-center">
                    <Col lg={6} className="text-center text-lg-start">
                      <h1 className="display-4 fw-bold mb-4">
                        {slide.title}
                      </h1>
                      <p className="lead mb-4 fs-5">
                        {slide.subtitle}
                      </p>
                      <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                        <Button 
                          as={Link} 
                          to="/books" 
                          size="lg" 
                          className="btn-custom btn-custom-primary"
                        >
                          <FaBookOpen className="me-2" />
                          {slide.cta}
                        </Button>
                        <Button 
                          as={Link} 
                          to="/login" 
                          variant="outline-light" 
                          size="lg" 
                          className="btn-custom"
                        >
                          <FaGift className="me-2" />
                          Join Now
                        </Button>
                      </div>
                    </Col>
                    <Col lg={6} className="text-center mt-4 mt-lg-0">
                      <div className="position-relative">
                        <FaBookOpen size={200} className="opacity-25" />
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <FaHeart size={40} className="text-danger" />
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
        
        {/* Carousel Indicators */}
        <div className="carousel-indicators-custom">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="gradient-text mb-3">Why Choose Our Bookstore?</h2>
              <p className="text-muted fs-5">Experience the best in online book shopping</p>
            </Col>
          </Row>
          <Row className="text-center">
            <Col md={3} className="mb-4">
              <div className="p-4">
                <div className="feature-icon mb-3">
                  <FaBookOpen size={60} className="text-primary" />
                </div>
                <h4>Wide Selection</h4>
                <p className="text-muted">
                  Browse through thousands of books across all genres and categories.
                </p>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="p-4">
                <div className="feature-icon mb-3">
                  <FaShippingFast size={60} className="text-primary" />
                </div>
                <h4>Fast Delivery</h4>
                <p className="text-muted">
                  Get your books delivered quickly with our reliable shipping service.
                </p>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="p-4">
                <div className="feature-icon mb-3">
                  <FaUsers size={60} className="text-primary" />
                </div>
                <h4>Community</h4>
                <p className="text-muted">
                  Join our community of book lovers and share your reading experiences.
                </p>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="p-4">
                <div className="feature-icon mb-3">
                  <FaAward size={60} className="text-primary" />
                </div>
                <h4>Quality Guarantee</h4>
                <p className="text-muted">
                  We guarantee the quality of all our books and offer easy returns.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Books Section */}
      <section className="featured-section">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="gradient-text mb-3">Featured Books</h2>
              <p className="text-muted fs-5 mb-0">
                Discover our handpicked selection of exceptional reads
              </p>
            </Col>
          </Row>
          
          {featuredLoading ? (
            <LoadingSpinner />
          ) : (
            <Row>
              {featuredBooks?.books?.map(renderBookCard)}
            </Row>
          )}
          
          <Row className="mt-5">
            <Col className="text-center">
              <Button 
                as={Link} 
                to="/books?featured=true" 
                variant="outline-primary" 
                size="lg"
                className="btn-custom"
              >
                View All Featured Books <FaArrowRight className="ms-2" />
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Bestseller Books Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="gradient-text mb-3">Bestsellers</h2>
              <p className="text-muted fs-5 mb-0">
                The most popular books loved by readers worldwide
              </p>
            </Col>
          </Row>
          
          {bestsellerLoading ? (
            <LoadingSpinner />
          ) : (
            <Row>
              {bestsellerBooks?.books?.map(renderBookCard)}
            </Row>
          )}
          
          <Row className="mt-5">
            <Col className="text-center">
              <Button 
                as={Link} 
                to="/books?bestseller=true" 
                variant="outline-primary" 
                size="lg"
                className="btn-custom"
              >
                View All Bestsellers <FaArrowRight className="ms-2" />
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="py-5" style={{ background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)' }}>
        <Container>
          <Row className="text-center">
            <Col>
              <h2 className="text-white mb-4">Ready to Start Reading?</h2>
              <p className="text-white-50 mb-4 fs-5">
                Join thousands of readers who have already discovered their next favorite book.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Button 
                  as={Link} 
                  to="/login" 
                  size="lg" 
                  variant="light" 
                  className="btn-custom"
                >
                  <FaGift className="me-2" />
                  Get Started Today
                </Button>
                <Button 
                  as={Link} 
                  to="/books" 
                  size="lg" 
                  variant="outline-light" 
                  className="btn-custom"
                >
                  <FaSearch className="me-2" />
                  Explore Books
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Newsletter Section */}
      <section className="py-5 bg-dark text-white">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h3 className="gradient-text">Stay Updated</h3>
              <p className="mb-0">Get the latest book releases and exclusive offers delivered to your inbox.</p>
            </Col>
            <Col lg={6}>
              <div className="d-flex">
                <input 
                  type="email" 
                  className="form-control me-2" 
                  placeholder="Enter your email"
                  style={{ borderRadius: '25px' }}
                />
                <Button variant="primary" className="btn-custom">
                  Subscribe
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
