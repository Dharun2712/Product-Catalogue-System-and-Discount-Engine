export default function LoadingSkeleton({ count = 8, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card">
            <div className="aspect-square skeleton" />
            <div className="p-4 space-y-3">
              <div className="h-3 skeleton rounded w-1/3" />
              <div className="h-4 skeleton rounded w-3/4" />
              <div className="h-4 skeleton rounded w-1/2" />
              <div className="flex justify-between items-center">
                <div className="h-6 skeleton rounded w-1/4" />
                <div className="h-10 w-10 skeleton rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-14 skeleton rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-8 skeleton rounded w-full" />
      ))}
    </div>
  );
}
