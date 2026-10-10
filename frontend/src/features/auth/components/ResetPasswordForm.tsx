import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const ResetPasswordForm: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
      <Button type="submit">Update Password</Button>
    </form>
  );
};
