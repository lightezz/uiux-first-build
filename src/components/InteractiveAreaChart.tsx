import React, { useId, useRef, useState } from 'react';
import { ChartPoint } from '../data/marketsData';

interface InteractiveAreaChartProps {
  points: ChartPoint[];
  positive: boolean;
  ariaLabel: string;
  heightClassName?: string;
}

export const InteractiveAreaChart: React.FC<InteractiveAreaChartProps> = ({
  points,
  positive,
  ariaLabel,
  heightClassName = 'h-52',
}) => {
  const gradientId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 1200;
  const height = 200;
  const padTop = 22;
  const padBottom = 22;

  const safePoints = points.length >= 2 ? points : [{ label: '', value: 0 }, { label: '', value: 0 }];
  const values = safePoints.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const coords = safePoints.map((p, idx) => {
    const x = (idx / (safePoints.length - 1)) * width;
    const normalized = (p.value - minVal) / range;
    const y = height - padBottom - normalized * (height - padTop - padBottom);
    return { x, y, ...p };
  });

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  const strokeColor = positive ? '#089981' : '#F23645';

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(relX * (coords.length - 1));
    setHoverIndex(idx);
  };

  const activePoint = hoverIndex !== null ? coords[hoverIndex] : null;
  const activePctX = activePoint ? (activePoint.x / width) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setHoverIndex(null)}
      className={`relative w-full ${heightClassName} select-none cursor-crosshair`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <line
          x1="0"
          y1="45"
          x2={width}
          y2="45"
          className="stroke-light-outline-variant dark:stroke-dark-outline-variant"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="100"
          x2={width}
          y2="100"
          className="stroke-light-outline-variant dark:stroke-dark-outline-variant"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="155"
          x2={width}
          y2="155"
          className="stroke-light-outline-variant dark:stroke-dark-outline-variant"
          strokeDasharray="4 4"
          strokeWidth="1"
        />

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {activePoint && (
          <line
            x1={activePoint.x}
            y1="0"
            x2={activePoint.x}
            y2={height}
            className="stroke-light-outline dark:stroke-dark-outline"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        )}
      </svg>

      {activePoint && (
        <>
          <div
            style={{
              left: `${activePctX}%`,
              top: `${(activePoint.y / height) * 100}%`,
              backgroundColor: strokeColor,
            }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-dark-surface"
          />
          <div
            style={{
              left: `${Math.min(88, Math.max(12, activePctX))}%`,
            }}
            className="pointer-events-none absolute top-1 -translate-x-1/2 z-10 px-2.5 py-1 rounded-sm bg-light-inverse-surface dark:bg-dark-surface-container-highest text-light-inverse-on-surface dark:text-dark-on-surface shadow-sm flex items-center gap-2 whitespace-nowrap"
          >
            <span className="font-mono text-mono-sm tabular-nums font-semibold">
              {activePoint.value.toLocaleString('en-US', {
                minimumFractionDigits: activePoint.value < 10 ? 4 : 2,
                maximumFractionDigits: activePoint.value < 10 ? 4 : 2,
              })}
            </span>
            <span className="font-body text-[11px] opacity-80">{activePoint.label}</span>
          </div>
        </>
      )}
    </div>
  );
};
