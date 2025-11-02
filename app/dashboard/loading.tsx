export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-neutral-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-6 w-96 bg-neutral-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Scenarios grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-neutral-200 rounded-lg p-6 bg-white">
              <div className="h-6 w-3/4 bg-neutral-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-neutral-200 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-neutral-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-neutral-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
