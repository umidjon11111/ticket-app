export default function OrderSkeleton() {
  return (
    <div className="animate-pulse border w-full p-4 rounded-xl shadow">
      <div className="flex justify-between mb-4">
        <div className="h-6 w-40 bg-gray-300 rounded"></div>
        <div className="h-6 w-10 bg-gray-300 rounded"></div>
      </div>

      <div className="space-y-2">
        <div className="h-4 w-56 bg-gray-200 rounded"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
        <div className="h-4 w-40 bg-gray-200 rounded"></div>
      </div>

      <div className="mt-4 h-5 w-32 bg-gray-300 rounded"></div>

      <div className="mt-4 space-y-2">
        <div className="h-10 w-full bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
