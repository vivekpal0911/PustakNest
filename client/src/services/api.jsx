import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'https://pustaknest.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  getWishlist: () => api.get('/auth/wishlist'),
  toggleWishlist: (bookId) => api.post(`/auth/wishlist/${bookId}`),
  getAllUsers: (params) => api.get('/auth/users', { params }),
  updateUserRole: (userId, role) => api.put(`/auth/users/${userId}/role`, { role }),
  updateUserStatus: (userId, status) => api.put(`/auth/users/${userId}/status`, status),
  getUserAnalytics: () => api.get('/auth/analytics'),
};

// Books API
export const booksAPI = {
  getAllBooks: (params) => api.get('/books', { params }),
  getBookById: (id) => api.get(`/books/${id}`),
  getCategories: () => api.get('/books/categories'),
  getFeaturedBooks: (params) => api.get('/books/featured', { params }),
  getBestsellerBooks: (params) => api.get('/books/bestsellers', { params }),
  createBook: (bookData) => api.post('/books', bookData),
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/books/${id}`),
  addReview: (id, reviewData) => api.post(`/books/${id}/reviews`, reviewData),
  updateReview: (id, reviewId, reviewData) => api.put(`/books/${id}/reviews/${reviewId}`, reviewData),
  deleteReview: (id, reviewId) => api.delete(`/books/${id}/reviews/${reviewId}`),
  getBookAnalytics: () => api.get('/books/admin/analytics'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  getAllOrders: (params) => api.get('/orders/admin/all', { params }),
  updateOrderStatus: (id, statusData) => api.put(`/orders/admin/${id}/status`, statusData),
  updatePaymentStatus: (id, paymentData) => api.put(`/orders/admin/${id}/payment`, paymentData),
  getOrderAnalytics: () => api.get('/orders/admin/analytics'),
  getSalesReport: (params) => api.get('/orders/admin/sales-report', { params }),
};

// Utility functions
export const formatPrice = (price, discount = 0) => {
  if (discount > 0) {
    const discountedPrice = price - (price * discount / 100);
    return {
      original: price.toFixed(2),
      discounted: discountedPrice.toFixed(2),
      discount: discount
    };
  }
  return {
    original: price.toFixed(2),
    discounted: price.toFixed(2),
    discount: 0
  };
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getOrderStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'confirmed': return 'info';
    case 'processing': return 'primary';
    case 'shipped': return 'info';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
};

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'completed': return 'success';
    case 'failed': return 'danger';
    case 'refunded': return 'info';
    default: return 'secondary';
  }
};

// Export the api instance as default
export default api;
