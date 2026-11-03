"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SalesChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d08a3c" stopOpacity={0.35} />
              <stop offset="1" stopColor="#d08a3c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} interval="preserveStartEnd" minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
          <Tooltip
            formatter={(value, name) => (name === "revenue" ? [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"] : [value, "Orders"])}
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)" }}
          />
          <Area type="monotone" dataKey="revenue" stroke="#d08a3c" strokeWidth={2.5} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
