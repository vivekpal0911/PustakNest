import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const WishlistButton = ({ bookId, bookTitle }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Check if book is in wishlist on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      checkWishlistStatus();
    }
  }, [bookId, isAuthenticated, user]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/auth/wishlist/${bookId}/check`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setIsInWishlist(data.isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add books to wishlist');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/wishlist/${bookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.isInWishlist);
        
        if (data.isInWishlist) {
          toast.success(`"${bookTitle}" added to wishlist!`);
        } else {
          toast.success(`"${bookTitle}" removed from wishlist`);
        }
      } else {
        throw new Error('Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline-secondary"
        size="sm"
        onClick={() => toast.error('Please login to add books to wishlist')}
        className="wishlist-btn"
      >
        <FaRegHeart className="me-1" />
        Add to Wishlist
      </Button>
    );
  }

  return (
    <Button
      variant={isInWishlist ? "danger" : "outline-danger"}
      size="sm"
      onClick={toggleWishlist}
      disabled={isLoading}
      className="wishlist-btn"
    >
      {isInWishlist ? (
        <>
          <FaHeart className="me-1" />
          Remove from Wishlist
        </>
      ) : (
        <>
          <FaRegHeart className="me-1" />
          Add to Wishlist
        </>
      )}
    </Button>
  );
};

export default WishlistButton;
