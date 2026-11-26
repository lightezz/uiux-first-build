import React, { useEffect, useMemo, useState } from 'react';
import { MarketAsset, getBadgeClasses } from '../data/marketsData';

interface AllMarketsModalProps {
  title: string;
  assets: MarketAsset[] | null;
  showMarketCap?: boolean;
  onClose: () => void;
  onSelectAsset: (asset: MarketAsset) => void;
}

type SortField = 'symbol' | 'price' | 'change' | 'cap';

export const AllMarketsModal: React.FC<AllMarketsModalProps> = ({
  title,
  assets,
  showMarketCap = false,
  onClose,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>(showMarketCap ? 'cap' : 'change');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    setQuery('');
    setSortField(showMarketCap ? 'cap' : 'change');
    setSortAsc(false);
  }, [title, showMarketCap]);

  useEffect(() => {
    if (!assets) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [assets, onClose]);

  const filteredAndSorted = useMemo(() => {
    if (!assets) return [];
    const q = query.trim().toLowerCase();
    const list = q
      ? assets.filter(
          (a) =>
            a.symbol.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.exchange.toLowerCase().includes(q)
        )
      : [...assets];

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'symbol') {
        cmp = a.symbol.localeCompare(b.symbol);
      } else if (sortField === 'price') {
        cmp = a.numericPrice - b.numericPrice;
      } else if (sortField === 'change') {
        cmp = a.numericChangePct - b.numericChangePct;
      } else if (sortField === 'cap') {
        cmp = (a.numericMarketCap || 0) - (b.numericMarketCap || 0);
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [assets, query, sortField, sortAsc]);

  if (!assets) return null;

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'symbol');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="all-markets-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[85vh] rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface dark:bg-dark-surface-container-low flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-light-outline-variant dark:border-dark-outline-variant flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="all-markets-title"
              className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface"
            >
              {title}
            </h2>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
              {filteredAndSorted.length} instruments · Click any row to inspect interactive chart
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container-high border border-light-outline-variant dark:border-dark-outline-variant">
              <span
                className="material-symbols-outlined text-title-md text-light-on-surface-variant dark:text-dark-on-surface-variant"
                aria-hidden="true"
              >
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter ticker or name..."
                className="bg-transparent border-none outline-none font-body text-body-sm text-light-on-surface dark:text-dark-on-surface placeholder:text-light-on-surface-variant w-44"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close table"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-title-md" aria-hidden="true">
                close
              </span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {filteredAndSorted.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                No instruments match “{query}”.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-4 py-1.5 rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-label text-label-md text-tv-blue"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-light-surface dark:bg-dark-surface-container-low">
                <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant">
                  <th scope="col" className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('symbol')}
                      className="inline-flex items-center gap-1 font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue"
                    >
                      <span>Symbol</span>
                      {sortField === 'symbol' && (
                        <span>{sortAsc ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('price')}
                      className="inline-flex items-center gap-1 font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue"
                    >
                      <span>Price</span>
                      {sortField === 'price' && <span>{sortAsc ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('change')}
                      className="inline-flex items-center gap-1 font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue"
                    >
                      <span>Chg %</span>
                      {sortField === 'change' && <span>{sortAsc ? '↑' : '↓'}</span>}
                    </button>
                  </th>
                  <th scope="col" className="py-3 pl-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort(showMarketCap ? 'cap' : 'symbol')}
                      className="inline-flex items-center gap-1 font-label text-label-sm uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-tv-blue"
                    >
                      <span>{showMarketCap ? 'Market Cap' : 'Volume'}</span>
                      {showMarketCap && sortField === 'cap' && (
                        <span>{sortAsc ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                {filteredAndSorted.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      onClose();
                      onSelectAsset(item);
                    }}
                    className="hover:bg-light-surface-container dark:hover:bg-dark-surface-container cursor-pointer transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-mono-sm shrink-0 ${getBadgeClasses(
                            item.badgeTone
                          )}`}
                        >
                          {item.shortCode}
                        </span>
                        <div>
                          <div className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                            {item.name}
                          </div>
                          <span className="inline-block px-1 rounded-sm bg-light-surface-container-low dark:bg-dark-surface-container-high font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            {item.symbol}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                      {item.price}
                    </td>
                    <td
                      className={`py-3 px-4 text-right tabular-nums font-label text-label-md ${
                        item.neutral
                          ? 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                          : item.positive
                          ? 'text-light-secondary dark:text-dark-secondary'
                          : 'text-light-error dark:text-dark-error'
                      }`}
                    >
                      {item.changePct}
                    </td>
                    <td className="py-3 pl-4 text-right tabular-nums font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                      {showMarketCap ? item.marketCap || '—' : item.volume || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
