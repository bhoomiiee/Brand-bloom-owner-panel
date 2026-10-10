import React from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const StoreProfileForm: React.FC = () => {
  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
      <Input label="Store Name" defaultValue="Bloom Boutique" />
      <Input label="Store URL Slug" defaultValue="bloom-boutique" />
      <Input label="Support Email" defaultValue="support@bloomboutique.test" />
      <Button type="button">Save Settings</Button>
    </form>
  );
};
