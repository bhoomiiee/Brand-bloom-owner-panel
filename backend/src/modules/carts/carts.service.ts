import { CartModel } from './carts.model.js';
import { ProductVariantModel } from '../products/product-variants.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export const cartsService = {
  async getById(cartId: string) {
    return CartModel.findById(cartId);
  },

  async addItem(data: { cartId?: string; storeId: string; variantId: string; quantity: number }) {
    if (!data.quantity || data.quantity < 1) {
      throw new AppError('Quantity must be at least 1', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const variant = await ProductVariantModel.findOne({ _id: data.variantId, storeId: data.storeId });
    if (!variant) {
      throw new AppError('Variant not found in this store', 404, ERROR_CODES.NOT_FOUND);
    }

    let cart = data.cartId ? await CartModel.findById(data.cartId) : null;
    if (!cart) {
      cart = new CartModel({ storeId: data.storeId, items: [] });
    }

    const idx = cart.items.findIndex((i: any) => i.variantId.toString() === data.variantId);
    if (idx >= 0) {
      cart.items[idx].quantity += data.quantity;
      cart.items[idx].priceCents = variant.priceCents;
    } else {
      cart.items.push({ variantId: data.variantId as any, quantity: data.quantity, priceCents: variant.priceCents });
    }
    await cart.save();
    return cart;
  },

  async removeItem(cartId: string, variantId: string) {
    return CartModel.findByIdAndUpdate(
      cartId,
      { $pull: { items: { variantId } } },
      { new: true }
    );
  }
};
