import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-blue-600 border-gray-200",
        sizeClasses[size],
        className
      )}
    />
  )
}
