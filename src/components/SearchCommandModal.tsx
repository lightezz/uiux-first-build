import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ALL_UNIQUE_ASSETS,
  AssetCategory,
  MarketAsset,
  getBadgeClasses,
} from '../data/marketsData';

interface SearchCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: MarketAsset) => void;
}

type CategoryTab = 'all' | AssetCategory;

export const SearchCommandModal: React.FC<SearchCommandModalProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryTab>('all');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setCategory('all');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_UNIQUE_ASSETS.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.exchange.toLowerCase().includes(q)
      );
    }).slice(0, 14);
  }, [query, category]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query, category]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((prev) => Math.min(results.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Enter' && results[activeIdx]) {
        e.preventDefault();
        onSelectAsset(results[activeIdx]);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, results, activeIdx, onClose, onSelectAsset]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 pt-16 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Symbol search"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-light-outline-variant dark:border-dark-outline-variant">
          <span
            className="material-symbols-outlined text-title-md text-light-on-surface-variant dark:text-dark-on-surface-variant"
            aria-hidden="true"
          >
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company, index, or crypto..."
            className="flex-1 bg-transparent border-none outline-none font-body text-body-md text-light-on-surface dark:text-dark-on-surface placeholder:text-light-on-surface-variant"
          />
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant"
          >
            ESC
          </button>
        </div>

        <div className="flex items-center gap-1 px-4 py-2 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container dark:bg-dark-surface-container">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'index', label: 'Indices' },
              { id: 'stock', label: 'Stocks' },
              { id: 'crypto', label: 'Crypto' },
            ] as { id: CategoryTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1 rounded-sm font-label text-label-md transition-colors ${
                category === tab.id
                  ? 'bg-light-surface dark:bg-dark-surface-container-highest text-light-on-surface dark:text-dark-on-surface shadow-xs'
                  : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
          {results.length === 0 ? (
            <div className="py-10 text-center font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              No symbols found for “{query}”.
            </div>
          ) : (
            results.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => {
                  onSelectAsset(item);
                  onClose();
                }}
                className={`w-full px-4 py-3 flex items-center justify-between gap-4 text-left transition-colors ${
                  idx === activeIdx
                    ? 'bg-light-surface-container-low dark:bg-dark-surface-container-high'
                    : 'hover:bg-light-surface-container dark:hover:bg-dark-surface-container'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                      item.badgeTone
                    )}`}
                  >
                    {item.shortCode}
                  </span>
                  <div className="min-w-0">
                    <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface truncate">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      <span>{item.symbol}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.exchange}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right tabular-nums shrink-0">
                  <div className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                    {item.price}
                  </div>
                  <div
                    className={`font-label text-label-md ${
                      item.neutral
                        ? 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                        : item.positive
                        ? 'text-light-secondary dark:text-dark-secondary'
                        : 'text-light-error dark:text-dark-error'
                    }`}
                  >
                    {item.changePct}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
