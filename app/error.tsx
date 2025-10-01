"use client";

import { useEffect } from "react";

// Define the props type for the error boundary
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex justify-center items-center flex-col gap-6">
      <h1 className="text-3xl font-semibold">Something went wrong!</h1>
      <p className="text-lg text-red-500">{error.message}</p>

      <button
        onClick={() => reset()}
        className="inline-block bg-accent-500 text-primary-800 px-6 py-3 text-lg rounded-lg hover:bg-accent-600 transition"
      >
        Try again
      </button>
    </main>
  );
}
