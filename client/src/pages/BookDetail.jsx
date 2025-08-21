import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Modal, Tabs, Tab } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaStar, FaHeart, FaShoppingCart, FaShare, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { booksAPI, ordersAPI, formatDate } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch book details
  const { data: bookData, isLoading, error } = useQuery(
    ['book', id],
    () => booksAPI.getBookById(id),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  // Add review mutation
  const addReviewMutation = useMutation(
    (data) => booksAPI.addReview(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['book', id]);
        queryClient.invalidateQueries(['books']);
        setShowReviewModal(false);
        setReviewData({ rating: 5, comment: '' });
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error('Error adding review:', error);
        setIsSubmitting(false);
      }
    }
  );

  // Delete book mutation (admin only)
  const deleteBookMutation = useMutation(
    () => booksAPI.deleteBook(id),
    {
      onSuccess: () => {
        navigate('/admin/books');
      },
      onError: (error) => {
        console.error('Error deleting book:', error);
      }
    }
  );

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (bookData.book.stock < quantity) {
      alert('Not enough stock available');
      return;
    }
    
    addToCart({
      _id: bookData.book._id,
      title: bookData.book.title,
      coverImage: bookData.book.coverImage,
      price: bookData.book.discountedPrice || bookData.book.price,
      stock: bookData.book.stock
    }, quantity);
  };

  const handleAddReview = async () => {
    if (!reviewData.comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addReviewMutation.mutateAsync({
        rating: reviewData.rating,
        comment: reviewData.comment.trim()
      });
    } catch (error) {
      // Error is handled in onError
    }
  };

  const handleDeleteBook = async () => {
    try {
      await deleteBookMutation.mutateAsync();
    } catch (error) {
      // Error is handled in onError
    }
  };

  const isInWishlist = user?.wishlist?.includes(id);
  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="error-message">
          <h4>Error loading book</h4>
          <p>{error.message}</p>
        </div>
      </Container>
    );
  }

  const book = bookData?.book;

  if (!book) {
    return (
      <Container className="py-5">
        <div className="error-message">
          <h4>Book not found</h4>
          <p>The book you're looking for doesn't exist.</p>
        </div>
      </Container>
    );
  }

  const hasDiscount = book.discountedPrice && book.discountedPrice < book.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((book.price - book.discountedPrice) / book.price) * 100)
    : 0;

  return (
    <Container className="py-5">
      <Row>
        {/* Book Images */}
        <Col lg={6} className="mb-4">
          <div className="text-center">
            <img
              src={book.images?.[selectedImage] || book.coverImage}
              alt={book.title}
              className="img-fluid rounded shadow"
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
            
            {/* Thumbnail Images */}
            {book.images && book.images.length > 1 && (
              <div className="d-flex justify-content-center mt-3 gap-2">
                {book.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${book.title} ${index + 1}`}
                    className={`img-thumbnail cursor-pointer ${selectedImage === index ? 'border-primary' : ''}`}
                    style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </Col>

        {/* Book Information */}
        <Col lg={6}>
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h1 className="h2 mb-0">{book.title}</h1>
              {isAdmin && (
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/admin/books/edit/${id}`)}
                  >
                    <FaEdit className="me-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <FaTrash className="me-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            
            <p className="text-muted mb-2">by {book.author}</p>
            
            {/* Rating */}
            <div className="d-flex align-items-center mb-3">
              <div className="d-flex align-items-center me-3">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(book.rating) ? 'text-warning' : 'text-muted'}
                  />
                ))}
                <span className="ms-2 text-muted">({book.rating.toFixed(1)})</span>
              </div>
              <Badge bg="secondary" className="me-2">
                {book.reviews?.length || 0} reviews
              </Badge>
              <Badge bg="info">{book.category}</Badge>
            </div>

            {/* Price */}
            <div className="mb-3">
              {hasDiscount ? (
                <div>
                  <span className="h3 text-primary me-2">
                    ${book.discountedPrice.toFixed(2)}
                  </span>
                  <span className="h5 text-muted text-decoration-line-through me-2">
                    ${book.price.toFixed(2)}
                  </span>
                  <Badge bg="danger">{discountPercentage}% OFF</Badge>
                </div>
              ) : (
                <span className="h3 text-primary">${book.price.toFixed(2)}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-3">
              {book.stock > 0 ? (
                <Badge bg="success" className="me-2">
                  In Stock ({book.stock} available)
                </Badge>
              ) : (
                <Badge bg="danger">Out of Stock</Badge>
              )}
            </div>

            {/* ISBN */}
            <p className="text-muted mb-3">
              <strong>ISBN:</strong> {book.isbn}
            </p>

            {/* Description */}
            <p className="mb-4">{book.description}</p>

            {/* Actions */}
            <div className="d-flex gap-2 mb-4">
              {book.stock > 0 && (
                <>
                  <Form.Control
                    type="number"
                    min="1"
                    max={book.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    style={{ width: '80px' }}
                    className="me-2"
                  />
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAddToCart}
                    className="flex-grow-1"
                  >
                    <FaShoppingCart className="me-2" />
                    Add to Cart
                  </Button>
                </>
              )}
              
              <Button
                variant="outline-secondary"
                size="lg"
                onClick={() => navigate('/wishlist')}
              >
                <FaHeart className="me-2" />
                Wishlist
              </Button>
            </div>

            {/* Share */}
            <div className="d-flex align-items-center text-muted">
              <FaShare className="me-2" />
              <small>Share this book</small>
            </div>
          </div>
        </Col>
      </Row>

      {/* Tabs for Additional Information */}
      <Row className="mt-5">
        <Col>
          <Tabs defaultActiveKey="reviews" className="mb-4">
            <Tab eventKey="reviews" title="Reviews">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Customer Reviews</h4>
                {isAuthenticated && (
                  <Button
                    variant="primary"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Write a Review
                  </Button>
                )}
              </div>

              {book.reviews && book.reviews.length > 0 ? (
                <div>
                  {book.reviews.map((review, index) => (
                    <Card key={index} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <strong>{review.user.name}</strong>
                            <div className="d-flex align-items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={i < review.rating ? 'text-warning' : 'text-muted'}
                                  size="14"
                                />
                              ))}
                            </div>
                          </div>
                          <small className="text-muted">
                            {formatDate(review.createdAt)}
                          </small>
                        </div>
                        <p className="mb-0">{review.comment}</p>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert variant="info">
                  No reviews yet. Be the first to review this book!
                </Alert>
              )}
            </Tab>

            <Tab eventKey="details" title="Book Details">
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Title:</strong> {book.title}</p>
                      <p><strong>Author:</strong> {book.author}</p>
                      <p><strong>ISBN:</strong> {book.isbn}</p>
                      <p><strong>Category:</strong> {book.category}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Price:</strong> ${book.price.toFixed(2)}</p>
                      <p><strong>Stock:</strong> {book.stock}</p>
                      <p><strong>Rating:</strong> {book.rating.toFixed(1)}/5</p>
                      <p><strong>Published:</strong> {book.publishedAt ? formatDate(book.publishedAt) : 'N/A'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Add Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`cursor-pointer ${star <= reviewData.rating ? 'text-warning' : 'text-muted'}`}
                    size="24"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                  />
                ))}
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="Share your thoughts about this book..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddReview}
            disabled={isSubmitting || !reviewData.comment.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Book Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete "{book.title}"?</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteBook}
            disabled={deleteBookMutation.isLoading}
          >
            {deleteBookMutation.isLoading ? 'Deleting...' : 'Delete Book'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookDetail;
