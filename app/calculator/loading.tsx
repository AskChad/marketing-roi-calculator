export default function CalculatorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-12">
      <div className="container mx-auto px-4">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center space-x-4">
          <div className="w-16 h-16 bg-neutral-200 rounded-lg animate-pulse"></div>
          <div>
            <div className="h-10 w-64 bg-neutral-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-6 w-96 bg-neutral-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Calculator form skeleton */}
        <div className="bg-white border border-neutral-200 rounded-lg p-8">
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse"></div>
                <div className="h-12 w-full bg-neutral-200 rounded-lg animate-pulse"></div>
              </div>
            ))}
            <div className="h-12 w-full bg-neutral-200 rounded-lg animate-pulse mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
