import React, { useState } from 'react';
import { DataTable } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

export const MemberTable: React.FC<{
  members: any[];
  onRemove: (id: string) => void;
  onUpdatePermissions?: (id: string, permissions: string[]) => Promise<void>;
}> = ({ members, onRemove, onUpdatePermissions }) => {
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const openPermissionModal = (m: any) => {
    setEditingMember(m);
    setSelectedPermissions(m.permissions || []);
  };

  const handleTogglePermission = (perm: string) => {
    setSelectedPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSavePermissions = async () => {
    if (!editingMember || !onUpdatePermissions) return;
    setIsSaving(true);
    try {
      await onUpdatePermissions(editingMember.id || editingMember._id, selectedPermissions);
      setEditingMember(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Member',
      render: (m: any) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--bb-dark-text)' }}>{m.name || m.userId?.name || 'Store Staff'}</div>
          <div style={{ fontSize: '12px', color: 'var(--bb-muted-text)' }}>{m.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (m: any) => (
        <Badge variant={m.role === 'OWNER' ? 'success' : 'info'}>{m.role}</Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (m: any) => {
        const s = (m.status || 'ACTIVE').toUpperCase();
        const variant = s === 'ACTIVE' ? 'success' : s === 'INVITED' ? 'warning' : 'danger';
        return <Badge variant={variant as any}>{s}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (m: any) => {
        const isOwner = m.role === 'OWNER';
        if (isOwner) {
          return <span style={{ color: 'var(--bb-muted-text)', fontSize: '12px', fontStyle: 'italic' }}>Primary Owner</span>;
        }
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onUpdatePermissions && m.status !== 'invited' && (
               <Button size="sm" variant="secondary" onClick={() => openPermissionModal(m)}>
                 Permissions
               </Button>
            )}
            <Button size="sm" variant="danger" onClick={() => onRemove(m.id || m._id)}>
              Remove
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <>
      <DataTable columns={columns} data={members} />

      {editingMember && (
        <Modal isOpen={!!editingMember} onClose={() => setEditingMember(null)} title={`Permissions: ${editingMember.name || editingMember.email}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--bb-muted-text)', margin: 0 }}>
              Select additional operational permissions granted to this staff member:
            </p>
            {[
              { id: 'manage:products', label: 'Manage Products (Create & Edit Catalog)' },
              { id: 'manage:inventory', label: 'Manage Inventory (Adjust Stock Levels)' },
              { id: 'manage:orders', label: 'Process Orders (Fulfill & Update Orders)' },
              { id: 'customers:read', label: 'View Customers (Access Customer Directory)' },
              { id: 'promotions:manage', label: 'Manage Campaigns & Promotions' }
            ].map(perm => (
              <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--bb-dark-text)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={() => handleTogglePermission(perm.id)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>{perm.label}</span>
              </label>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setEditingMember(null)}>Cancel</Button>
              <Button onClick={handleSavePermissions} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Permissions'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

