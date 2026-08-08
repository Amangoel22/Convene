import { MetricCard } from "@/components/common/MetricCard";
import { metrics } from "@/data/dashboard";

export function MetricsGrid() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" aria-label="Event metrics">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </section>
  );
}
