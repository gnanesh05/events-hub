const DashboardLoading = () => (
  <section>
    <div className="text-center">
      <div className="h-8 w-40 bg-white/10 rounded mx-auto animate-pulse" />
      <div className="h-4 w-64 bg-white/10 rounded mx-auto mt-5 animate-pulse" />
    </div>

    <div className="flex justify-center gap-6 mt-10">
      <div className="h-6 w-28 bg-white/10 rounded animate-pulse" />
      <div className="h-6 w-20 bg-white/10 rounded animate-pulse" />
    </div>

    <ul className="events mt-14">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="list-none">
          <div className="animate-pulse space-y-3">
            <div className="h-[300px] w-full bg-white/10 rounded-lg" />
            <div className="h-4 w-3/4 bg-white/10 rounded" />
            <div className="h-4 w-1/2 bg-white/10 rounded" />
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export default DashboardLoading;
