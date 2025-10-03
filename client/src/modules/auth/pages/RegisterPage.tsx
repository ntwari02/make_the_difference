import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // After successful registration, redirect to login page
    navigate('/auth/login');
  };

  const handleLogin = () => {
    navigate('/auth/login');
  };

  return (
    <RegisterForm
      onSuccess={handleSuccess}
      onLogin={handleLogin}
    />
  );
};

export default RegisterPage;
