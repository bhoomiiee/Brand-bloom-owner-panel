import mongoose, { FilterQuery } from 'mongoose';

export function tenantFilter<T>(storeId: string | mongoose.Types.ObjectId, filter: FilterQuery<T> = {}): FilterQuery<T> {
  return {
    ...filter,
    storeId: typeof storeId === 'string' ? new mongoose.Types.ObjectId(storeId) : storeId
  };
}
