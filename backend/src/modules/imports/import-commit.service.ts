import { ImportJobModel } from './imports.model.js';
import { ImportRowErrorModel } from './import-row-error.model.js';
import { importValidationService } from './import-validation.service.js';
import { ProductModel } from '../products/products.model.js';
import { ProductVariantModel } from '../products/product-variants.model.js';
import { InventoryModel } from '../inventory/inventory.model.js';
import { CategoryModel } from '../categories/categories.model.js';
import { slugify } from '../../shared/utils/slug.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export const importCommitService = {
  async executeCommit(jobId: string, storeId: string) {
    const job = await ImportJobModel.findOne({ _id: jobId, storeId });
    if (!job) {
      throw new AppError('Import job not found', 404, ERROR_CODES.NOT_FOUND);
    }
    if (job.status === 'COMPLETED') {
      return {
        jobId: job._id,
        status: job.status,
        totalRows: job.totalRows,
        processedRows: job.processedRows,
        failedRows: job.failedRows
      };
    }

    job.status = 'PROCESSING';
    await job.save();

    // Clear previous row errors for retry idempotency
    await ImportRowErrorModel.deleteMany({ jobId: job._id });

    let committedCount = 0;
    let failedCount = 0;
    const mapping = (job.columnMapping instanceof Map ? Object.fromEntries(job.columnMapping) : job.columnMapping) || {};

    const rows = job.parsedRows || [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNumber = index + 1;

      // Extract mapped values
      const titleKey = mapping.title || 'title';
      const skuKey = mapping.sku || 'sku';
      const priceKey = mapping.price || 'price';
      const descKey = mapping.description || 'description';
      const stockKey = mapping.stock || 'stock';
      const catKey = mapping.category || 'category';

      const title = row[titleKey];
      const rawSku = row[skuKey];
      const price = row[priceKey];
      const description = row[descKey] || '';
      const stock = row[stockKey];
      const categoryName = row[catKey];

      const validation = importValidationService.validateRow({ title, price, stock }, rowNumber);
      if (!validation.isValid) {
        failedCount++;
        await ImportRowErrorModel.create({
          storeId: job.storeId,
          jobId: job._id,
          rowNumber,
          errorMessage: validation.errors.join(', '),
          rowData: row
        });
        continue;
      }

      const priceCents = Math.round(parseFloat(String(price).replace('$', '').trim()) * 100);
      const stockOnHand = stock !== undefined && stock !== '' ? parseInt(String(stock).trim(), 10) : 0;
      const sku = rawSku && String(rawSku).trim()
        ? String(rawSku).trim()
        : `SKU-${Date.now().toString(36).toUpperCase()}-${rowNumber}`;

      // Check for SKU conflict in this store
      const existingSku = await ProductVariantModel.findOne({ storeId: job.storeId, sku });
      if (existingSku) {
        failedCount++;
        await ImportRowErrorModel.create({
          storeId: job.storeId,
          jobId: job._id,
          rowNumber,
          errorMessage: `SKU "${sku}" already exists in store`,
          rowData: row
        });
        continue;
      }

      // Resolve category
      let categoryId = null;
      if (categoryName && String(categoryName).trim()) {
        const catNameClean = String(categoryName).trim();
        let cat = await CategoryModel.findOne({ storeId: job.storeId, name: catNameClean });
        if (!cat) {
          cat = await CategoryModel.create({
            storeId: job.storeId,
            name: catNameClean,
            slug: slugify(catNameClean)
          });
        }
        categoryId = cat._id;
      }

      try {
        const product = await ProductModel.create({
          storeId: job.storeId,
          title: title.trim(),
          slug: slugify(`${title.trim()}-${Date.now().toString(36)}-${rowNumber}`),
          description,
          categoryId,
          basePriceCents: priceCents,
          status: 'ACTIVE'
        });

        const variant = await ProductVariantModel.create({
          storeId: job.storeId,
          productId: product._id,
          sku,
          title: 'Default Variant',
          priceCents
        });

        await InventoryModel.create({
          storeId: job.storeId,
          variantId: variant._id,
          onHand: stockOnHand,
          reserved: 0
        });

        committedCount++;
      } catch (err: any) {
        failedCount++;
        await ImportRowErrorModel.create({
          storeId: job.storeId,
          jobId: job._id,
          rowNumber,
          errorMessage: err.message || 'Database error creating product',
          rowData: row
        });
      }
    }

    job.status = 'COMPLETED';
    job.processedRows = committedCount;
    job.failedRows = failedCount;
    await job.save();

    return {
      jobId: job._id,
      status: job.status,
      totalRows: job.totalRows,
      processedRows: committedCount,
      failedRows: failedCount,
      importedCount: committedCount,
      failedCount: failedCount
    };
  }
};
