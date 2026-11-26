import React, { useEffect, useState } from 'react';
import {
  MarketAsset,
  TimeframeKey,
  generateAssetSeries,
  getBadgeClasses,
} from '../data/marketsData';
import { InteractiveAreaChart } from './InteractiveAreaChart';

interface SymbolInspectorModalProps {
  asset: MarketAsset | null;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (asset: MarketAsset) => void;
}

const TIMEFRAMES: TimeframeKey[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'];

export const SymbolInspectorModal: React.FC<SymbolInspectorModalProps> = ({
  asset,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeKey>('1D');

  useEffect(() => {
    setTimeframe('1D');
  }, [asset?.id]);

  useEffect(() => {
    if (!asset) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [asset, onClose]);

  if (!asset) return null;

  const seriesMap = generateAssetSeries(asset);
  const activeSeries = seriesMap[timeframe];
  const values = activeSeries.points.map((p) => p.value);
  const periodHigh = Math.max(...values);
  const periodLow = Math.min(...values);
  const openVal = values[0];

  const formatPrice = (v: number) =>
    v.toLocaleString('en-US', {
      minimumFractionDigits: v < 10 ? 4 : 2,
      maximumFractionDigits: v < 10 ? 4 : 2,
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low p-6 flex flex-col gap-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`inline-flex items-center justify-center w-11 h-11 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                asset.badgeTone
              )}`}
            >
              {asset.shortCode}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="inspector-title"
                  className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface truncate"
                >
                  {asset.name}
                </h2>
                <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  {asset.symbol} · {asset.exchange}
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                <span className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface tabular-nums">
                  {asset.price}
                </span>
                <span
                  className={`font-label text-label-lg tabular-nums ${
                    activeSeries.neutral
                      ? 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                      : activeSeries.positive
                      ? 'text-light-secondary dark:text-dark-secondary'
                      : 'text-light-error dark:text-dark-error'
                  }`}
                >
                  {activeSeries.delta}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleWatchlist(asset)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-label text-label-md transition-colors duration-state-change whitespace-nowrap ${
                isWatchlisted
                  ? 'bg-tv-blue text-white'
                  : 'bg-light-surface-container-low dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-high dark:hover:bg-dark-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                {isWatchlisted ? 'bookmark_added' : 'bookmark_add'}
              </span>
              <span>{isWatchlisted ? 'Saved' : 'Watchlist'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close symbol details"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                close
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {TIMEFRAMES.map((tf) => {
            const active = tf === timeframe;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-sm font-label text-label-md transition-colors duration-state-change ${
                  active
                    ? 'bg-light-surface-container-low dark:bg-dark-surface-container-highest text-light-on-surface dark:text-dark-on-surface'
                    : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container dark:hover:bg-dark-surface-container-high'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>

        <div className="rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface p-4">
          <InteractiveAreaChart
            points={activeSeries.points}
            positive={activeSeries.positive}
            ariaLabel={`${asset.name} ${timeframe} price chart`}
            heightClassName="h-56"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-light-outline-variant dark:border-dark-outline-variant">
          <div>
            <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Period Open
            </div>
            <div className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface tabular-nums mt-0.5">
              {asset.open && timeframe === '1D' ? asset.open : formatPrice(openVal)}
            </div>
          </div>
          <div>
            <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Period High
            </div>
            <div className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface tabular-nums mt-0.5">
              {asset.high && timeframe === '1D' ? asset.high : formatPrice(periodHigh)}
            </div>
          </div>
          <div>
            <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Period Low
            </div>
            <div className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface tabular-nums mt-0.5">
              {asset.low && timeframe === '1D' ? asset.low : formatPrice(periodLow)}
            </div>
          </div>
          <div>
            <div className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              {asset.marketCap ? 'Market Cap' : 'Volume'}
            </div>
            <div className="font-title text-title-md text-light-on-surface dark:text-dark-on-surface tabular-nums mt-0.5">
              {asset.marketCap || asset.volume || '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
