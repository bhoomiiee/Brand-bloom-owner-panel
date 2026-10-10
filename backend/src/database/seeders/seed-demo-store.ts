import { UserModel } from '../../modules/users/users.model.js';
import { StoreModel } from '../../modules/stores/stores.model.js';
import { StoreMembershipModel } from '../../modules/memberships/memberships.model.js';
import { hashPassword } from '../../shared/security/password.js';

export async function seedDemoStore() {
  let user = await UserModel.findOne({ email: 'owner@brandbloom.test' });
  if (!user) {
    const passwordHash = await hashPassword('Password123!');
    user = await UserModel.create({
      name: 'Bloom Owner',
      email: 'owner@brandbloom.test',
      passwordHash
    });
  }

  let store = await StoreModel.findOne({ slug: 'bloom-boutique' });
  if (!store) {
    store = await StoreModel.create({
      name: 'Bloom Boutique',
      slug: 'bloom-boutique',
      businessType: 'retail',
      createdBy: user._id,
      settings: {
        currency: 'USD',
        timezone: 'America/New_York',
        taxRatePercentage: 8.5
      }
    });

    await StoreMembershipModel.create({
      storeId: store._id,
      userId: user._id,
      role: 'owner',
      status: 'active'
    });
  }

  return { user, store };
}
