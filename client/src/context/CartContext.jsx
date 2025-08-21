import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.book._id === action.payload.book._id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.book._id === action.payload.book._id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        
        const newTotal = updatedItems.reduce((sum, item) => {
          const price = item.book.discount > 0 
            ? item.book.price - (item.book.price * item.book.discount / 100)
            : item.book.price;
          return sum + (price * item.quantity);
        }, 0);
        
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount
        };
      } else {
        const newItems = [...state.items, action.payload];
        const newTotal = newItems.reduce((sum, item) => {
          const price = item.book.discount > 0 
            ? item.book.price - (item.book.price * item.book.discount / 100)
            : item.book.price;
          return sum + (price * item.quantity);
        }, 0);
        
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: newItems,
          total: newTotal,
          itemCount: newItemCount
        };
      }

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.book._id !== action.payload);
      const newTotal = filteredItems.reduce((sum, item) => {
        const price = item.book.discount > 0 
          ? item.book.price - (item.book.price * item.book.discount / 100)
          : item.book.price;
        return sum + (price * item.quantity);
      }, 0);
      
      const newItemCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: filteredItems,
        total: newTotal,
        itemCount: newItemCount
      };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.book._id === action.payload.bookId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      const updatedTotal = updatedItems.reduce((sum, item) => {
        const price = item.book.discount > 0 
          ? item.book.price - (item.book.price * item.book.discount / 100)
          : item.book.price;
        return sum + (price * item.quantity);
      }, 0);
      
      const updatedItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: updatedItems,
        total: updatedTotal,
        itemCount: updatedItemCount
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items || [],
        total: action.payload.total || 0,
        itemCount: action.payload.itemCount || 0
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      total: state.total,
      itemCount: state.itemCount
    }));
  }, [state.items, state.total, state.itemCount]);

  // Add item to cart
  const addToCart = (book, quantity = 1) => {
    // Check if book is already in cart
    const existingItem = state.items.find(item => item.book._id === book._id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      // Check stock availability
      if (newQuantity > book.stock) {
        toast.error(`Only ${book.stock} copies available in stock`);
        return false;
      }
      
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { bookId: book._id, quantity: newQuantity }
      });
      
      toast.success(`Updated quantity for ${book.title}`);
    } else {
      // Check stock availability
      if (quantity > book.stock) {
        toast.error(`Only ${book.stock} copies available in stock`);
        return false;
      }
      
      dispatch({
        type: 'ADD_ITEM',
        payload: { book, quantity }
      });
      
      toast.success(`${book.title} added to cart`);
    }
    
    return true;
  };

  // Remove item from cart
  const removeFromCart = (bookId) => {
    const item = state.items.find(item => item.book._id === bookId);
    if (item) {
      dispatch({ type: 'REMOVE_ITEM', payload: bookId });
      toast.success(`${item.book.title} removed from cart`);
    }
  };

  // Update item quantity
  const updateQuantity = (bookId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }
    
    const item = state.items.find(item => item.book._id === bookId);
    if (item && quantity > item.book.stock) {
      toast.error(`Only ${item.book.stock} copies available in stock`);
      return false;
    }
    
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { bookId, quantity }
    });
    
    return true;
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };

  // Get cart item by book ID
  const getCartItem = (bookId) => {
    return state.items.find(item => item.book._id === bookId);
  };

  // Check if book is in cart
  const isInCart = (bookId) => {
    return state.items.some(item => item.book._id === bookId);
  };

  // Get cart summary
  const getCartSummary = () => {
    const subtotal = state.total;
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const total = subtotal + tax + shipping;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItem,
    isInCart,
    getCartSummary
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
