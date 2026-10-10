import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '../api/products.api';

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productsApi.list();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch (err: any) {
      console.error('Failed to delete product', err);
      throw err;
    }
  };

  return { products, isLoading, error, refetch: fetchProducts, deleteProduct };
}
