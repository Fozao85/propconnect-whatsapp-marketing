import React from 'react'

const TestApp = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 PropConnect Test
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this, React is working!
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">✅ React loaded</p>
          <p className="text-sm text-gray-500">✅ Tailwind CSS working</p>
          <p className="text-sm text-gray-500">✅ Frontend server running</p>
        </div>
        <button 
          onClick={() => alert('Button works!')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test Button
        </button>
      </div>
    </div>
  )
}

export default TestApp
