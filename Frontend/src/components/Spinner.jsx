"use client"

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default Spinner

