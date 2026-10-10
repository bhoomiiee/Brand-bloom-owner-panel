import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';

export const InviteStaffForm: React.FC<{ onInvite: (data: any) => void }> = ({ onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('STAFF');

  return (
    <form onSubmit={e => { e.preventDefault(); onInvite({ email, role }); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="Staff Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      <Select label="Role" value={role} onChange={e => setRole(e.target.value)}>
        <option value="STAFF">Staff (Orders & Inventory)</option>
        <option value="ADMIN">Admin (Full Catalog & Settings)</option>
      </Select>
      <Button type="submit">Send Invitation</Button>
    </form>
  );
};
