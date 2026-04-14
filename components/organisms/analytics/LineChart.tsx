"use client";

import { formatCurrency } from "@/lib/analytics-utils";
import type { RevenueDataPoint } from "@/lib/types";
import { useState } from "react";

interface LineChartProps {
  data: RevenueDataPoint[];
  height?: number;
}

/**
 * Pure-SVG interactive line chart for revenue over time.
 * Hover dots show tooltip with label, revenue, and order count.
 * Tooltip auto-flips above/below the dot to stay inside the viewBox.
 */
export function LineChart({ data, height = 200 }: LineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const W = 800;
  const H = height;
  const padL = 56,
    padR = 16,
    padT = 16,
    padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxRev = Math.max(...data.map((d) => d.revenue));
  const range = maxRev || 1;

  const points = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + chartH - (d.revenue / range) * chartH,
    data: d,
    index: i,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(padT + chartH).toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;

  const yTicks = 5;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => ({
    val: (range / yTicks) * (yTicks - i),
    y: padT + (i / yTicks) * chartH,
  }));

  const step = Math.ceil(data.length / 10);

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H, minWidth: 320 }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6F4E37" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6F4E37" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={g.y}
              x2={W - padR}
              y2={g.y}
              stroke="#E2C9A8"
              strokeWidth="1"
              strokeDasharray={i === yTicks ? "0" : "4 3"}
            />
            <text
              x={padL - 6}
              y={g.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#A08060"
            >
              {formatCurrency(g.val)}
            </text>
          </g>
        ))}

        <path d={areaD} fill="url(#areaGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke="#6F4E37"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p, i) =>
          i % step === 0 ? (
            <text
              key={i}
              x={p.x}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#A08060"
            >
              {p.data.label}
            </text>
          ) : null,
        )}

        {points.map((p) => (
          <circle
            key={p.index}
            cx={p.x}
            cy={p.y}
            r={hovered === p.index ? 5 : 3}
            fill={hovered === p.index ? "#C8973A" : "#6F4E37"}
            stroke="#FDF6EC"
            strokeWidth="2"
            style={{ cursor: "pointer", transition: "r 150ms" }}
            onMouseEnter={() => setHovered(p.index)}
          />
        ))}

        {hovered !== null &&
          (() => {
            const p = points[hovered];
            const tipW = 120,
              tipH = 48;
            const tipX = Math.min(
              Math.max(p.x - tipW / 2, padL),
              W - padR - tipW,
            );
            const aboveY = p.y - tipH - 10;
            const tipY = Math.min(
              Math.max(aboveY >= padT ? aboveY : p.y + 10, padT),
              padT + chartH - tipH,
            );
            return (
              <g>
                <rect
                  x={tipX}
                  y={tipY}
                  width={tipW}
                  height={tipH}
                  rx="6"
                  fill="#3D2B1F"
                  opacity="0.92"
                />
                <text
                  x={tipX + tipW / 2}
                  y={tipY + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#F0D9A8"
                >
                  {p.data.label}
                </text>
                <text
                  x={tipX + tipW / 2}
                  y={tipY + 30}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#C8973A"
                >
                  {formatCurrency(p.data.revenue)}
                </text>
                <text
                  x={tipX + tipW / 2}
                  y={tipY + 44}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#A08060"
                >
                  {p.data.orders} đơn
                </text>
              </g>
            );
          })()}
      </svg>
    </div>
  );
}
