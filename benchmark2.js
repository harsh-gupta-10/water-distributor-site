import { performance } from 'perf_hooks';

// Simulate quotations data
const generateQuotations = (num) => {
  const quotations = [];
  for (let i = 0; i < num; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - Math.floor(Math.random() * 12));
    quotations.push({
      created_at: d.toISOString(),
      products: ['Product A', 'Product B']
    });
  }
  return quotations;
};

const quotations = generateQuotations(100000);

const runOptimized = () => {
  const start = performance.now();

  // Simulated useMemo usage
  const { sortedMonths, maxMonthlyCount } = (() => {
    const monthlyData = {};
    quotations.forEach((q) => {
      // Opt: use string slicing instead of Date parsing
      // assuming created_at is ISO string e.g. "2023-10-15T..."
      // extract "2023-10"
      const key = q.created_at.substring(0, 7);
      monthlyData[key] = (monthlyData[key] || 0) + 1;
    });
    const sortedMonths = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
    const maxMonthlyCount =
      sortedMonths.length > 0 ? Math.max(...sortedMonths.map((m) => m[1])) : 1;
    return { sortedMonths, maxMonthlyCount };
  })();

  const end = performance.now();
  return end - start;
};

let totalTime = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
  totalTime += runOptimized();
}

console.log(`Average Optimized Time (simulating useMemo with 1st execution + string slice): ${totalTime / iterations} ms`);

const runOptimizedCached = () => {
  const start = performance.now();
  const cachedData = { sortedMonths: [], maxMonthlyCount: 1 }; // simulate cached value
  const end = performance.now();
  return end - start;
};

let totalCachedTime = 0;
for (let i = 0; i < iterations; i++) {
  totalCachedTime += runOptimizedCached();
}

console.log(`Average Cached Time: ${totalCachedTime / iterations} ms`);
