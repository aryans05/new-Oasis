"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Filter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("capacity") ?? "all";

  const filters = [
    { id: "all", label: "All cabins" },
    { id: "small", label: "1–3 guests" },
    { id: "medium", label: "4–7 guests" },
    { id: "large", label: "8–12 guests" },
  ];

  function handleClick(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") {
      params.delete("capacity");
    } else {
      params.set("capacity", id);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="border border-primary-700 flex rounded-lg overflow-hidden bg-primary-900/40">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleClick(filter.id)}
          className={`px-5 py-2 transition-colors duration-200 ${
            active === filter.id
              ? "bg-primary-100 text-primary-900 font-medium"
              : "text-primary-200 hover:bg-primary-800/60"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
