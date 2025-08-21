import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Pagination } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { FaStar, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { booksAPI, formatPrice } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BookCard from '../components/BookCard';

const Books = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: searchParams.get('page') || '1'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Force refresh on mount
  useEffect(() => {
    console.log('🔄 Books component mounted, forcing refresh...');
  }, []);

  // Fetch books
  const { data: booksData, isLoading, error, isError, refetch } = useQuery(
    ['books', filters],
    () => booksAPI.getAllBooks(filters),
    { 
      keepPreviousData: true,
      retry: 2,
      refetchOnMount: true,
      onError: (error) => {
        console.error('Books fetch error:', error);
      }
    }
  );

  // Fetch categories
  const { data: categoriesData, error: categoriesError } = useQuery(
    'categories',
    () => booksAPI.getCategories(),
    { 
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      onError: (error) => {
        console.error('Categories fetch error:', error);
      }
    }
  );

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    // Reset to page 1 when filters change (except for page changes)
    if (name !== 'page') {
      newFilters.page = '1';
    }
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(name, value);
    } else {
      newSearchParams.delete(name);
    }
    // Reset page to 1 when filters change (except for page changes)
    if (name !== 'page') {
      newSearchParams.set('page', '1');
    }
    setSearchParams(newSearchParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (filters.search.trim()) {
      handleFilterChange('search', filters.search.trim());
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: '1'
    };
    setFilters(clearedFilters);
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (page) => {
    handleFilterChange('page', page.toString());
  };

  // Show loading first
  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-3">Loading books...</p>
        </div>
      </Container>
    );
  }

  if (isError || error) {
    return (
      <Container className="py-5">
        <div className="error-message text-center">
          <h4>Error loading books</h4>
          <p className="text-danger">{error?.message || 'An error occurred while fetching books'}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  // Safely access pagination data - Axios response has data nested
  const pagination = booksData?.data?.pagination || {};
  const books = booksData?.data?.books || [];
  const currentPage = parseInt(pagination.page) || 1;
  const totalPages = pagination.pages || 1;
  const totalBooks = pagination.total || 0;
  const limit = pagination.limit || 12;

  // Debug logging
  console.log('🔍 Books Debug:', {
    booksData,
    books: books.length,
    totalBooks,
    isLoading,
    error
  });
  
  // More detailed logging
  if (booksData) {
    console.log('📚 booksData structure:', {
      hasBooks: !!booksData.data?.books,
      booksType: typeof booksData.data?.books,
      booksIsArray: Array.isArray(booksData.data?.books),
      booksLength: booksData.data?.books ? booksData.data.books.length : 'undefined',
      hasPagination: !!booksData.data?.pagination,
      paginationKeys: booksData.data?.pagination ? Object.keys(booksData.data.pagination) : 'undefined',
      fullBooksData: booksData
    });
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-3">Browse Books</h1>
          <p className="text-muted">
            Discover thousands of books across all genres and categories
          </p>
        </Col>
      </Row>

      {/* Search and Filter Bar */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex flex-column flex-md-row gap-3">
            <Form onSubmit={handleSearch} className="flex-grow-1">
              <div className="input-group">
                <Form.Control
                  type="search"
                  placeholder="Search books by title, author, or description..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="search-box"
                />
                <Button type="submit" variant="primary">
                  <FaSearch />
                </Button>
              </div>
            </Form>
            
            <Button
              variant="outline-secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-custom"
            >
              <FaFilter className="me-2" />
              Filters
            </Button>
            
            {(filters.category || filters.minPrice || filters.maxPrice) && (
              <Button
                variant="outline-danger"
                onClick={clearFilters}
                className="btn-custom"
              >
                <FaTimes className="me-2" />
                Clear
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Filters */}
      {showFilters && (
        <Row className="mb-4">
          <Col>
            <Card className="filter-sidebar">
              <Card.Body>
                <h5 className="mb-3">Filters</h5>
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {categoriesData?.categories?.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Min Price</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Min price"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Max Price</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Max price"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sort By</Form.Label>
                      <Form.Select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      >
                        <option value="createdAt">Date Added</option>
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="price">Price</option>
                        <option value="rating.average">Rating</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Sort Order</Form.Label>
                      <Form.Select
                        value={filters.sortOrder}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Results Summary */}
      {booksData && totalBooks > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="text-muted mb-0">
            Showing {((currentPage - 1) * limit) + 1} to{' '}
            {Math.min(currentPage * limit, totalBooks)} of {totalBooks} books
          </p>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="d-md-none"
          >
            <FaFilter className="me-1" /> {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      )}

      {/* Books Grid */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="books-grid">
            {books.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-center">
                <Pagination className="pagination-custom">
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    const isNearCurrent = Math.abs(page - currentPage) <= 2;
                    
                    if (isNearCurrent || page === 1 || page === totalPages) {
                      return (
                        <Pagination.Item
                          key={page}
                          active={isCurrentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    } else if (page === 2 || page === totalPages - 1) {
                      return <Pagination.Ellipsis key={page} />;
                    }
                    return null;
                  })}
                  
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* No Results */}
      {booksData && books.length === 0 && (
        <Row>
          <Col className="text-center py-5">
            <h4>No books found</h4>
            <p className="text-muted">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline-primary" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Books;
