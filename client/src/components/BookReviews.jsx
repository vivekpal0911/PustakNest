import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Rating, Alert, Badge } from 'react-bootstrap';
import { FaStar, FaUser, FaCalendar, FaThumbsUp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const BookReviews = ({ bookId, bookTitle }) => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user, isAuthenticated } = useState();

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to add a review');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/books/${bookId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Review added successfully!');
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
      } else {
        throw new Error('Failed to add review');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Failed to add review');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="book-reviews">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Reviews & Ratings</h4>
        <div className="d-flex align-items-center">
          <div className="me-3">
            <div className="d-flex align-items-center">
              <FaStar className="text-warning me-1" />
              <span className="fw-bold">{averageRating.toFixed(1)}</span>
              <span className="text-muted ms-1">({reviews.length} reviews)</span>
            </div>
          </div>
          {isAuthenticated && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              Write a Review
            </Button>
          )}
        </div>
      </div>

      {/* Add Review Form */}
      {showReviewForm && (
        <Card className="mb-4">
          <Card.Body>
            <h6>Write Your Review</h6>
            <Form onSubmit={handleSubmitReview}>
              <Form.Group className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div className="d-flex align-items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`star-rating ${star <= newReview.rating ? 'text-warning' : 'text-muted'}`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                    />
                  ))}
                  <span className="ms-2">{newReview.rating}/5</span>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your thoughts about this book..."
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  {newReview.comment.length}/500 characters
                </Form.Text>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline-secondary"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map((review) => (
            <Card key={review._id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center">
                    <FaUser className="text-muted me-2" />
                    <span className="fw-bold">{review.user?.name || 'Anonymous'}</span>
                    <Badge bg="secondary" className="ms-2">{review.user?.role || 'user'}</Badge>
                  </div>
                  <div className="text-muted">
                    <FaCalendar className="me-1" />
                    {formatDate(review.date)}
                  </div>
                </div>
                
                <div className="mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={star <= review.rating ? 'text-warning' : 'text-muted'}
                      size="sm"
                    />
                  ))}
                  <span className="ms-2 fw-bold">{review.rating}/5</span>
                </div>
                
                <p className="mb-2">{review.comment}</p>
                
                <div className="d-flex align-items-center text-muted">
                  <FaThumbsUp className="me-1" />
                  <small>Helpful</small>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Alert variant="info">
          No reviews yet. Be the first to review "{bookTitle}"!
        </Alert>
      )}
    </div>
  );
};

export default BookReviews;
