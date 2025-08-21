import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified signup form
    navigate('/login', { replace: true });
  }, [navigate]);

  return null; // This component won't render anything
};

export default Register;
