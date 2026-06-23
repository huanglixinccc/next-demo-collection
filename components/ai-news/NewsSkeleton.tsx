export function NewsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* 头条骨架 */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          <div className="flex gap-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
          </div>
        </div>
      </div>
      {/* 列表骨架 */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
          <div className="space-y-1 flex-shrink-0">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}
