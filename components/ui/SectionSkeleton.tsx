export default function SectionSkeleton({
  lines = 3,
  tall = false,
}: {
  lines?: number;
  tall?: boolean;
}) {
  return (
    <section
      aria-hidden="true"
      className={`mx-auto w-full max-w-7xl px-6 md:px-20 ${tall ? "py-32" : "py-24"}`}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-2 w-24 bg-foreground/10" />
        <div className="h-10 w-2/3 max-w-md bg-foreground/10" />
        <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: lines }, (_, index) => (
            <div key={index} className="h-24 w-full bg-foreground/[0.06]" />
          ))}
        </div>
      </div>
    </section>
  );
}
