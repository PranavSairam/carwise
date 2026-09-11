"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { OwnershipCostBreakdown } from "@/types/finance";
import { formatINR } from "@/lib/formatters/currency";

const COLORS = ["#0D9488", "#0F766E", "#14B8A6", "#5EEAD4", "#99F6E4"];

export function OwnershipBreakdownChart({
  ownership,
  height = 240,
}: {
  ownership: OwnershipCostBreakdown;
  height?: number;
}) {
  const data = [
    { name: "EMI", value: Math.round(ownership.emi) },
    { name: "Fuel / electricity", value: Math.round(ownership.fuel) },
    { name: "Insurance", value: Math.round(ownership.insurance) },
    { name: "Maintenance", value: Math.round(ownership.maintenance) },
    { name: "Tyres", value: Math.round(ownership.tyresConsumables) },
    {
      name: "FASTag / tolls",
      value: Math.round(ownership.fastag ?? 0),
    },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No ownership costs to chart.</p>
    );
  }

  return (
    <div style={{ width: "100%", height }} className="motion-safe:animate-in">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              formatINR(typeof value === "number" ? value : Number(value) || 0)
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
