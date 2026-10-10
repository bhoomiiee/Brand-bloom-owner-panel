import { OnboardingDraftModel } from './onboarding.model.js';
import { storesService } from '../stores/stores.service.js';
import { themesService } from '../themes/themes.service.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';

export const onboardingService = {
  async getDraft(userId: string) {
    return OnboardingDraftModel.findOne({ userId });
  },

  async saveDraft(userId: string, data: any) {
    return OnboardingDraftModel.findOneAndUpdate(
      { userId },
      { userId, ...data },
      { upsert: true, new: true }
    );
  },

  async completeOnboarding(userId: string) {
    const draft = await OnboardingDraftModel.findOne({ userId });
    if (!draft || !draft.storeName) {
      throw new AppError('Incomplete onboarding draft. Store name is required.', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const storeResult = await storesService.create(userId, {
      name: draft.storeName,
      currency: draft.currency || 'USD'
    });

    // Initialize storefront config
    const createdStoreId = (storeResult as any).store ? (storeResult as any).store._id.toString() : (storeResult as any)._id.toString();
    await themesService.getStorefrontConfig(createdStoreId);

    await OnboardingDraftModel.deleteOne({ userId });
    return storeResult;
  }
};
