import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Register = () => {
  const { openAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    openAuthModal('register');
    navigate('/', { replace: true });
  }, [openAuthModal, navigate]);

  return null;
};
