"use client";

import { useState } from "react";

interface CounterProps {
  users: number; // or string[], or any shape your "users" data has
}

export default function Counter({ users }: CounterProps) {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg">Users: {users}</p>
      <p className="text-lg">Count: {count}</p>

      <button
        onClick={() => setCount((c) => c + 1)}
        className="bg-accent-500 text-primary-900 px-4 py-2 rounded hover:bg-accent-600"
      >
        Increment
      </button>
    </div>
  );
}
