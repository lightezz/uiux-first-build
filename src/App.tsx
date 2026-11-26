import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ALL_UNIQUE_ASSETS,
  COMMUNITY_TRENDS,
  CRYPTO_RANKINGS,
  EXTRA_CRYPTO_COINS,
  EXTRA_WORLD_COMPANIES,
  EXTRA_WORLD_INDICES,
  HIGHEST_VOLUME_STOCKS,
  MAJOR_INDICES,
  MOST_VOLATILE_STOCKS,
  MarketAsset,
  STOCK_GAINERS,
  STOCK_LOSERS,
  TimeframeKey,
  US_SPOTLIGHT_STOCKS,
  WORLD_BIGGEST_COMPANIES,
  WORLD_INDICES,
  generateAssetSeries,
  getBadgeClasses,
} from './data/marketsData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InteractiveAreaChart } from './components/InteractiveAreaChart';
import { SymbolInspectorModal } from './components/SymbolInspectorModal';
import { AllMarketsModal } from './components/AllMarketsModal';
import { SearchCommandModal } from './components/SearchCommandModal';
import { PromoModal } from './components/PromoModal';

const TIMEFRAMES: TimeframeKey[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'];

const HERO_REGIONS = [
  { id: 'all', label: 'Markets, everywhere', target: 'top' },
  { id: 'indices', label: 'Global Indices', target: 'section-indices' },
  { id: 'us-stocks', label: 'US Stocks', target: 'section-us-stocks' },
  { id: 'world-stocks', label: 'World Companies', target: 'section-world-stocks' },
  { id: 'crypto', label: 'Crypto Rankings', target: 'section-crypto' },
] as const;

type ModalListKind = 'indices' | 'volume' | 'volatile' | 'gainers' | 'losers' | 'companies' | 'crypto';
type TableSortKey = 'symbol' | 'price' | 'cap';

export default function App() {
  const [selectedIndexId, setSelectedIndexId] = useState<string>('sp500');
  const [chartTimeframe, setChartTimeframe] = useState<TimeframeKey>('1D');
  const [selectedUsStockId, setSelectedUsStockId] = useState<string>('nvda');
  const [gainersSession, setGainersSession] = useState<'regular' | 'premarket'>('regular');
  const [losersSession, setLosersSession] = useState<'regular' | 'premarket'>('regular');

  const [companiesSort, setCompaniesSort] = useState<{ key: TableSortKey; asc: boolean }>({
    key: 'cap',
    asc: false,
  });
  const [cryptoSort, setCryptoSort] = useState<{ key: TableSortKey; asc: boolean }>({
    key: 'cap',
    asc: false,
  });

  const [inspectedAsset, setInspectedAsset] = useState<MarketAsset | null>(null);
  const [allModalKind, setAllModalKind] = useState<ModalListKind | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [heroMenuOpen, setHeroMenuOpen] = useState(false);
  const [activeHeroLabel, setActiveHeroLabel] = useState<string>('Markets, everywhere');
  const heroMenuRef = useRef<HTMLDivElement>(null);

  const [locale, setLocale] = useState<string>('EN');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tv_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tv_watchlist');
      return saved ? JSON.parse(saved) : ['NVDA', 'BTCUSD', 'SPX'];
    } catch {
      return ['NVDA', 'BTCUSD', 'SPX'];
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('tv_theme', isDark ? 'dark' : 'light');
    } catch {
      // ignore storage failure
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem('tv_watchlist', JSON.stringify(watchlistSymbols));
    } catch {
      // ignore storage failure
    }
  }, [watchlistSymbols]);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (heroMenuRef.current && !heroMenuRef.current.contains(e.target as Node)) {
        setHeroMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeIndex = useMemo(
    () => MAJOR_INDICES.find((i) => i.id === selectedIndexId) || MAJOR_INDICES[0],
    [selectedIndexId]
  );

  const activeIndexSeries = useMemo(() => {
    const map = generateAssetSeries(activeIndex);
    return map[chartTimeframe];
  }, [activeIndex, chartTimeframe]);

  const watchlistAssets = useMemo(
    () =>
      watchlistSymbols
        .map((sym) => ALL_UNIQUE_ASSETS.find((a) => a.symbol === sym))
        .filter((a): a is MarketAsset => Boolean(a)),
    [watchlistSymbols]
  );

  const toggleWatchlist = (asset: MarketAsset) => {
    setWatchlistSymbols((prev) =>
      prev.includes(asset.symbol)
        ? prev.filter((s) => s !== asset.symbol)
        : [asset.symbol, ...prev]
    );
  };

  const navigateToSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sortedWorldCompanies = useMemo(() => {
    const list = [...WORLD_BIGGEST_COMPANIES];
    list.sort((a, b) => {
      let cmp = 0;
      if (companiesSort.key === 'symbol') cmp = a.name.localeCompare(b.name);
      else if (companiesSort.key === 'price') cmp = a.numericChangePct - b.numericChangePct;
      else cmp = (a.numericMarketCap || 0) - (b.numericMarketCap || 0);
      return companiesSort.asc ? cmp : -cmp;
    });
    return list;
  }, [companiesSort]);

  const sortedCryptoRankings = useMemo(() => {
    const list = [...CRYPTO_RANKINGS];
    list.sort((a, b) => {
      let cmp = 0;
      if (cryptoSort.key === 'symbol') cmp = a.name.localeCompare(b.name);
      else if (cryptoSort.key === 'price') cmp = a.numericChangePct - b.numericChangePct;
      else cmp = (a.numericMarketCap || 0) - (b.numericMarketCap || 0);
      return cryptoSort.asc ? cmp : -cmp;
    });
    return list;
  }, [cryptoSort]);

  const allModalConfig = useMemo(() => {
    switch (allModalKind) {
      case 'indices':
        return {
          title: 'All Major & World Indices',
          assets: [...MAJOR_INDICES, ...WORLD_INDICES, ...EXTRA_WORLD_INDICES],
          showMarketCap: false,
        };
      case 'volume':
        return {
          title: 'Most Actively Traded US Stocks',
          assets: [...HIGHEST_VOLUME_STOCKS, ...US_SPOTLIGHT_STOCKS.filter((s) => !HIGHEST_VOLUME_STOCKS.some((v) => v.symbol === s.symbol))],
          showMarketCap: false,
        };
      case 'volatile':
        return {
          title: 'Stocks with Biggest Price Changes',
          assets: [...MOST_VOLATILE_STOCKS, ...STOCK_LOSERS.regular.filter((s) => !MOST_VOLATILE_STOCKS.some((v) => v.symbol === s.symbol))],
          showMarketCap: false,
        };
      case 'gainers':
        return {
          title: `Stock Gainers (${gainersSession === 'regular' ? 'Regular hours' : 'Pre-market'})`,
          assets: [...STOCK_GAINERS[gainersSession], ...MOST_VOLATILE_STOCKS.filter((s) => s.positive && !STOCK_GAINERS[gainersSession].some((g) => g.symbol === s.symbol))],
          showMarketCap: false,
        };
      case 'losers':
        return {
          title: `Stock Losers (${losersSession === 'regular' ? 'Regular hours' : 'Pre-market'})`,
          assets: [...STOCK_LOSERS[losersSession], ...MOST_VOLATILE_STOCKS.filter((s) => !s.positive && !STOCK_LOSERS[losersSession].some((l) => l.symbol === s.symbol))],
          showMarketCap: false,
        };
      case 'companies':
        return {
          title: 'World Biggest Companies by Market Cap',
          assets: [...WORLD_BIGGEST_COMPANIES, ...EXTRA_WORLD_COMPANIES],
          showMarketCap: true,
        };
      case 'crypto':
        return {
          title: 'Crypto Market Cap Ranking',
          assets: [...CRYPTO_RANKINGS, ...EXTRA_CRYPTO_COINS],
          showMarketCap: true,
        };
      default:
        return null;
    }
  }, [allModalKind, gainersSession, losersSession]);

  return (
    <div className="min-h-screen flex flex-col bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface">
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenPromo={() => setPromoOpen(true)}
        locale={locale}
        onChangeLocale={setLocale}
        isDark={isDark}
        onToggleDark={() => setIsDark((d) => !d)}
        watchlist={watchlistAssets}
        onSelectAsset={setInspectedAsset}
        onNavigateSection={navigateToSection}
        onOpenAllModal={(kind) => setAllModalKind(kind)}
      />

      <main
        id="top"
        className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-page-margin py-section flex flex-col gap-section"
      >
        {/* Page Hero */}
        <section className="flex justify-center pt-gutter-md pb-gutter-sm">
          <div ref={heroMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setHeroMenuOpen((o) => !o)}
              aria-expanded={heroMenuOpen}
              className="inline-flex items-center gap-gutter-sm text-light-on-surface dark:text-dark-on-surface hover:text-tv-blue transition-colors duration-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tv-blue rounded-md px-gutter-sm"
            >
              <h1 className="font-display text-display-lg-mobile md:text-display-lg text-light-on-surface dark:text-dark-on-surface">
                {activeHeroLabel}
              </h1>
              <span
                className={`material-symbols-outlined text-headline-lg text-light-on-surface dark:text-dark-on-surface transition-transform duration-state-change ${
                  heroMenuOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              >
                keyboard_arrow_down
              </span>
            </button>

            {heroMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low shadow-xl p-1.5 flex flex-col gap-0.5 z-30">
                {HERO_REGIONS.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => {
                      setActiveHeroLabel(region.label);
                      setHeroMenuOpen(false);
                      navigateToSection(region.target);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-sm font-label text-label-lg transition-colors ${
                      activeHeroLabel === region.label
                        ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-tv-blue'
                        : 'text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                    }`}
                  >
                    {region.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 1: Indices */}
        <section
          id="section-indices"
          aria-labelledby="heading-indices"
          className="flex flex-col gap-gutter-xl scroll-mt-20"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAllModalKind('indices')}
              className="inline-flex items-center gap-gutter-xs group text-left"
            >
              <h2
                id="heading-indices"
                className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
              >
                Indices
              </h2>
              <span
                className="material-symbols-outlined text-headline-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
                aria-hidden="true"
              >
                chevron_right
              </span>
            </button>
          </div>

          {/* Index Pill Selector + Interactive Chart */}
          <div className="flex flex-col gap-gutter-xl">
            <div
              role="tablist"
              aria-label="Major indices"
              className="flex items-center gap-gutter-md overflow-x-auto pb-gutter-xs"
            >
              {MAJOR_INDICES.map((idxItem) => {
                const isSelected = idxItem.id === selectedIndexId;
                return (
                  <button
                    key={idxItem.id}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    onClick={() => setSelectedIndexId(idxItem.id)}
                    className={`inline-flex items-center gap-gutter-md px-gutter-lg py-gutter-sm rounded-full shrink-0 transition-colors duration-state-change whitespace-nowrap ${
                      isSelected
                        ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface'
                        : 'bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-mono-sm ${getBadgeClasses(
                        idxItem.badgeTone
                      )}`}
                      aria-hidden="true"
                    >
                      {idxItem.shortCode}
                    </span>
                    <span className="font-label text-label-lg">{idxItem.name.replace(' Index', '').replace(' Small Cap', ' small cap')}</span>
                  </button>
                );
              })}
            </div>

            {/* Index Chart Panel */}
            <div
              role="tabpanel"
              className="rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface p-gutter-xl flex flex-col gap-gutter-lg"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-gutter-md">
                <button
                  type="button"
                  onClick={() => setInspectedAsset(activeIndex)}
                  className="flex flex-wrap items-baseline gap-gutter-md text-left group"
                >
                  <span className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors">
                    {activeIndex.name}
                  </span>
                  <span className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface tabular-nums">
                    {activeIndex.price}
                  </span>
                  <span
                    className={`font-label text-label-lg tabular-nums ${
                      activeIndexSeries.positive
                        ? 'text-light-secondary dark:text-dark-secondary'
                        : 'text-light-error dark:text-dark-error'
                    }`}
                  >
                    {activeIndexSeries.delta}
                  </span>
                </button>

                <div className="flex items-center gap-gutter-xs flex-wrap">
                  {TIMEFRAMES.map((tf) => {
                    const active = tf === chartTimeframe;
                    return (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setChartTimeframe(tf)}
                        className={`px-gutter-sm py-gutter-xs rounded-sm font-label text-label-md transition-colors duration-state-change whitespace-nowrap ${
                          active
                            ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface'
                            : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                        }`}
                      >
                        {tf}
                      </button>
                    );
                  })}
                </div>
              </div>

              <InteractiveAreaChart
                points={activeIndexSeries.points}
                positive={activeIndexSeries.positive}
                ariaLabel={`${activeIndex.name} ${chartTimeframe} price chart`}
                heightClassName="h-52"
              />
            </div>
          </div>

          {/* World Indices Sub-section */}
          <div className="flex flex-col gap-gutter-lg pt-gutter-sm">
            <button
              type="button"
              onClick={() => setAllModalKind('indices')}
              className="inline-flex items-center gap-gutter-xs group w-fit"
            >
              <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors">
                World indices
              </h3>
              <span
                className="material-symbols-outlined text-title-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
                aria-hidden="true"
              >
                chevron_right
              </span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter-lg items-stretch">
              {WORLD_INDICES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setInspectedAsset(item)}
                  className="h-full text-left rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface p-gutter-lg flex flex-col justify-between gap-gutter-lg hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                >
                  <header className="flex items-center gap-gutter-md w-full">
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                        item.badgeTone
                      )}`}
                    >
                      {item.shortCode}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                        {item.symbol}
                      </h4>
                      <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                        {item.name}
                      </p>
                    </div>
                  </header>
                  <div className="flex items-baseline justify-between gap-gutter-sm w-full">
                    <span className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {item.price}
                    </span>
                    <span
                      className={`font-label text-label-md tabular-nums ${
                        item.positive
                          ? 'text-light-secondary dark:text-dark-secondary'
                          : 'text-light-error dark:text-dark-error'
                      }`}
                    >
                      {item.changePct}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAllModalKind('indices')}
              className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-tv-blue hover:underline w-fit"
            >
              <span>See all major indices</span>
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                chevron_right
              </span>
            </button>
          </div>
        </section>

        {/* Section 2: US Stocks */}
        <section
          id="section-us-stocks"
          aria-labelledby="heading-us-stocks"
          className="flex flex-col gap-gutter-xl scroll-mt-20"
        >
          <button
            type="button"
            onClick={() => setAllModalKind('volume')}
            className="inline-flex items-center gap-gutter-sm group w-fit"
          >
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-light-primary text-light-on-primary font-mono text-mono-sm"
              aria-hidden="true"
            >
              US
            </span>
            <h2
              id="heading-us-stocks"
              className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
            >
              US stocks
            </h2>
            <span
              className="material-symbols-outlined text-headline-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
              aria-hidden="true"
            >
              chevron_right
            </span>
          </button>

          {/* US Stock Pill Selector */}
          <div className="flex items-center gap-gutter-md overflow-x-auto pb-gutter-xs">
            {US_SPOTLIGHT_STOCKS.map((stock) => {
              const active = stock.id === selectedUsStockId;
              return (
                <button
                  key={stock.id}
                  type="button"
                  onClick={() => {
                    setSelectedUsStockId(stock.id);
                    setInspectedAsset(stock);
                  }}
                  className={`inline-flex items-center gap-gutter-md px-gutter-lg py-gutter-sm rounded-full shrink-0 transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface'
                      : 'bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-mono-sm ${getBadgeClasses(
                      stock.badgeTone
                    )}`}
                  >
                    {stock.shortCode}
                  </span>
                  <span className="font-label text-label-lg">{stock.name}</span>
                </button>
              );
            })}
          </div>

          {/* Community Trends */}
          <div id="section-community-trends" className="flex flex-col gap-gutter-lg scroll-mt-20">
            <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
              Community trends
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter-lg items-stretch">
              {COMMUNITY_TRENDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setInspectedAsset(item)}
                  className="h-full text-left rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface p-gutter-lg flex flex-col justify-between gap-gutter-lg hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                >
                  <header className="flex items-center gap-gutter-md w-full">
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                        item.badgeTone
                      )}`}
                    >
                      {item.shortCode}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                        {item.symbol}
                      </h4>
                      <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                        {item.name}
                      </p>
                    </div>
                  </header>
                  <div className="flex items-baseline justify-between gap-gutter-sm w-full">
                    <span className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {item.price}
                    </span>
                    <span
                      className={`font-label text-label-md tabular-nums ${
                        item.positive
                          ? 'text-light-secondary dark:text-dark-secondary'
                          : 'text-light-error dark:text-dark-error'
                      }`}
                    >
                      {item.changePct}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Highest Volume & Most Volatile (2-column split) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-xl pt-gutter-sm">
            {/* Highest Volume Stocks */}
            <div className="flex flex-col gap-gutter-lg">
              <button
                type="button"
                onClick={() => setAllModalKind('volume')}
                className="inline-flex items-center gap-gutter-xs group w-fit"
              >
                <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors">
                  Highest volume stocks
                </h3>
                <span
                  className="material-symbols-outlined text-title-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-gutter-xl divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                {HIGHEST_VOLUME_STOCKS.map((stock) => (
                  <button
                    key={stock.id}
                    type="button"
                    onClick={() => setInspectedAsset(stock)}
                    className="py-gutter-md px-1 -mx-1 rounded-sm flex items-center justify-between gap-gutter-md text-left hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-gutter-md min-w-0">
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                          stock.badgeTone
                        )}`}
                      >
                        {stock.shortCode}
                      </span>
                      <div className="min-w-0">
                        <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                          {stock.name}
                        </div>
                        <span className="inline-block px-gutter-xs rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          {stock.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="text-right tabular-nums shrink-0">
                      <div className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                        {stock.price}
                      </div>
                      <div
                        className={`font-label text-label-md ${
                          stock.positive
                            ? 'text-light-secondary dark:text-dark-secondary'
                            : 'text-light-error dark:text-dark-error'
                        }`}
                      >
                        {stock.changePct}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAllModalKind('volume')}
                className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-tv-blue hover:underline w-fit"
              >
                <span>See all most actively traded stocks</span>
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                  chevron_right
                </span>
              </button>
            </div>

            {/* Most Volatile Stocks */}
            <div className="flex flex-col gap-gutter-lg">
              <button
                type="button"
                onClick={() => setAllModalKind('volatile')}
                className="inline-flex items-center gap-gutter-xs group w-fit"
              >
                <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors">
                  Most volatile stocks
                </h3>
                <span
                  className="material-symbols-outlined text-title-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-gutter-xl divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                {MOST_VOLATILE_STOCKS.map((stock) => (
                  <button
                    key={stock.id}
                    type="button"
                    onClick={() => setInspectedAsset(stock)}
                    className="py-gutter-md px-1 -mx-1 rounded-sm flex items-center justify-between gap-gutter-md text-left hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-gutter-md min-w-0">
                      <span
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                          stock.badgeTone
                        )}`}
                      >
                        {stock.shortCode}
                      </span>
                      <div className="min-w-0">
                        <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                          {stock.name}
                        </div>
                        <span className="inline-block px-gutter-xs rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          {stock.symbol}
                        </span>
                      </div>
                    </div>
                    <div className="text-right tabular-nums shrink-0">
                      <div className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                        {stock.price}
                      </div>
                      <div
                        className={`font-label text-label-md ${
                          stock.positive
                            ? 'text-light-secondary dark:text-dark-secondary'
                            : 'text-light-error dark:text-dark-error'
                        }`}
                      >
                        {stock.changePct}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAllModalKind('volatile')}
                className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-tv-blue hover:underline w-fit"
              >
                <span>See all stocks with biggest price changes</span>
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Stock Gainers & Stock Losers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-xl pt-gutter-sm">
            {/* Stock Gainers */}
            <div className="flex flex-col gap-gutter-lg">
              <button
                type="button"
                onClick={() => setAllModalKind('gainers')}
                className="inline-flex items-center gap-gutter-xs group w-fit"
              >
                <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors">
                  Stock gainers
                </h3>
                <span
                  className="material-symbols-outlined text-title-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              </button>

              <div className="flex flex-col gap-gutter-md">
                <div role="tablist" aria-label="Gainers session" className="inline-flex items-center gap-gutter-xs">
                  <button
                    role="tab"
                    type="button"
                    aria-selected={gainersSession === 'regular'}
                    onClick={() => setGainersSession('regular')}
                    className={`px-gutter-md py-gutter-xs rounded-sm font-label text-label-lg transition-colors whitespace-nowrap ${
                      gainersSession === 'regular'
                        ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface'
                        : 'bg-light-surface dark:bg-dark-surface text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                    }`}
                  >
                    Regular hours
                  </button>
                  <button
                    role="tab"
                    type="button"
                    aria-selected={gainersSession === 'premarket'}
                    onClick={() => setGainersSession('premarket')}
                    className={`px-gutter-md py-gutter-xs rounded-sm font-label text-label-lg transition-colors whitespace-nowrap ${
                      gainersSession === 'premarket'
                        ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface'
                        : 'bg-light-surface dark:bg-dark-surface text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                    }`}
                  >
                    Pre-market
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-gutter-xl divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                  {STOCK_GAINERS[gainersSession].map((stock) => (
                    <button
                      key={stock.id}
                      type="button"
                      onClick={() => setInspectedAsset(stock)}
                      className="py-gutter-md px-1 -mx-1 rounded-sm flex items-center justify-between gap-gutter-md text-left hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-gutter-md min-w-0">
                        <span
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                            stock.badgeTone
                          )}`}
                        >
                          {stock.shortCode}
                        </span>
                        <div className="min-w-0">
                          <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                            {stock.name}
                          </div>
                          <span className="inline-block px-gutter-xs rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            {stock.symbol}
                          </span>
                        </div>
                      </div>
                      <div className="text-right tabular-nums shrink-0">
                        <div className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                          {stock.price}
                        </div>
                        <div className="font-label text-label-md text-light-secondary dark:text-dark-secondary">
                          {stock.changePct}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAllModalKind('gainers')}
                className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-tv-blue hover:underline w-fit"
              >
                <span>See all stocks with largest daily growth</span>
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                  chevron_right
                </span>
              </button>
            </div>

            {/* Stock Losers */}
            <div className="flex flex-col gap-gutter-lg">
              <button
                type="button"
                onClick={() => setAllModalKind('losers')}
                className="inline-flex items-center gap-gutter-xs group w-fit"
              >
                <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors">
                  Stock losers
                </h3>
                <span
                  className="material-symbols-outlined text-title-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              </button>

              <div className="flex flex-col gap-gutter-md">
                <div role="tablist" aria-label="Losers session" className="inline-flex items-center gap-gutter-xs">
                  <button
                    role="tab"
                    type="button"
                    aria-selected={losersSession === 'regular'}
                    onClick={() => setLosersSession('regular')}
                    className={`px-gutter-md py-gutter-xs rounded-sm font-label text-label-lg transition-colors whitespace-nowrap ${
                      losersSession === 'regular'
                        ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface'
                        : 'bg-light-surface dark:bg-dark-surface text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                    }`}
                  >
                    Regular hours
                  </button>
                  <button
                    role="tab"
                    type="button"
                    aria-selected={losersSession === 'premarket'}
                    onClick={() => setLosersSession('premarket')}
                    className={`px-gutter-md py-gutter-xs rounded-sm font-label text-label-lg transition-colors whitespace-nowrap ${
                      losersSession === 'premarket'
                        ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface'
                        : 'bg-light-surface dark:bg-dark-surface text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                    }`}
                  >
                    Pre-market
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-gutter-xl divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                  {STOCK_LOSERS[losersSession].map((stock) => (
                    <button
                      key={stock.id}
                      type="button"
                      onClick={() => setInspectedAsset(stock)}
                      className="py-gutter-md px-1 -mx-1 rounded-sm flex items-center justify-between gap-gutter-md text-left hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
                    >
                      <div className="flex items-center gap-gutter-md min-w-0">
                        <span
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                            stock.badgeTone
                          )}`}
                        >
                          {stock.shortCode}
                        </span>
                        <div className="min-w-0">
                          <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                            {stock.name}
                          </div>
                          <span className="inline-block px-gutter-xs rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            {stock.symbol}
                          </span>
                        </div>
                      </div>
                      <div className="text-right tabular-nums shrink-0">
                        <div className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                          {stock.price}
                        </div>
                        <div className="font-label text-label-md text-light-error dark:text-dark-error">
                          {stock.changePct}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAllModalKind('losers')}
                className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-tv-blue hover:underline w-fit"
              >
                <span>See all stocks with largest daily drop</span>
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: World Stocks (Tables) */}
        <section
          id="section-world-stocks"
          aria-labelledby="heading-world-stocks"
          className="flex flex-col gap-gutter-xl scroll-mt-20"
        >
          <button
            type="button"
            onClick={() => setAllModalKind('companies')}
            className="inline-flex items-center gap-gutter-xs group w-fit"
          >
            <h2
              id="heading-world-stocks"
              className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
            >
              World stocks
            </h2>
            <span
              className="material-symbols-outlined text-headline-md text-light-on-surface dark:text-dark-on-surface group-hover:text-tv-blue transition-colors"
              aria-hidden="true"
            >
              chevron_right
            </span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-xl">
            {/* World Biggest Companies */}
            <div className="flex flex-col gap-gutter-lg">
              <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
                World biggest companies
              </h3>
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant">
                      <th scope="col" className="py-gutter-sm pr-gutter-md">
                        <button
                          type="button"
                          onClick={() =>
                            setCompaniesSort((s) => ({
                              key: 'symbol',
                              asc: s.key === 'symbol' ? !s.asc : true,
                            }))
                          }
                          className="font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue inline-flex items-center gap-1"
                        >
                          <span>Symbol</span>
                          {companiesSort.key === 'symbol' && (
                            <span>{companiesSort.asc ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th scope="col" className="py-gutter-sm px-gutter-md text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setCompaniesSort((s) => ({
                              key: 'price',
                              asc: s.key === 'price' ? !s.asc : false,
                            }))
                          }
                          className="font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue inline-flex items-center gap-1"
                        >
                          <span>Price &amp; Chg</span>
                          {companiesSort.key === 'price' && (
                            <span>{companiesSort.asc ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th scope="col" className="py-gutter-sm pl-gutter-md text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setCompaniesSort((s) => ({
                              key: 'cap',
                              asc: s.key === 'cap' ? !s.asc : false,
                            }))
                          }
                          className="font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue inline-flex items-center gap-1"
                        >
                          <span>Market Cap</span>
                          {companiesSort.key === 'cap' && (
                            <span>{companiesSort.asc ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                    {sortedWorldCompanies.map((company) => (
                      <tr
                        key={company.id}
                        onClick={() => setInspectedAsset(company)}
                        className="hover:bg-light-surface-container dark:hover:bg-dark-surface-container cursor-pointer transition-colors"
                      >
                        <td className="py-gutter-md pr-gutter-md">
                          <div className="flex items-center gap-gutter-md">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                                company.badgeTone
                              )}`}
                            >
                              {company.shortCode}
                            </span>
                            <div>
                              <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                                {company.name}
                              </div>
                              <span className="inline-block px-gutter-xs rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                {company.symbol}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-gutter-md px-gutter-md text-right tabular-nums">
                          <div className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                            {company.price}
                          </div>
                          <div
                            className={`font-label text-label-md ${
                              company.positive
                                ? 'text-light-secondary dark:text-dark-secondary'
                                : 'text-light-error dark:text-dark-error'
                            }`}
                          >
                            {company.changePct}
                          </div>
                        </td>
                        <td className="py-gutter-md pl-gutter-md text-right tabular-nums">
                          <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                            {company.marketCap}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() => setAllModalKind('companies')}
                className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-tv-blue hover:underline w-fit"
              >
                <span>See all world major companies</span>
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                  chevron_right
                </span>
              </button>
            </div>

            {/* Crypto Market Cap Ranking */}
            <div id="section-crypto" className="flex flex-col gap-gutter-lg scroll-mt-20">
              <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
                Crypto market cap ranking
              </h3>
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant">
                      <th scope="col" className="py-gutter-sm pr-gutter-md">
                        <button
                          type="button"
                          onClick={() =>
                            setCryptoSort((s) => ({
                              key: 'symbol',
                              asc: s.key === 'symbol' ? !s.asc : true,
                            }))
                          }
                          className="font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue inline-flex items-center gap-1"
                        >
                          <span>Symbol</span>
                          {cryptoSort.key === 'symbol' && (
                            <span>{cryptoSort.asc ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th scope="col" className="py-gutter-sm px-gutter-md text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setCryptoSort((s) => ({
                              key: 'price',
                              asc: s.key === 'price' ? !s.asc : false,
                            }))
                          }
                          className="font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue inline-flex items-center gap-1"
                        >
                          <span>Price &amp; Chg</span>
                          {cryptoSort.key === 'price' && (
                            <span>{cryptoSort.asc ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                      <th scope="col" className="py-gutter-sm pl-gutter-md text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setCryptoSort((s) => ({
                              key: 'cap',
                              asc: s.key === 'cap' ? !s.asc : false,
                            }))
                          }
                          className="font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue inline-flex items-center gap-1"
                        >
                          <span>Market Cap</span>
                          {cryptoSort.key === 'cap' && (
                            <span>{cryptoSort.asc ? '↑' : '↓'}</span>
                          )}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                    {sortedCryptoRankings.map((coin) => (
                      <tr
                        key={coin.id}
                        onClick={() => setInspectedAsset(coin)}
                        className="hover:bg-light-surface-container dark:hover:bg-dark-surface-container cursor-pointer transition-colors"
                      >
                        <td className="py-gutter-md pr-gutter-md">
                          <div className="flex items-center gap-gutter-md">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                                coin.badgeTone
                              )}`}
                            >
                              {coin.shortCode}
                            </span>
                            <div>
                              <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                                {coin.name}
                              </div>
                              <span className="inline-block px-gutter-xs rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                {coin.symbol}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-gutter-md px-gutter-md text-right tabular-nums">
                          <div className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                            {coin.price}
                          </div>
                          <div
                            className={`font-label text-label-md ${
                              coin.neutral
                                ? 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                                : coin.positive
                                ? 'text-light-secondary dark:text-dark-secondary'
                                : 'text-light-error dark:text-dark-error'
                            }`}
                          >
                            {coin.changePct}
                          </div>
                        </td>
                        <td className="py-gutter-md pl-gutter-md text-right tabular-nums">
                          <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                            {coin.marketCap}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() => setAllModalKind('crypto')}
                className="inline-flex items-center gap-gutter-xs font-label text-label-lg text-tv-blue hover:underline w-fit"
              >
                <span>See all coins</span>
                <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer
        locale={locale}
        onNavigateSection={navigateToSection}
        onOpenAllModal={(kind) => setAllModalKind(kind)}
      />

      <SearchCommandModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectAsset={setInspectedAsset}
      />

      <SymbolInspectorModal
        asset={inspectedAsset}
        onClose={() => setInspectedAsset(null)}
        isWatchlisted={
          inspectedAsset ? watchlistSymbols.includes(inspectedAsset.symbol) : false
        }
        onToggleWatchlist={toggleWatchlist}
      />

      <AllMarketsModal
        title={allModalConfig?.title || ''}
        assets={allModalConfig?.assets || null}
        showMarketCap={allModalConfig?.showMarketCap}
        onClose={() => setAllModalKind(null)}
        onSelectAsset={setInspectedAsset}
      />

      <PromoModal isOpen={promoOpen} onClose={() => setPromoOpen(false)} />
    </div>
  );
}
