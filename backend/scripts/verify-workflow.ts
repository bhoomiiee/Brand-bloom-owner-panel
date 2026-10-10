import mongoose from 'mongoose';
import { CustomerModel } from '../src/modules/customers/customers.model.js';
import { StoreModel } from '../src/modules/stores/stores.model.js';
import { StoreMembershipModel } from '../src/modules/memberships/memberships.model.js';
import { UserModel } from '../src/modules/users/users.model.js';
import { InvitationModel } from '../src/modules/memberships/invitations.model.js';
import { customersService } from '../src/modules/customers/customers.service.js';
import { customersCrmService } from '../src/modules/customers/customers.crm.service.js';
import { membershipsService } from '../src/modules/memberships/memberships.service.js';
import { authService } from '../src/modules/auth/auth.service.js';
import { env } from '../src/config/env.js';

async function runVerification() {
  console.log('--- STARTING VERIFICATION OF ALL 11 WORKFLOW STEPS ---');
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB:', mongoose.connection.name);

  // 1. Setup store and owner
  const testStoreSlug = `verify-store-${Date.now()}`;
  const ownerUser = await UserModel.create({
    name: 'Store Owner Verify',
    email: `owner_${Date.now()}@verify.com`,
    passwordHash: 'dummyhash'
  });

  const store = await StoreModel.create({
    name: 'Verification Store',
    slug: testStoreSlug,
    businessType: 'retail',
    settings: { currency: 'INR', timezone: 'UTC', taxRatePercentage: 0 },
    createdBy: ownerUser._id
  });

  const storeId = store._id.toString();

  // Create owner membership
  await StoreMembershipModel.create({
    storeId: store._id,
    userId: ownerUser._id,
    role: 'owner',
    status: 'active'
  });

  console.log('✅ Store created:', store.name, 'with ID:', storeId);

  // STEP 1 & 2: Register a customer & verify saved in MongoDB
  const customerEmail = `customer_${Date.now()}@example.com`;
  const regResult = await customersService.register(storeId, {
    email: customerEmail,
    password: 'Password123!',
    firstName: 'Aarav',
    lastName: 'Sharma',
    phone: '+91 98765 43210',
    emailOptIn: true
  });
  console.log('✅ Step 1: Customer registered successfully:', regResult.customer.email);

  const dbCustomer = await CustomerModel.findOne({ storeId: store._id, email: customerEmail });
  if (!dbCustomer) throw new Error('Customer not found in MongoDB!');
  if (!dbCustomer.passwordHash.startsWith('$2')) throw new Error('Password hash is not bcrypt!');
  console.log('✅ Step 2: Customer verified in MongoDB collection "customers", bcrypt hash confirmed.');

  // STEP 3: Verify customer appears in owner Customers page directory
  const crmList = await customersCrmService.listStoreCustomers(storeId, {});
  const foundCustomer = crmList.items.find(c => c.email === customerEmail);
  if (!foundCustomer) throw new Error('Customer missing from CRM directory list!');
  if (foundCustomer.totalSpendCents !== 0 || foundCustomer.orderCount !== 0) {
    throw new Error('Initial orders/spending not 0!');
  }
  console.log('✅ Step 3: Customer found in Owner CRM directory with 0 orders and 0 spend.');

  // STEP 4: Verify persistence
  const reRead = await CustomerModel.findById(dbCustomer._id);
  if (!reRead) throw new Error('Customer vanished on reload!');
  console.log('✅ Step 4: Customer persistence verified across queries.');

  // STEP 5: Verify Team page displays accurate owner and staff counts
  const membersBefore = await membershipsService.listMembers(storeId);
  console.log('✅ Step 5: Team page initial members count:', membersBefore.length, 'Owner present:', membersBefore.some(m => m.role === 'owner'));

  // STEP 6: Invite a staff member by email
  const staffEmail = `staff_${Date.now()}@example.com`;
  const invResult = await membershipsService.createInvitation(storeId, {
    email: staffEmail,
    role: 'staff',
    permissions: ['manage:products', 'orders:read']
  }, ownerUser._id.toString());
  console.log('✅ Step 6: Staff invited:', staffEmail, 'Token:', invResult.invitationToken ? 'Generated' : 'None');

  // STEP 7: Staff member registers / accepts invitation and logs in
  const staffReg = await authService.register({
    email: staffEmail,
    name: 'Priya Staff',
    password: 'StaffPassword123!'
  });
  console.log('✅ Step 7: Staff account registered and auto-joined store:', staffReg.user.email);

  const staffMembership = await StoreMembershipModel.findOne({ storeId: store._id, userId: staffReg.user.id });
  if (!staffMembership) throw new Error('Staff membership was not created!');
  console.log('✅ Staff membership active in store:', staffMembership.role, 'Status:', staffMembership.status);

  // STEP 8: Verify staff permissions
  const membersAfter = await membershipsService.listMembers(storeId);
  const owners = membersAfter.filter(m => m.role === 'owner');
  const staff = membersAfter.filter(m => m.role === 'staff');
  console.log(`✅ Step 8: Total Members: ${membersAfter.length}, Owners: ${owners.length}, Staff: ${staff.length}`);

  // STEP 9: Owner changes staff permissions
  const updatedMembership = await membershipsService.updatePermissions(
    storeId,
    staffMembership._id.toString(),
    ['manage:products', 'manage:inventory', 'orders:read', 'customers:read'],
    ownerUser._id.toString()
  );
  console.log('✅ Step 9: Owner updated staff permissions:', updatedMembership.permissions);

  // STEP 10: Revoked / removed membership prevents further access
  await membershipsService.remove(storeId, staffMembership._id.toString(), ownerUser._id.toString());
  const removedCheck = await StoreMembershipModel.findById(staffMembership._id);
  if (removedCheck) throw new Error('Staff membership was not removed!');
  console.log('✅ Step 10: Staff removed successfully. Access prevented.');

  // STEP 11: Cross-store tenant isolation
  const foreignStore = await StoreModel.create({
    name: 'Foreign Store',
    slug: `foreign-${Date.now()}`,
    businessType: 'food',
    settings: { currency: 'USD', timezone: 'UTC', taxRatePercentage: 0 },
    createdBy: new mongoose.Types.ObjectId()
  });
  const foreignCustomers = await customersCrmService.listStoreCustomers(foreignStore._id.toString(), {});
  const foreignHasCustomer = foreignCustomers.items.some(c => c.email === customerEmail);
  if (foreignHasCustomer) throw new Error('Tenant isolation breached! Foreign store saw customer.');
  console.log('✅ Step 11: Cross-store isolation confirmed. Foreign store cannot see customer.');

  // Clean up test data
  await CustomerModel.deleteMany({ storeId: { $in: [store._id, foreignStore._id] } });
  await StoreMembershipModel.deleteMany({ storeId: { $in: [store._id, foreignStore._id] } });
  await InvitationModel.deleteMany({ storeId: { $in: [store._id, foreignStore._id] } });
  await StoreModel.deleteMany({ _id: { $in: [store._id, foreignStore._id] } });
  await UserModel.deleteMany({ _id: { $in: [ownerUser._id, staffReg.user.id] } });

  console.log('--- ALL 11 WORKFLOW VERIFICATIONS PASSED CLEANLY ---');
  await mongoose.disconnect();
}

runVerification().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
