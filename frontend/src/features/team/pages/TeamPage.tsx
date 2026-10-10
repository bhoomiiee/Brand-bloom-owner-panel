import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { MemberTable } from '../components/MemberTable';
import { InviteStaffForm } from '../components/InviteStaffForm';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { teamApi } from '../api/team.api';
import { BotanicalCornerFoliage } from '../../../components/botanical/BotanicalDecorations';

export const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teamApi.list();
      const formatted = (Array.isArray(data) ? data : []).map(m => ({
        ...m,
        id: m.id || m._id,
        name: m.userId?.name || m.name || m.userId?.email?.split('@')[0] || 'Team Member',
        email: m.userId?.email || m.email || 'user@store.internal',
        role: (m.role || 'STAFF').toUpperCase(),
        status: m.status || 'ACTIVE',
        permissions: m.permissions || []
      }));
      setMembers(formatted);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch team members');
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (data: any) => {
    setError(null);
    try {
      await teamApi.invite({
        email: data.email,
        role: (data.role || 'staff').toLowerCase(),
        permissions: data.permissions || []
      });
      setIsOpen(false);
      await fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to invite team member');
    }
  };

  const handleUpdatePermissions = async (id: string, permissions: string[]) => {
    setError(null);
    try {
      await teamApi.updatePermissions(id, permissions);
      await fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to update member permissions');
    }
  };

  const handleRemove = async (id: string) => {
    setError(null);
    try {
      await teamApi.remove(id);
      setMembers(prev => prev.filter(m => (m._id || m.id) !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to remove team member');
    }
  };

  const totalMembers = members.length;
  const ownerCount = members.filter(m => (m.role || '').toUpperCase() === 'OWNER').length;
  const staffCount = members.filter(m => (m.role || '').toUpperCase() !== 'OWNER').length;

  return (
    <div style={{ position: 'relative' }}>
      <BotanicalCornerFoliage position="top-right" size={200} opacity={0.25} />

      <PageHeader
        title="Store Team & Staff"
        subtitle="Manage store memberships, collaborators & RBAC permissions"
        actions={<Button onClick={() => setIsOpen(true)}>Invite Staff</Button>}
      />

      {error && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c', border: '1px solid #ef4444', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="bb-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--bb-muted-text)', textTransform: 'uppercase', marginBottom: '6px' }}>Total Members</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--bb-burgundy)' }}>{totalMembers}</div>
        </div>
        <div className="bb-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--bb-muted-text)', textTransform: 'uppercase', marginBottom: '6px' }}>Owners</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#166534' }}>{ownerCount}</div>
        </div>
        <div className="bb-card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--bb-muted-text)', textTransform: 'uppercase', marginBottom: '6px' }}>Staff</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--bb-dusty-rose)' }}>{staffCount}</div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--bb-muted-text)', padding: '32px', textAlign: 'center' }}>Loading team members...</div>
      ) : members.length === 0 ? (
        <div className="bb-card" style={{ padding: '48px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--bb-burgundy)', marginBottom: '8px', fontSize: '18px', fontWeight: 700 }}>No team members found</h3>
          <p style={{ color: 'var(--bb-muted-text)', margin: 0, fontSize: '14px' }}>Invite staff collaborators with role-based permissions.</p>
        </div>
      ) : (
        <div className="bb-card" style={{ padding: '8px 16px' }}>
          <MemberTable members={members} onRemove={handleRemove} onUpdatePermissions={handleUpdatePermissions} />
        </div>
      )}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Invite Team Member">
        <InviteStaffForm onInvite={handleInvite} />
      </Modal>
    </div>
  );
};
