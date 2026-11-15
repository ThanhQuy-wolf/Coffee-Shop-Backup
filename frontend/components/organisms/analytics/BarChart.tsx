"use client";

import { useElementWidth } from "@/lib/hooks/use-element-width";
import type { RevenueDataPoint } from "@/lib/types";
import { formatVNDShort } from "@/lib/utils/currency";
import { useState } from "react";

interface BarChartProps {
  current: RevenueDataPoint[];
  previous: RevenueDataPoint[];
  height?: number;
}

/**
 * SVG bar chart comparing revenue of the current and previous period, bar by
 * bar. Hovering a bar shows a tooltip with the label, revenue and order count;
 * the tooltip flips below the bar when it would leave the chart.
 * @param props.current Points of the current period.
 * @param props.previous Points of the previous period, same length.
 * @param props.height Chart height in viewBox units, 200 by default.
 */
export function BarChart({ current, previous, height = 200 }: BarChartProps) {
  const [hovered, setHovered] = useState<{
    set: "cur" | "prev";
    idx: number;
  } | null>(null);
  const [boxRef, boxWidth] = useElementWidth<HTMLDivElement>();
  // Never narrower than 320px; below that the chart scrolls sideways.
  const W = Math.max(boxWidth, 320);
  const H = height;
  const padL = 56,
    padR = 16,
    padT = 16,
    padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const n = current.length;
  const maxVal =
    Math.max(
      ...current.map((d) => d.revenue),
      ...previous.map((d) => d.revenue),
    ) || 1;
  const groupW = chartW / n;
  const barW = groupW * 0.35;
  const gap = groupW * 0.05;

  const yTicks = 5;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => ({
    val: (maxVal / yTicks) * (yTicks - i),
    y: padT + (i / yTicks) * chartH,
  }));

  const step = Math.ceil(n / 8);

  return (
    <div ref={boxRef} className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H, width: W }}
        onMouseLeave={() => setHovered(null)}
      >
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
              fill="#80604A"
            >
              {formatVNDShort(g.val)}
            </text>
          </g>
        ))}

        {current.map((d, i) => {
          const groupX = padL + i * groupW;
          const curH = (d.revenue / maxVal) * chartH;
          const prevH = ((previous[i]?.revenue ?? 0) / maxVal) * chartH;
          const curX = groupX + gap;
          const prevX = curX + barW + gap;
          const isHovCur = hovered?.set === "cur" && hovered.idx === i;
          const isHovPrev = hovered?.set === "prev" && hovered.idx === i;
          return (
            <g key={i}>
              <rect
                x={prevX}
                y={padT + chartH - prevH}
                width={barW}
                height={prevH}
                rx="3"
                fill={isHovPrev ? "#A0785A" : "#E2C9A8"}
                style={{ cursor: "pointer", transition: "fill 150ms" }}
                onPointerEnter={() => setHovered({ set: "prev", idx: i })}
              />
              <rect
                x={curX}
                y={padT + chartH - curH}
                width={barW}
                height={curH}
                rx="3"
                fill={isHovCur ? "#4A3728" : "#6F4E37"}
                style={{ cursor: "pointer", transition: "fill 150ms" }}
                onPointerEnter={() => setHovered({ set: "cur", idx: i })}
              />
              {i % step === 0 && (
                <text
                  x={groupX + groupW / 2}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#80604A"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        {hovered !== null &&
          (() => {
            const d =
              hovered.set === "cur"
                ? current[hovered.idx]
                : previous[hovered.idx];
            if (!d) return null;
            const groupX = padL + hovered.idx * groupW;
            const tipW = 130,
              tipH = 50;
            const tipX = Math.min(
              Math.max(groupX - tipW / 2, padL),
              W - padR - tipW,
            );
            const barH = (d.revenue / maxVal) * chartH;
            const barTopY = padT + chartH - barH;
            const aboveY = barTopY - tipH - 8;
            const tipY = Math.min(
              Math.max(aboveY >= padT ? aboveY : barTopY + 8, padT),
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
                  y={tipY + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#F0D9A8"
                >
                  {d.label} ({hovered.set === "cur" ? "Hiện tại" : "Trước"})
                </text>
                <text
                  x={tipX + tipW / 2}
                  y={tipY + 30}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#C8973A"
                >
                  {formatVNDShort(d.revenue)}
                </text>
                <text
                  x={tipX + tipW / 2}
                  y={tipY + 44}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#80604A"
                >
                  {d.orders} đơn hàng
                </text>
              </g>
            );
          })()}

        <rect x={padL} y={4} width={10} height={10} rx="2" fill="#6F4E37" />
        <text x={padL + 13} y={13} fontSize="10" fill="#6F4E37">
          Hiện tại
        </text>
        <rect
          x={padL + 65}
          y={4}
          width={10}
          height={10}
          rx="2"
          fill="#E2C9A8"
        />
        <text x={padL + 78} y={13} fontSize="10" fill="#80604A">
          Kỳ trước
        </text>
      </svg>
    </div>
  );
}
