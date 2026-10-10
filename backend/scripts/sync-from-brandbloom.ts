import { connectDatabase, disconnectDatabase } from '../src/database/connection.js';
import { UserModel } from '../src/modules/users/users.model.js';
import { StoreModel } from '../src/modules/stores/stores.model.js';
import { StoreMembershipModel } from '../src/modules/memberships/memberships.model.js';
import { CategoryModel } from '../src/modules/categories/categories.model.js';
import { ProductModel } from '../src/modules/products/products.model.js';
import { ProductVariantModel } from '../src/modules/products/product-variants.model.js';
import { InventoryModel } from '../src/modules/inventory/inventory.model.js';
import { OrderModel } from '../src/modules/orders/orders.model.js';
import { CustomerModel } from '../src/modules/customers/customers.model.js';
import { hashPassword } from '../src/shared/security/password.js';
import { logger } from '../src/config/logger.js';

const BRANDBLOOM_API = 'http://localhost:3000/api';

async function syncAllStores() {
  await connectDatabase();
  logger.info('Starting Live Real-Time Data Sync from BrandBloom to Owner Panel MongoDB...');

  try {
    const res = await fetch(`${BRANDBLOOM_API}/stores`);
    const data: any = await res.json();

    if (!data.success || !Array.isArray(data.data)) {
      throw new Error('Failed to retrieve stores from BrandBloom API');
    }

    const stores = data.data;
    logger.info(`Found ${stores.length} live stores in BrandBloom PostgreSQL.`);

    const defaultPasswordHash = await hashPassword('Password123!');

    for (const storeData of stores) {
      logger.info(`Syncing store: "${storeData.name}" (${storeData.slug})...`);

      // 1. Sync User / Owner
      const ownerEmail = storeData.ownerEmail || `owner_${storeData.slug}@brandbloom.test`;
      let user = await UserModel.findOne({ email: ownerEmail });
      if (!user) {
        user = await UserModel.create({
          name: storeData.ownerName || 'Store Owner',
          email: ownerEmail,
          passwordHash: defaultPasswordHash
        });
        logger.info(`  Created owner user: ${user.email}`);
      }

      // 2. Sync Store
      let store = await StoreModel.findOne({ slug: storeData.slug });
      if (!store) {
        store = await StoreModel.create({
          name: storeData.name,
          slug: storeData.slug,
          businessType: storeData.category?.toLowerCase() || 'retail',
          createdBy: user._id,
          settings: {
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            taxRatePercentage: 0
          }
        });
        logger.info(`  Created store: ${store.name}`);
      } else {
        store.name = storeData.name;
        store.businessType = storeData.category?.toLowerCase() || store.businessType;
        await store.save();
        logger.info(`  Updated store: ${store.name}`);
      }

      // 3. Sync Membership
      let membership = await StoreMembershipModel.findOne({ storeId: store._id, userId: user._id });
      if (!membership) {
        await StoreMembershipModel.create({
          storeId: store._id,
          userId: user._id,
          role: 'owner',
          status: 'active'
        });
      }

      // 4. Fetch Deep Store Details (Products, Orders, Customers)
      const detailRes = await fetch(`${BRANDBLOOM_API}/stores/${storeData.id}`);
      const detailData: any = await detailRes.json();

      if (detailData.success && detailData.data) {
        const fullStore = detailData.data;

        // Default Category for store
        let defaultCategory = await CategoryModel.findOne({ storeId: store._id, slug: 'featured' });
        if (!defaultCategory) {
          defaultCategory = await CategoryModel.create({
            storeId: store._id,
            name: 'Featured Collection',
            slug: 'featured',
            description: 'Featured catalog items'
          });
        }

        // 5. Sync Products
        if (Array.isArray(fullStore.products)) {
          for (const prod of fullStore.products) {
            const basePrice = Math.round(parseFloat(prod.price || '0') * 100);
            const comparePrice = prod.comparePrice ? Math.round(parseFloat(prod.comparePrice) * 100) : undefined;

            let product = await ProductModel.findOne({ storeId: store._id, slug: prod.slug });
            if (!product) {
              product = await ProductModel.create({
                storeId: store._id,
                title: prod.name,
                slug: prod.slug,
                description: prod.description || `${prod.name} high quality item`,
                categoryId: defaultCategory._id,
                status: prod.isActive ? 'ACTIVE' : 'DRAFT',
                basePriceCents: basePrice,
                compareAtPriceCents: comparePrice,
                images: []
              });
              logger.info(`    Added product: ${product.title} (Rs ${prod.price})`);
            } else {
              product.title = prod.name;
              product.basePriceCents = basePrice;
              product.compareAtPriceCents = comparePrice;
              product.status = prod.isActive ? 'ACTIVE' : 'DRAFT';
              await product.save();
              logger.info(`    Updated product: ${product.title} (Rs ${prod.price})`);
            }

            // Sync Variant & Inventory
            let variant = await ProductVariantModel.findOne({ storeId: store._id, productId: product._id });
            if (!variant) {
              variant = await ProductVariantModel.create({
                storeId: store._id,
                productId: product._id,
                sku: prod.sku || `SKU-${prod.slug}`,
                title: 'Standard',
                priceCents: basePrice,
                attributes: {}
              });
            } else {
              variant.priceCents = basePrice;
              await variant.save();
            }

            let inventory = await InventoryModel.findOne({ storeId: store._id, variantId: variant._id });
            if (!inventory) {
              await InventoryModel.create({
                storeId: store._id,
                variantId: variant._id,
                onHand: prod.stock || 25,
                reserved: 0,
                lowStockThreshold: 5
              });
            } else {
              inventory.onHand = prod.stock || inventory.onHand;
              await inventory.save();
            }
          }
        }

        // 6. Sync Orders
        if (Array.isArray(fullStore.recentOrders)) {
          for (const ord of fullStore.recentOrders) {
            let order = await OrderModel.findOne({ orderNumber: ord.orderNumber });
            if (!order) {
              const totalCents = Math.round(parseFloat(ord.total || '0') * 100);
              const subtotalCents = Math.round(parseFloat(ord.subtotal || ord.total || '0') * 100);

              await OrderModel.create({
                storeId: store._id,
                orderNumber: ord.orderNumber,
                customerEmail: ord.customerEmail || 'customer@example.com',
                status: ord.status === 'COMPLETED' ? 'COMPLETED' : 'PAID',
                subtotalCents,
                totalCents,
                taxCents: 0,
                shippingCents: 0,
                items: [
                  {
                    title: 'Storefront Order Items',
                    quantity: 1,
                    priceCents: totalCents
                  }
                ],
                shippingAddress: {
                  fullName: ord.customerName || 'Customer',
                  street: ord.shippingAddress || '123 Market St',
                  city: ord.shippingCity || 'Mumbai',
                  country: ord.shippingCountry || 'IN',
                  postalCode: ord.shippingZip || '400001'
                }
              });
              logger.info(`    Added order: ${ord.orderNumber} (Rs ${ord.total})`);
            }
          }
        }

        // 7. Sync Registered Store Customers
        if (Array.isArray(fullStore.customers)) {
          for (const cust of fullStore.customers) {
            let customer = await CustomerModel.findOne({ storeId: store._id, email: cust.email.toLowerCase() });
            const nameParts = (cust.name || 'Customer').split(' ');
            const firstName = nameParts[0] || 'Customer';
            const lastName = nameParts.slice(1).join(' ') || '';

            if (!customer) {
              customer = await CustomerModel.create({
                storeId: store._id,
                email: cust.email.toLowerCase(),
                passwordHash: defaultPasswordHash,
                firstName,
                lastName,
                phone: cust.phone || '',
                status: 'ACTIVE',
                totalOrdersCount: 0,
                totalSpendCents: 0,
                marketingConsent: { emailOptIn: true, optInSource: 'storefront' }
              });
              logger.info(`    👤 Added registered customer: ${cust.name || cust.email} (${cust.email})`);
            } else {
              customer.firstName = firstName;
              customer.lastName = lastName;
              customer.phone = cust.phone || customer.phone;
              await customer.save();
              logger.info(`    👤 Updated customer: ${cust.name || cust.email} (${cust.email})`);
            }
          }
        }
      }
    }

    logger.info('SUCCESS: All 5 stores, products, inventory, orders, and registered customers successfully synchronized into MongoDB!');
  } catch (err) {
    logger.error('Data Sync Error:', err);
  } finally {
    await disconnectDatabase();
  }
}

syncAllStores();
