"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";
import { differenceInCalendarDays } from "date-fns";
import { createBookingAction } from "@/app/_lib/action"; // server action

interface User {
  id: string;
  guestId?: string;
  name?: string;
  email?: string;
  image?: string;
}

interface ReservationFormProps {
  cabinId: string;
  selectedDate: DateRange | undefined;
  settings: {
    minBookingLength: number;
    maxBookingLength: number;
    maxGuestsPerBooking: number;
  };
  user: User | null;
}

function ReservationForm({
  cabinId,
  selectedDate,
  settings,
  user,
}: ReservationFormProps) {
  const [numGuests, setNumGuests] = useState<number>(1);
  const [observations, setObservations] = useState<string>("");

  // compute nights for hidden input; set to 0 if dates missing
  const numNight =
    selectedDate?.from && selectedDate?.to
      ? differenceInCalendarDays(selectedDate.to, selectedDate.from)
      : 0;

  return (
    <div className="scale-[1.01]">
      {/* User Info Header */}
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex items-center gap-4">
        {user ? (
          <>
            {user.image && (
              <img
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full"
                src={user.image}
                alt={user.name ?? "User avatar"}
              />
            )}
            <p>{user.name ?? user.email ?? "Guest"}</p>
          </>
        ) : (
          <p>Not logged in</p>
        )}
      </div>

      {/* Booking Form — NOTE: action={createBookingAction} is a server action */}
      <form
        action={createBookingAction}
        className="bg-primary-900 py-10 px-16 text-lg flex gap-5 flex-col"
      >
        {/* Hidden booking metadata for the server action */}
        <input type="hidden" name="cabinId" value={cabinId} />
        <input
          type="hidden"
          name="startDate"
          value={selectedDate?.from ? selectedDate.from.toISOString() : ""}
        />
        <input
          type="hidden"
          name="endDate"
          value={selectedDate?.to ? selectedDate.to.toISOString() : ""}
        />
        <input type="hidden" name="numNight" value={String(numNight)} />

        {/* Guests selector */}
        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            value={numGuests}
            onChange={(e) => setNumGuests(Number(e.target.value))}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="">Select number of guests...</option>
            {Array.from(
              { length: settings.maxGuestsPerBooking },
              (_, i) => i + 1
            ).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        {/* Observations */}
        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            placeholder="Any pets, allergies, special requirements, etc.?"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end items-center gap-6">
          <button
            type="submit"
            disabled={!user || numNight < settings.minBookingLength}
            className="bg-accent-500 px-8 py-4 text-primary-800 font-semibold hover:bg-accent-600 transition-all disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300"
          >
            Reserve now
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;
