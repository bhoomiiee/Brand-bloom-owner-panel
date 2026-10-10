import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storesApi, StoreItem } from '../api/stores.api';
import { useAuthStore } from '../../../store/auth.store';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { BotanicalCornerFoliage, BotanicalLogoMark, BotanicalCardAccent } from '../../../components/botanical/BotanicalDecorations';

export const StoreListPage: React.FC = () => {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuthStore();
  const { setActiveStore } = useActiveStoreStore();
  const navigate = useNavigate();

  const fetchStores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await storesApi.list();
      setStores(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your stores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSelectStore = (store: StoreItem) => {
    const storeId = store.id || store._id || '';
    setActiveStore({
      _id: storeId,
      id: storeId,
      name: store.name,
      slug: store.slug,
      businessType: store.businessType,
      address: store.address,
      settings: store.settings,
      membership: store.membership
    });
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bb-warm-offwhite)',
        color: 'var(--bb-dark-text)',
        padding: '40px 24px',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Decorative botanical accent in header corner */}
      <BotanicalCornerFoliage position="top-right" size={240} opacity={0.4} />

      <div style={{ maxWidth: '1040px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '36px',
            borderBottom: '1px solid var(--bb-border)',
            paddingBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <BotanicalLogoMark size={36} />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--bb-burgundy)', letterSpacing: '-0.02em' }}>
                Your BrandBloom Stores
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--bb-muted-text)', margin: '4px 0 0 0' }}>
                Signed in as <strong style={{ color: 'var(--bb-dark-text)' }}>{user?.name || user?.email}</strong>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              Sign Out
            </Button>
            <Button size="sm" onClick={() => navigate('/app/stores/new')}>
              + Create Store
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 0', gap: '16px' }}>
            <Spinner size={32} />
            <span style={{ color: 'var(--bb-muted-text)', fontSize: '14px' }}>Loading authorized stores...</span>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchStores} />
        ) : stores.length === 0 ? (
          <div className="bb-card" style={{ padding: '36px', textAlign: 'center' }}>
            <EmptyState
              title="No Stores Found"
              description="You do not currently belong to any stores. Create your first store to get started as an owner."
              action={
                <Button onClick={() => navigate('/app/stores/new')}>
                  Create Your First Store
                </Button>
              }
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '24px' }}>
            {stores.map((store, idx) => {
              const role = store.membership?.role || 'staff';
              const isOwner = role === 'owner';
              const storeId = store.id || store._id || '';

              return (
                <div
                  key={storeId}
                  className="bb-card bb-card-interactive"
                  style={{
                    padding: '26px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  {/* Subtle leaf accent on the first card */}
                  {idx === 0 && <BotanicalCardAccent position="top-right" size={64} opacity={0.5} />}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--bb-burgundy)' }}>
                        {store.name}
                      </h3>
                      <Badge variant={isOwner ? 'info' : 'warning'}>
                        {role.toUpperCase()}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--bb-muted-text)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
                      <div>
                        <span style={{ color: 'var(--bb-muted-text)' }}>Slug:</span>{' '}
                        <code style={{ color: 'var(--bb-burgundy)', fontWeight: 600, background: 'var(--bb-soft-blush)', padding: '2px 6px', borderRadius: '4px' }}>
                          /{store.slug}
                        </code>
                      </div>
                      <div>
                        <span style={{ color: 'var(--bb-muted-text)' }}>Type:</span> {store.businessType || 'Retail Commerce'}
                      </div>
                      {store.address?.city && (
                        <div>
                          <span style={{ color: 'var(--bb-muted-text)' }}>Location:</span> {store.address.city}, {store.address.country || 'US'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button
                      style={{ width: '100%' }}
                      onClick={() => handleSelectStore(store)}
                    >
                      Enter Dashboard &amp; CRM →
                    </Button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setActiveStore({
                            _id: storeId,
                            id: storeId,
                            name: store.name,
                            slug: store.slug,
                            businessType: store.businessType,
                            address: store.address,
                            settings: store.settings,
                            membership: store.membership
                          });
                          navigate(`/app/stores/${storeId}`);
                        }}
                        style={{
                          flex: 1,
                          padding: '7px 12px',
                          background: 'var(--bb-white)',
                          border: '1px solid var(--bb-border)',
                          borderRadius: '8px',
                          color: 'var(--bb-dark-text)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        ⚙️ Settings
                      </button>
                      {store.slug && (
                        <a
                          href={`/store/${store.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '7px 12px',
                            background: 'var(--bb-soft-blush)',
                            border: '1px solid rgba(189, 124, 145, 0.3)',
                            borderRadius: '8px',
                            color: 'var(--bb-burgundy)',
                            fontSize: '12px',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                          title="View Consumer Storefront"
                        >
                          ↗ Customer Portal
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
