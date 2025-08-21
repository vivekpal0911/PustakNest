import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'border', text = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <Spinner animation={size} role="status">
        <span className="visually-hidden">{text}</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner;
