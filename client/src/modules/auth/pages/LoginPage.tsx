import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/app/dashboard');
  };

  const handleForgotPassword = () => {
    navigate('/auth/forgot-password');
  };

  const handleRegister = () => {
    navigate('/auth/register');
  };

  return (
    <LoginForm
      onSuccess={handleSuccess}
      onForgotPassword={handleForgotPassword}
      onRegister={handleRegister}
    />
  );
};

export default LoginPage;
