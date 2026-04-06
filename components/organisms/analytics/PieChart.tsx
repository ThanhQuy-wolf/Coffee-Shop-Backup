"use client";

import { useState, useMemo } from "react";

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieSlice[];
}

/**
 * Pure-SVG interactive pie chart.
 * Hover a slice or legend item to highlight it and show its percentage.
 */
export function PieChart({ data }: PieChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const R = 80;
  const CX = 110;
  const CY = 110;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  const slices = useMemo(() => {
    type Acc = { items: ReturnType<typeof makeSlice>[]; angle: number };

    const makeSlice = (d: PieSlice, i: number, startAngle: number) => {
      const angle = (d.value / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;
      const x1 = CX + R * Math.cos(startAngle);
      const y1 = CY + R * Math.sin(startAngle);
      const x2 = CX + R * Math.cos(endAngle);
      const y2 = CY + R * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const pathD = `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
      return {
        ...d,
        pathD,
        labelX: CX + R * 0.65 * Math.cos(midAngle),
        labelY: CY + R * 0.65 * Math.sin(midAngle),
        percent: (d.value / total) * 100,
        index: i,
        endAngle,
      };
    };

    const { items } = data.reduce<Acc>(
      (acc, d, i) => {
        const slice = makeSlice(d, i, acc.angle);
        return { items: [...acc.items, slice], angle: slice.endAngle };
      },
      { items: [], angle: -Math.PI / 2 },
    );
    return items;
  }, [data, total]);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <svg
        viewBox="0 0 220 220"
        className="w-full max-w-55 shrink-0"
        style={{ height: 220 }}
        onMouseLeave={() => setHovered(null)}
      >
        {slices.map((s) => (
          <path
            key={s.index}
            d={s.pathD}
            fill={s.color}
            stroke="#FDF6EC"
            strokeWidth="2"
            style={{ cursor: "pointer", transition: "opacity 200ms" }}
            onMouseEnter={() => setHovered(s.index)}
            opacity={hovered !== null && hovered !== s.index ? 0.65 : 1}
          />
        ))}
        {hovered !== null && (
          <text x={CX} y={CY + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3D2B1F">
            {slices[hovered].percent.toFixed(1)}%
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-col">
        {slices.map((s) => (
          <div
            key={s.index}
            className="flex cursor-pointer items-center gap-2 text-sm"
            onMouseEnter={() => setHovered(s.index)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span
              className="max-w-35 truncate"
              style={{ color: hovered === s.index ? "#3D2B1F" : "#6F4E37", fontWeight: hovered === s.index ? 600 : 400 }}
            >
              {s.label}
            </span>
            <span className="text-xs text-(--color-text-muted)">{s.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
