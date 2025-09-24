"use client";

import Link from "next/link";
import { Button } from "@saasfly/ui/button";

export default function NotFound() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900 dark:text-gray-100">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Page Not Found
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
