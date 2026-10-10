import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressIndicator } from './ProgressIndicator';
import { StoreDetailsStep } from './StoreDetailsStep';
import { LogoUploadStep } from './LogoUploadStep';
import { AddressStep } from './AddressStep';
import { BusinessTypeStep } from './BusinessTypeStep';
import { ReviewStep } from './ReviewStep';
import { useActiveStoreStore } from '../../../store/active-store.store';
import { apiClient } from '../../../lib/api-client';

const DRAFT_KEY = 'sop_onboarding_draft';

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveStore } = useActiveStoreStore();

  const [step, setStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.step || 1;
      }
    } catch {
      // ignore
    }
    return 1;
  });

  const [data, setData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data) return parsed.data;
      }
    } catch {
      // ignore
    }
    return { storeName: '', currency: 'INR', businessType: 'Retail', address: { street: '', city: '', state: '', postalCode: '', country: 'US' } };
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data }));
    } catch {
      // ignore
    }
  }, [step, data]);

  const handleNext = () => setStep(s => Math.min(5, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const handleComplete = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.storeName || 'My Store',
        businessType: (data.businessType || 'retail').toLowerCase(),
        currency: data.currency || 'INR',
        address: data.address || {
          street: '100 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
      };

      const res = await apiClient<{ store: any; role: string }>('/stores', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const store = res.store || res;
      setActiveStore({
        _id: store._id || store.id,
        name: store.name,
        slug: store.slug,
        currency: store.settings?.currency || data.currency || 'INR'
      });

      localStorage.removeItem(DRAFT_KEY);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete store onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', background: '#1e293b', borderRadius: '16px', padding: '36px', border: '1px solid #334155' }}>
      <ProgressIndicator currentStep={step} totalSteps={5} />
      {error && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#7f1d1d', color: '#fecaca', borderRadius: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <div style={{ marginTop: '28px' }}>
        {step === 1 && <StoreDetailsStep data={data} onChange={setData} onNext={handleNext} />}
        {step === 2 && <LogoUploadStep onNext={handleNext} onPrev={handlePrev} />}
        {step === 3 && <BusinessTypeStep data={data} onChange={setData} onNext={handleNext} onPrev={handlePrev} />}
        {step === 4 && <AddressStep onNext={handleNext} onPrev={handlePrev} />}
        {step === 5 && <ReviewStep data={data} onComplete={handleComplete} onPrev={handlePrev} isSubmitting={isSubmitting} />}
      </div>
    </div>
  );
};
