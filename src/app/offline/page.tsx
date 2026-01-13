'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-2xl mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18.36 6.64a9 9 0 1 1 0 12.73 12.73l-2-2 0 0-1-1.41-1.41 0 0-1.42 0-0-1.41-1.41-4.24 4.24-5.66 5.66-12.73 0-1 1.41 0-1.41-2 2-2zm-2-2a9 9 0 1 1-1.41-1.41 0 0-1.42 0-0-1.41-1.41-4.24-4.24-5.66-5.66-12.73-1.41-1.41 1.41-1.41 2 2 0 0 1.41 1.41 4.24 4.24 5.66 5.66 12.73-1.41-1.41-1.41-1.41 2 2zm0-14a1 1 0 0 0-2 0 1 1 0 0 0 2 0zm0 14a1 1 0 0 0-2 0 1 1 0 0 0 2 0z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-6">
          Check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 15.356 2H15" />
            <path d="M3 12a9 9 0 1 0 18 0" />
          </svg>
          Reload
        </button>
        <p className="text-sm text-gray-500 mt-8">
          Some features may not be available while offline.
        </p>
      </div>
    </div>
  )
}
