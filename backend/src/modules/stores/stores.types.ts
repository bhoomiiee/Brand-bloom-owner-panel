import { IStoreAddress, IStoreSettings } from './stores.model.js';

export interface CreateStoreDTO {
  name: string;
  slug?: string;
  businessType?: string;
  address?: IStoreAddress;
  logoUrl?: string;
  currency?: string;
  timezone?: string;
}

export interface UpdateStoreDTO {
  name?: string;
  businessType?: string;
  address?: Partial<IStoreAddress>;
  logoUrl?: string;
  settings?: Partial<IStoreSettings>;
}

export interface AddMemberDTO {
  email: string;
  role?: string; // Enforce only staff can be added; never allow arbitrary owner creation
}

