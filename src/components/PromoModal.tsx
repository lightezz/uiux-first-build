import React, { useEffect, useState } from 'react';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  {
    id: 'essential',
    name: 'Essential',
    audience: 'For active chartists',
    monthlyPrice: '$14.95',
    annualPrice: '$7.48',
    discount: '50% OFF',
    specs: ['2 charts per tab', '5 indicators per chart', '20 active price alerts', 'Ad-free market browsing'],
  },
  {
    id: 'plus',
    name: 'Plus',
    audience: 'For multi-market traders',
    monthlyPrice: '$29.95',
    annualPrice: '$11.98',
    discount: '60% OFF',
    specs: ['4 charts per tab', '10 indicators per chart', '100 active price alerts', 'Intraday exotic charts'],
  },
  {
    id: 'premium',
    name: 'Premium',
    audience: 'For institutional workflows',
    monthlyPrice: '$59.95',
    annualPrice: '$11.99',
    discount: '80% OFF',
    highlighted: true,
    specs: ['8 charts per tab', '25 indicators per chart', '400 active price alerts', 'Second-based intervals'],
  },
];

export const PromoModal: React.FC<PromoModalProps> = ({ isOpen, onClose }) => {
  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedPlan(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low p-6 flex flex-col gap-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="promo-title"
              className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface"
            >
              Black Friday Plans
            </h2>
            <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
              Annual memberships include up to 80% off plus an extra month at no cost.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close plans"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-md bg-light-surface-container-low dark:bg-dark-surface-container-high w-fit">
          <button
            type="button"
            onClick={() => setBilling('annual')}
            className={`px-4 py-1.5 rounded-sm font-label text-label-md transition-colors ${
              billing === 'annual'
                ? 'bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface shadow-xs'
                : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
            }`}
          >
            Annual (Up to 80% OFF)
          </button>
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`px-4 py-1.5 rounded-sm font-label text-label-md transition-colors ${
              billing === 'monthly'
                ? 'bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface shadow-xs'
                : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
            }`}
          >
            Monthly
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-md border p-5 flex flex-col justify-between gap-5 ${
                  plan.highlighted
                    ? 'border-tv-blue bg-light-surface-container dark:bg-dark-surface-container'
                    : 'border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
                        {plan.name}
                      </h3>
                      {billing === 'annual' && (
                        <span className="font-label text-label-md text-light-error dark:text-dark-error">
                          {plan.discount}
                        </span>
                      )}
                    </div>
                    <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
                      {plan.audience}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1.5 tabular-nums">
                    <span className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface">
                      {billing === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      / month
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2 pt-2 border-t border-light-outline-variant dark:border-dark-outline-variant">
                    {plan.specs.map((spec) => (
                      <li
                        key={spec}
                        className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface"
                      >
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-2 px-4 rounded-sm font-label text-label-lg transition-colors ${
                    isSelected
                      ? 'bg-bullish text-white'
                      : plan.highlighted
                      ? 'bg-tv-blue text-white hover:opacity-90'
                      : 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-high dark:hover:bg-dark-surface-container-highest'
                  }`}
                >
                  {isSelected ? 'Selected' : `Choose ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
