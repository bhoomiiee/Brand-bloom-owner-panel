import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storesApi, StoreItem } from '../api/stores.api';
import { useAuthStore } from '../../../store/auth.store';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { BotanicalCornerFoliage } from '../../../components/botanical/BotanicalDecorations';

export const StoreOverviewPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [store, setStore] = useState<StoreItem | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit fields
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('UTC');
  const [taxRate, setTaxRate] = useState<number>(0);

  // Staff invitation
  const [staffEmail, setStaffEmail] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { setActiveStore } = useActiveStoreStore();
  const navigate = useNavigate();

  const fetchStoreData = async () => {
    if (!storeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await storesApi.getById(storeId);
      setStore(data);
      setName(data.name);
      setBusinessType(data.businessType || 'retail');
      setStreet(data.address?.street || '');
      setCity(data.address?.city || '');
      setState(data.address?.state || '');
      setPostalCode(data.address?.postalCode || '');
      setCountry(data.address?.country || 'US');
      setCurrency(data.settings?.currency || 'INR');
      setTimezone(data.settings?.timezone || 'UTC');
      setTaxRate(data.settings?.taxRatePercentage || 0);

      // Set active store in zustand
      setActiveStore({
        _id: storeId,
        id: storeId,
        name: data.name,
        slug: data.slug,
        businessType: data.businessType,
        address: data.address,
        settings: data.settings,
        membership: data.membership
      });

      // Fetch store members
      try {
        const memberList = await storesApi.listMembers(storeId);
        setMembers(memberList);
      } catch {
        // Staff may or may not have listMembers access
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load store');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [storeId]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || isUpdating) return;

    setIsUpdating(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const updated = await storesApi.update(storeId, {
        name: name.trim(),
        businessType: businessType.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim()
        },
        settings: {
          currency,
          timezone,
          taxRatePercentage: Number(taxRate)
        }
      });

      setStore((prev) => (prev ? { ...prev, ...updated } : updated));
      setSuccessMessage('Store settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update store settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !staffEmail.trim() || isAddingStaff) return;

    setIsAddingStaff(true);
    setStaffError(null);
    setStaffSuccess(null);

    try {
      const res = await storesApi.addMember(storeId, {
        email: staffEmail.trim(),
        role: 'staff'
      });
      setStaffSuccess(res.message || `Added ${staffEmail.trim()} as staff member!`);
      setStaffEmail('');
      const updatedMembers = await storesApi.listMembers(storeId);
      setMembers(updatedMembers);
      setTimeout(() => setStaffSuccess(null), 6000);
    } catch (err: any) {
      setStaffError(err.message || 'Failed to add staff member');
    } finally {
      setIsAddingStaff(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bb-warm-offwhite)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--bb-muted-text)' }}>
        <Spinner size={24} />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Loading store context & authorization...</span>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bb-warm-offwhite)', padding: '40px 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/app/stores')}
            style={{ background: 'none', border: 'none', color: 'var(--bb-muted-text)', cursor: 'pointer', marginBottom: '16px', fontWeight: 600 }}
          >
            ← Back to Stores
          </button>
          <ErrorState message={error || 'Store not found or access denied'} onRetry={fetchStoreData} />
        </div>
      </div>
    );
  }

  const role = store.membership?.role || 'staff';
  const isOwner = role === 'owner';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bb-warm-offwhite)',
        color: 'var(--bb-dark-text)',
        padding: '36px 24px',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      <BotanicalCornerFoliage position="top-right" size={240} opacity={0.35} />

      <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Navigation & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/app/stores')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--bb-muted-text)',
              cursor: 'pointer',
              padding: 0,
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            ← Back to All Stores
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                const sId = store.id || store._id || '';
                setActiveStore({
                  _id: sId,
                  id: sId,
                  name: store.name,
                  slug: store.slug,
                  businessType: store.businessType,
                  address: store.address,
                  settings: store.settings,
                  membership: store.membership
                });
                navigate('/dashboard');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '9px 20px',
                background: 'var(--bb-burgundy)',
                borderRadius: '10px',
                color: 'var(--bb-white)',
                fontSize: '13.5px',
                fontWeight: 700,
                border: '1px solid var(--bb-burgundy-dark)',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(99, 45, 64, 0.2)'
              }}
            >
              Open Dashboard &amp; CRM →
            </button>
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '9px 16px',
                background: 'var(--bb-soft-blush)',
                borderRadius: '10px',
                color: 'var(--bb-burgundy)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(189, 124, 145, 0.3)'
              }}
            >
              ↗ View Storefront
            </a>
          </div>
        </div>

        {/* Store Title Bar */}
        <div
          className="bb-card"
          style={{
            padding: '28px 32px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: 'var(--bb-burgundy)' }}>
                {store.name}
              </h1>
              <Badge variant={isOwner ? 'info' : 'warning'}>{role.toUpperCase()}</Badge>
            </div>
            <p style={{ color: 'var(--bb-muted-text)', fontSize: '14px', margin: '6px 0 0 0' }}>
              Store Slug:{' '}
              <code style={{ color: 'var(--bb-burgundy)', fontWeight: 600, background: 'var(--bb-soft-blush)', padding: '2px 6px', borderRadius: '4px' }}>
                /{store.slug}
              </code>{' '}
              | Authenticated as <strong style={{ color: 'var(--bb-dark-text)' }}>{user?.email}</strong>
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: '12.5px',
                color: 'var(--bb-muted-text)',
                background: 'var(--bb-warm-offwhite)',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid var(--bb-border)',
                fontWeight: 500
              }}
            >
              ID: {store.id || store._id}
            </span>
          </div>
        </div>

        {successMessage && (
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid #22c55e',
              color: '#166534',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '24px',
              fontWeight: 500
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Store Settings Form */}
        <div className="bb-card" style={{ padding: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--bb-burgundy)' }}>Store Settings</h2>
            {!isOwner && (
              <span style={{ fontSize: '13px', color: '#92400e', background: 'var(--bb-soft-blush)', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>
                Staff Read-Only View
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Store Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
                required
              />
              <Input
                label="Business Type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                disabled={!isOwner}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--bb-border)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--bb-burgundy)', marginBottom: '12px' }}>Address</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input
                  label="Street Address"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  disabled={!isOwner}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!isOwner}
                  />
                  <Input
                    label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={!isOwner}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    disabled={!isOwner}
                  />
                  <Input
                    label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={!isOwner}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderTop: '1px solid var(--bb-border)', paddingTop: '16px' }}>
              <Input
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={!isOwner}
              />
              <Input
                label="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={!isOwner}
              />
              <Input
                label="Tax Rate (%)"
                type="number"
                value={taxRate.toString()}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                disabled={!isOwner}
              />
            </div>

            {isOwner && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button type="submit" isLoading={isUpdating} disabled={isUpdating}>
                  Save Store Settings
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Team & Members Section (Demonstrates Server-Enforced RBAC & Membership) */}
        <div className="bb-card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--bb-burgundy)' }}>Store Members (RBAC)</h2>
          <p style={{ color: 'var(--bb-muted-text)', fontSize: '13px', margin: '0 0 20px 0' }}>
            Store members have scoped access. Owners can manage settings; staff have operational access.
          </p>

          {isOwner && (
            <form
              onSubmit={handleAddStaff}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end',
                marginBottom: '24px',
                padding: '16px',
                background: 'var(--bb-warm-offwhite)',
                borderRadius: '10px',
                border: '1px solid var(--bb-border)'
              }}
            >
              <div style={{ flex: 1 }}>
                <Input
                  label="Add Staff Member by Email"
                  placeholder="colleague@example.com"
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" isLoading={isAddingStaff} disabled={isAddingStaff || !staffEmail.trim()}>
                + Add Staff
              </Button>
            </form>
          )}

          {staffError && (
            <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 16px 0' }}>{staffError}</p>
          )}
          {staffSuccess && (
            <p style={{ color: '#166534', fontSize: '13px', margin: '0 0 16px 0' }}>{staffSuccess}</p>
          )}

          {members.some((m) => m.status === 'invited') && (
            <div
              style={{
                background: 'var(--bb-soft-blush)',
                border: '1px solid rgba(189, 124, 145, 0.4)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '13px',
                color: 'var(--bb-burgundy)',
                lineHeight: 1.5
              }}
            >
              ✉️ <strong>Staff Invitations:</strong> Real invitation emails are dispatched automatically via Resend. You can also copy the direct sign-up link below to share directly with your colleague. Once they register, they will instantly join this store!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.length === 0 ? (
              <p style={{ color: 'var(--bb-muted-text)', fontSize: '14px', margin: 0 }}>No members listed.</p>
            ) : (
              members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--bb-warm-offwhite)',
                    borderRadius: '8px',
                    border: '1px solid var(--bb-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <strong style={{ color: 'var(--bb-dark-text)', fontSize: '14px' }}>{m.user?.name || 'Invited User'}</strong>
                    <span style={{ color: 'var(--bb-muted-text)', fontSize: '13px' }}>({m.user?.email})</span>
                    {m.status === 'invited' && (
                      <span style={{ color: '#b45309', fontSize: '12px', fontStyle: 'italic', fontWeight: 500 }}>
                        (Invitation pending)
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {m.status === 'invited' && (
                      <button
                        type="button"
                        onClick={() => {
                          const inviteUrl = `${window.location.origin}/register?email=${encodeURIComponent(m.user?.email || '')}`;
                          navigator.clipboard.writeText(inviteUrl);
                          setStaffSuccess(`Copied invite registration link for ${m.user?.email}!`);
                          setTimeout(() => setStaffSuccess(null), 4000);
                        }}
                        style={{
                          background: 'var(--bb-white)',
                          border: '1px solid var(--bb-border)',
                          color: 'var(--bb-burgundy)',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Copy direct registration link for this colleague"
                      >
                        📋 Copy Invite Link
                      </button>
                    )}
                    <Badge variant={m.role === 'owner' ? 'success' : m.status === 'invited' ? 'warning' : 'info'}>
                      {m.status === 'invited' ? 'INVITED' : m.role.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
