import { LoadingSpinner } from "./loading-spinner"

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = "読み込み中..." }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  )
}
