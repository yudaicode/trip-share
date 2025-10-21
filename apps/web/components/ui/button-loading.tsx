import { LoadingSpinner } from "./loading-spinner"

interface ButtonLoadingProps {
  text?: string
}

export function ButtonLoading({ text = "処理中..." }: ButtonLoadingProps) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" className="border-current" />
      <span>{text}</span>
    </div>
  )
}
