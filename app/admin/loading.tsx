export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-neutral-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-6 w-96 bg-neutral-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-32 bg-neutral-200 rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-6 w-full bg-neutral-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
