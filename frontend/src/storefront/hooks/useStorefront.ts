import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export function useStorefront(slugOverride?: string) {
  const { storeSlug: paramSlug } = useParams<{ storeSlug?: string }>();
  const storeSlug = slugOverride || paramSlug || 'bloom-boutique';

  const [store, setStore] = useState<any>(null);
  const [themeConfig, setThemeConfig] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetch(`${BASE_URL}/storefront/${storeSlug}/config`).then(r => r.json()),
      fetch(`${BASE_URL}/storefront/${storeSlug}/products`).then(r => r.json())
    ])
      .then(([configRes, productsRes]) => {
        if (!mounted) return;
        if (configRes.success && configRes.data) {
          setStore(configRes.data.store);
          setThemeConfig(configRes.data.themeConfig);
        } else {
          setError(configRes.error?.message || 'Store not found');
        }

        if (productsRes.success && Array.isArray(productsRes.data)) {
          setProducts(productsRes.data);
        } else {
          setProducts([]);
        }
      })
      .catch(err => {
        if (!mounted) return;
        setError(err.message || 'Failed to load storefront');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [storeSlug]);

  return { store, themeConfig, products, isLoading, error, storeSlug };
}
