import React from 'react';
import { LOCALES } from '../data/marketsData';

interface FooterProps {
  locale: string;
  onNavigateSection: (sectionId: string) => void;
  onOpenAllModal: (kind: 'indices' | 'volume' | 'volatile' | 'companies' | 'crypto') => void;
}

export const Footer: React.FC<FooterProps> = ({
  locale,
  onNavigateSection,
  onOpenAllModal,
}) => {
  const activeLocaleLabel = LOCALES.find((l) => l.code === locale)?.label || 'English';

  return (
    <footer className="border-t border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface mt-section">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-page-margin py-section flex flex-col gap-gutter-xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-gutter-xl">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-gutter-md">
            <span className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
              TradingView
            </span>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Look first / Then leap.
            </p>
          </div>

          <div className="flex flex-col gap-gutter-sm">
            <h4 className="font-label text-label-md uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
              More Than A Product
            </h4>
            <button
              type="button"
              onClick={() => onNavigateSection('section-indices')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Supercharts
            </button>
            <button
              type="button"
              onClick={() => onOpenAllModal('volume')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Screeners
            </button>
            <button
              type="button"
              onClick={() => onOpenAllModal('companies')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Heatmaps
            </button>
            <button
              type="button"
              onClick={() => onOpenAllModal('indices')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Economic Calendar
            </button>
          </div>

          <div className="flex flex-col gap-gutter-sm">
            <h4 className="font-label text-label-md uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
              About Company
            </h4>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Who we are
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('section-community-trends')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Blog
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('section-world-stocks')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Careers
            </button>
          </div>

          <div className="flex flex-col gap-gutter-sm">
            <h4 className="font-label text-label-md uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Community
            </h4>
            <button
              type="button"
              onClick={() => onNavigateSection('section-community-trends')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Social network
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('section-community-trends')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Trading ideas
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('section-indices')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Pine Script
            </button>
          </div>

          <div className="flex flex-col gap-gutter-sm">
            <h4 className="font-label text-label-md uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Business Solutions
            </h4>
            <button
              type="button"
              onClick={() => onNavigateSection('section-indices')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Widgets
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection('section-indices')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Charting libraries
            </button>
            <button
              type="button"
              onClick={() => onOpenAllModal('crypto')}
              className="text-left font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors"
            >
              Lightweight Charts
            </button>
          </div>
        </div>

        <div className="pt-gutter-lg border-t border-light-outline-variant dark:border-dark-outline-variant flex flex-wrap items-center justify-between gap-gutter-md">
          <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Market data provided by ICE Data Services &amp; FactSet. © 2026 TradingView, Inc.
          </span>
          <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {activeLocaleLabel}
          </span>
        </div>
      </div>
    </footer>
  );
};
