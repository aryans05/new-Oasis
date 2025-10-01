"use client";

import { deleteReservation } from "../_lib/action";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useFormStatus } from "react-dom";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex items-center gap-2 uppercase text-xs font-bold text-primary-300 flex-grow px-3 
                 hover:bg-accent-600 transition-colors hover:text-primary-900 disabled:opacity-50"
    >
      <TrashIcon className="h-5 w-5 text-primary-600 group-hover:text-primary-800 transition-colors" />
      <span className="mt-1">{pending ? "Deleting..." : "Delete"}</span>
    </button>
  );
}

export default function DeleteReservation({
  bookingId,
}: {
  bookingId: string;
}) {
  return (
    <form action={deleteReservation}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <DeleteButton />
    </form>
  );
}
