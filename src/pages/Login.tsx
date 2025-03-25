
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAppSelector } from '@/redux/hooks';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // If already authenticated, redirect to returnUrl
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl);
    }
  }, [isAuthenticated, navigate, returnUrl]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <LoginForm returnUrl={returnUrl} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
