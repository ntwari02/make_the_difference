import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // After successful login, check user role and redirect accordingly
    const userStr = localStorage.getItem('user') || localStorage.getItem('user_data');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Redirect based on role
        if (user.role === 'dealer' || user.role === 'admin') {
          navigate('/dealer/dashboard');
        } else if (user.role === 'student') {
          navigate('/'); // Will add student dashboard later
        } else if (user.role === 'admin') {
          navigate('/'); // Will add admin dashboard later
        } else {
          navigate('/');
        }
      } catch {
        navigate('/');
      }
    } else {
      navigate('/');
    }
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
