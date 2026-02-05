export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-gray-200 rounded-lg mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="h-4 w-32 bg-gray-200 rounded mb-3 animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}