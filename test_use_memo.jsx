import React, { useMemo } from 'react';

export default function TestComp({ quotations }) {
  const { sortedMonths, maxMonthlyCount } = useMemo(() => {
    const monthlyData = {};
    quotations.forEach((q) => {
      // Opt: extract "2023-10" directly from ISO string or Date object
      let key;
      if (typeof q.created_at === "string") {
          key = q.created_at.substring(0, 7);
      } else {
          const d = new Date(q.created_at);
          key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });
    const sorted = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
    const maxCount =
      sorted.length > 0 ? Math.max(...sorted.map((m) => m[1])) : 1;

    return { sortedMonths: sorted, maxMonthlyCount: maxCount };
  }, [quotations]);

  return null;
}
