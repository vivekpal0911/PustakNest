import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Modal, Alert, Badge, InputGroup } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { booksAPI, formatDate } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminBooks = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    coverImage: '',
    images: []
  });

  // Fetch books
  const { data: booksData, isLoading, error } = useQuery(
    ['admin-books', searchTerm, categoryFilter, stockFilter],
    () => booksAPI.getAllBooks({ 
      search: searchTerm, 
      category: categoryFilter, 
      stock: stockFilter 
    }),
    { staleTime: 2 * 60 * 1000 } // 2 minutes
  );

  // Fetch categories for filter
  const { data: categoriesData } = useQuery(
    ['categories'],
    () => booksAPI.getCategories(),
    { staleTime: 10 * 60 * 1000 } // 10 minutes
  );

  // Add book mutation
  const addBookMutation = useMutation(
    (data) => booksAPI.createBook(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-books']);
        queryClient.invalidateQueries(['books']);
        setShowAddModal(false);
        resetForm();
      },
      onError: (error) => {
        console.error('Error adding book:', error);
      }
    }
  );

  // Delete book mutation
  const deleteBookMutation = useMutation(
    (id) => booksAPI.deleteBook(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-books']);
        queryClient.invalidateQueries(['books']);
        setShowDeleteModal(false);
        setSelectedBook(null);
      },
      onError: (error) => {
        console.error('Error deleting book:', error);
      }
    }
  );

  const resetForm = () => {
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      coverImage: '',
      images: []
    });
  };

  const handleAddBook = async () => {
    try {
      await addBookMutation.mutateAsync({
        ...bookForm,
        price: parseFloat(bookForm.price),
        stock: parseInt(bookForm.stock)
      });
    } catch (error) {
      // Error is handled in onError
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    
    try {
      await deleteBookMutation.mutateAsync(selectedBook._id);
    } catch (error) {
      // Error is handled in onError
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { variant: 'danger', text: 'Out of Stock' };
    if (stock < 10) return { variant: 'warning', text: 'Low Stock' };
    return { variant: 'success', text: 'In Stock' };
  };

  const filteredBooks = booksData?.books || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="error-message">
          <h4>Error loading books</h4>
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
              <h1 className="mb-2">Manage Books</h1>
              <p className="text-muted">Add, edit, and manage your book inventory</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="me-2" />
              Add New Book
            </Button>
          </div>
        </Col>
      </Row>

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
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categoriesData?.categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="">All Stock Levels</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('');
                  setStockFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Books Table */}
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => {
                  const stockStatus = getStockStatus(book.stock);
                  return (
                    <tr key={book._id}>
                      <td>
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          style={{ width: '50px', height: '65px', objectFit: 'cover' }}
                          className="rounded"
                        />
                      </td>
                      <td>
                        <div>
                          <strong>{book.title}</strong>
                          <br />
                          <small className="text-muted">ISBN: {book.isbn}</small>
                        </div>
                      </td>
                      <td>{book.author}</td>
                      <td>
                        <Badge bg="info">{book.category}</Badge>
                      </td>
                      <td>
                        <div>
                          <strong>${book.price.toFixed(2)}</strong>
                          {book.discountedPrice && book.discountedPrice < book.price && (
                            <div>
                              <small className="text-danger">
                                ${book.discountedPrice.toFixed(2)}
                              </small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={stockStatus.variant}>
                          {stockStatus.text}
                        </Badge>
                        <br />
                        <small className="text-muted">{book.stock} units</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{book.rating.toFixed(1)}</span>
                          <div className="text-warning">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{ fontSize: '12px' }}>
                                {i < Math.round(book.rating) ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <small className="text-muted">
                          {book.reviews?.length || 0} reviews
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            as={Link}
                            to={`/books/${book._id}`}
                            title="View"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            as={Link}
                            to={`/admin/books/edit/${book._id}`}
                            title="Edit"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setSelectedBook(book);
                              setShowDeleteModal(true);
                            }}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No books found matching your criteria.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add Book Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={bookForm.title}
                    onChange={handleInputChange}
                    placeholder="Enter book title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Author *</Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={bookForm.author}
                    onChange={handleInputChange}
                    placeholder="Enter author name"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>ISBN *</Form.Label>
                  <Form.Control
                    type="text"
                    name="isbn"
                    value={bookForm.isbn}
                    onChange={handleInputChange}
                    placeholder="Enter ISBN"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="category"
                    value={bookForm.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categoriesData?.categories?.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={bookForm.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={bookForm.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={bookForm.description}
                onChange={handleInputChange}
                placeholder="Enter book description"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cover Image URL *</Form.Label>
              <Form.Control
                type="url"
                name="coverImage"
                value={bookForm.coverImage}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAddBook}
            disabled={addBookMutation.isLoading || !bookForm.title || !bookForm.author}
          >
            {addBookMutation.isLoading ? 'Adding...' : 'Add Book'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Book Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBook && (
            <div>
              <p>Are you sure you want to delete "{selectedBook.title}"?</p>
              <p className="text-danger">This action cannot be undone.</p>
              <div className="d-flex align-items-center">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  style={{ width: '50px', height: '65px', objectFit: 'cover' }}
                  className="rounded me-3"
                />
                <div>
                  <strong>{selectedBook.title}</strong><br />
                  <small className="text-muted">by {selectedBook.author}</small>
                </div>
              </div>
            </div>
          )}
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

export default AdminBooks;
