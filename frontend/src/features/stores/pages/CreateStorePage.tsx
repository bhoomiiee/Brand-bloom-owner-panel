import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storesApi } from '../api/stores.api';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

export const CreateStorePage: React.FC = () => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessType, setBusinessType] = useState('retail');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('UTC');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setActiveStore } = useActiveStoreStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submissions

    if (!name.trim()) {
      setError('Store name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        businessType,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim()
        },
        currency,
        timezone
      };

      const result = await storesApi.create(payload);
      const storeId = result.store.id || result.store._id || '';

      // Persist active store
      setActiveStore({
        _id: storeId,
        id: storeId,
        name: result.store.name,
        slug: result.store.slug,
        businessType: result.store.businessType,
        address: result.store.address,
        settings: result.store.settings,
        membership: {
          id: '',
          role: result.role as 'owner',
          status: 'active'
        }
      });

      // Navigate to store overview
      navigate(`/app/stores/${storeId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create store');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '40px 24px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/app/stores')}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: 0,
            fontSize: '14px',
            marginBottom: '16px'
          }}
        >
          ← Back to Stores
        </button>

        <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '36px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', color: '#ffffff' }}>Create a New Store</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 28px 0' }}>
            Set up your brand and store profile. You will be assigned as the store owner.
          </p>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '20px'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <Input
                label="Store Name *"
                placeholder="e.g., Bloom Apparel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Custom URL Slug (Optional)"
                placeholder="e.g., bloom-apparel (auto-generated if empty)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div>
              <Select
                label="Business Type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                options={[
                  { label: 'Retail & Clothing', value: 'retail' },
                  { label: 'Electronics & Gadgets', value: 'electronics' },
                  { label: 'Beauty & Cosmetics', value: 'beauty' },
                  { label: 'Home & Kitchen', value: 'home' },
                  { label: 'Food & Beverage', value: 'food' },
                  { label: 'Other', value: 'other' }
                ]}
              />
            </div>

            <div style={{ borderTop: '1px solid #334155', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0', marginBottom: '12px' }}>
                Store Address
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input
                  label="Street Address"
                  placeholder="123 Commerce St"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="City"
                    placeholder="New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    label="State / Province"
                    placeholder="NY"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="Postal Code"
                    placeholder="10001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                  <Input
                    label="Country"
                    placeholder="US"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { label: 'INR (₹)', value: 'INR' },
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'EUR (€)', value: 'EUR' },
                  { label: 'GBP (£)', value: 'GBP' },
                  { label: 'CAD ($)', value: 'CAD' }
                ]}
              />
              <Select
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                options={[
                  { label: 'UTC', value: 'UTC' },
                  { label: 'America/New_York (EST)', value: 'America/New_York' },
                  { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
                  { label: 'Europe/London (GMT)', value: 'Europe/London' }
                ]}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Button
                type="button"
                variant="outline"
                style={{ flex: 1 }}
                onClick={() => navigate('/app/stores')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" style={{ flex: 2 }} isLoading={isLoading} disabled={isLoading}>
                Create Store & Establish Ownership
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
