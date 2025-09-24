'use client'

import { useEffect } from 'react'
import { Button } from '@saasfly/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  const handleReset = () => {
    reset()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Something went wrong!
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          We apologize for the inconvenience. An error occurred while loading this page.
        </p>
        <Button
          onClick={handleReset}
          className="mr-2"
        >
          Try again
        </Button>
        <Button
          variant="outline"
          onClick={handleGoHome}
        >
          Go home
        </Button>
      </div>
    </div>
  )
}