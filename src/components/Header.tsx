import React, { useEffect, useRef, useState } from 'react';
import { LOCALES, MarketAsset, getBadgeClasses } from '../data/marketsData';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenPromo: () => void;
  locale: string;
  onChangeLocale: (code: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  watchlist: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAllModal: (kind: 'indices' | 'volume' | 'volatile' | 'companies' | 'crypto') => void;
}

type NavMenuKey = 'products' | 'community' | 'brokers' | 'more' | null;

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenPromo,
  locale,
  onChangeLocale,
  isDark,
  onToggleDark,
  watchlist,
  onSelectAsset,
  onNavigateSection,
  onOpenAllModal,
}) => {
  const [openMenu, setOpenMenu] = useState<NavMenuKey>(null);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setLocaleOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 bg-light-surface dark:bg-dark-surface border-b border-light-outline-variant dark:border-dark-outline-variant"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-page-margin h-16 flex items-center justify-between gap-gutter-lg">
        {/* Left: Brand + Search + Primary Nav */}
        <div className="flex items-center gap-gutter-xl min-w-0">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-gutter-sm text-light-on-surface dark:text-dark-on-surface shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tv-blue rounded-sm whitespace-nowrap"
          >
            <svg width="32" height="20" viewBox="0 0 36 28" fill="none" aria-hidden="true">
              <path d="M14 22H7V11H0V4H14V22Z" fill="currentColor" />
              <path d="M22.5 22H15.5L23.5 4H30.5L22.5 22Z" fill="currentColor" />
              <circle cx="31.5" cy="8.5" r="3.5" fill="currentColor" />
            </svg>
            <span className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface tracking-tight">
              TradingView
            </span>
          </a>

          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-gutter-sm px-gutter-md py-gutter-sm rounded-full bg-light-surface-container-low dark:bg-dark-surface-container-low text-light-on-surface-variant dark:text-dark-on-surface-variant w-56 cursor-pointer hover:bg-light-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors duration-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tv-blue"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              search
            </span>
            <span className="font-body text-body-sm whitespace-nowrap">Search (Ctrl+K)</span>
          </button>

          <nav aria-label="Primary" className="hidden lg:flex items-center gap-gutter-xl relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(openMenu === 'products' ? null : 'products');
                  setLocaleOpen(false);
                  setAccountOpen(false);
                }}
                className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors duration-state-change whitespace-nowrap shrink-0"
              >
                Products
              </button>
              {openMenu === 'products' && (
                <div className="absolute left-0 top-10 w-64 rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low shadow-lg p-2 flex flex-col gap-1 z-40">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onNavigateSection('section-indices');
                    }}
                    className="w-full text-left px-3 py-2 rounded-sm hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                  >
                    <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                      Supercharts
                    </div>
                    <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Interactive multi-timeframe index charts
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenAllModal('volume');
                    }}
                    className="w-full text-left px-3 py-2 rounded-sm hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                  >
                    <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                      Stock Screener
                    </div>
                    <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Filter active, volatile & large-cap equities
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenAllModal('crypto');
                    }}
                    className="w-full text-left px-3 py-2 rounded-sm hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                  >
                    <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                      Crypto Screener
                    </div>
                    <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Digital asset market cap rankings
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onNavigateSection('section-community-trends');
              }}
              className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors duration-state-change whitespace-nowrap shrink-0"
            >
              Community
            </button>

            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setOpenMenu(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="font-label text-label-lg text-tv-blue whitespace-nowrap shrink-0"
            >
              Markets
            </a>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(openMenu === 'brokers' ? null : 'brokers');
                  setLocaleOpen(false);
                  setAccountOpen(false);
                }}
                className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors duration-state-change whitespace-nowrap shrink-0"
              >
                Brokers
              </button>
              {openMenu === 'brokers' && (
                <div className="absolute left-0 top-10 w-64 rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low shadow-lg p-2 flex flex-col gap-1 z-40">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onNavigateSection('section-us-stocks');
                    }}
                    className="w-full text-left px-3 py-2 rounded-sm hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                  >
                    <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                      US Equity Venues
                    </div>
                    <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      NASDAQ & NYSE direct routing
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onNavigateSection('section-world-stocks');
                    }}
                    className="w-full text-left px-3 py-2 rounded-sm hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                  >
                    <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                      Global & Crypto Exchanges
                    </div>
                    <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      TSE, FTSE, XETR & spot liquidity
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(openMenu === 'more' ? null : 'more');
                  setLocaleOpen(false);
                  setAccountOpen(false);
                }}
                className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors duration-state-change whitespace-nowrap shrink-0"
              >
                More
              </button>
              {openMenu === 'more' && (
                <div className="absolute left-0 top-10 w-60 rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low shadow-lg p-2 flex flex-col gap-1 z-40">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenAllModal('indices');
                    }}
                    className="w-full text-left px-3 py-2 rounded-sm hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors font-label text-label-lg text-light-on-surface dark:text-dark-on-surface"
                  >
                    All Major Indices
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onOpenAllModal('companies');
                    }}
                    className="w-full text-left px-3 py-2 rounded-sm hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors font-label text-label-lg text-light-on-surface dark:text-dark-on-surface"
                  >
                    Global Market Caps
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onToggleDark();
                    }}
                    className="w-full text-left px-3 py-2 rounded-sm hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors font-label text-label-lg text-light-on-surface dark:text-dark-on-surface flex items-center justify-between"
                  >
                    <span>Color Theme</span>
                    <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {isDark ? 'Dark' : 'Light'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right: Locale, Account, Promo CTA */}
        <div className="flex items-center gap-gutter-md shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search symbols"
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-title-md" aria-hidden="true">
              search
            </span>
          </button>

          {/* Locale Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLocaleOpen(!localeOpen);
                setAccountOpen(false);
                setOpenMenu(null);
              }}
              aria-expanded={localeOpen}
              className="inline-flex items-center gap-gutter-xs px-gutter-md py-gutter-xs rounded-full bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors duration-state-change ease-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tv-blue whitespace-nowrap"
            >
              <span
                className="material-symbols-outlined text-title-md text-light-on-surface-variant dark:text-dark-on-surface-variant"
                aria-hidden="true"
              >
                language
              </span>
              <span className="font-label text-label-lg">{locale}</span>
            </button>

            {localeOpen && (
              <div className="absolute right-0 top-11 w-48 rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low shadow-lg p-1.5 flex flex-col gap-0.5 z-40">
                {LOCALES.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => {
                      onChangeLocale(loc.code);
                      setLocaleOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-sm text-left flex items-center justify-between transition-colors ${
                      locale === loc.code
                        ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-tv-blue'
                        : 'text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                    }`}
                  >
                    <span className="font-label text-label-md">{loc.label}</span>
                    <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {loc.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account / Watchlist & Theme Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setAccountOpen(!accountOpen);
                setLocaleOpen(false);
                setOpenMenu(null);
              }}
              aria-label="Account profile and watchlist"
              aria-expanded={accountOpen}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors duration-state-change ease-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tv-blue relative"
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                person
              </span>
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-11 w-72 rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low shadow-lg p-4 flex flex-col gap-4 z-40">
                <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant">
                  <div>
                    <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                      Market Workspace
                    </div>
                    <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Appearance & saved symbols
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleDark}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-label text-label-md text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-high dark:hover:bg-dark-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                      {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                    <span>{isDark ? 'Light' : 'Dark'}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-label-md uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Watchlist
                    </span>
                    <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {watchlist.length}
                    </span>
                  </div>

                  {watchlist.length === 0 ? (
                    <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant py-2">
                      Click any ticker card or table row to save symbols to your watchlist.
                    </p>
                  ) : (
                    <div className="flex flex-col divide-y divide-light-outline-variant dark:divide-dark-outline-variant max-h-56 overflow-y-auto">
                      {watchlist.map((item) => (
                        <button
                          key={item.symbol}
                          type="button"
                          onClick={() => {
                            setAccountOpen(false);
                            onSelectAsset(item);
                          }}
                          className="py-2 flex items-center justify-between gap-2 text-left hover:bg-light-surface-container dark:hover:bg-dark-surface-container rounded-sm px-1 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                                item.badgeTone
                              )}`}
                            >
                              {item.shortCode}
                            </span>
                            <div className="min-w-0">
                              <div className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface truncate">
                                {item.symbol}
                              </div>
                              <div className="font-body text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                                {item.name}
                              </div>
                            </div>
                          </div>
                          <div className="text-right tabular-nums shrink-0">
                            <div className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                              {item.price}
                            </div>
                            <div
                              className={`font-label text-label-sm ${
                                item.positive
                                  ? 'text-light-secondary dark:text-dark-secondary'
                                  : 'text-light-error dark:text-dark-error'
                              }`}
                            >
                              {item.changePct}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Black Friday CTA */}
          <button
            type="button"
            onClick={onOpenPromo}
            className="hidden sm:inline-flex flex-col items-center justify-center px-gutter-lg py-gutter-xs rounded-full bg-light-error text-light-on-error hover:opacity-90 transition-opacity duration-state-change ease-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tv-blue whitespace-nowrap shrink-0"
          >
            <span className="font-label text-label-md leading-tight">Black Friday</span>
            <span className="font-label text-label-sm leading-tight">Up to 80% OFF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
