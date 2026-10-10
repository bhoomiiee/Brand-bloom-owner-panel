import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser, logout: storeLogout } = useAuthStore();

  const login = async (creds: { email: string; password: string }, redirectTo = '/dashboard') => {

    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login(creds);
      setUser(res.user);
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    data: { name?: string; firstName?: string; lastName?: string; email: string; password: string },
    redirectTo = '/app/stores/new'
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.register(data);
      setUser(res.user);
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await storeLogout();
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return { login, register, logout, isLoading, error };
}
