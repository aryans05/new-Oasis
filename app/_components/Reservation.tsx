"use client";

import { useState } from "react";
import DateSelector from "./DateSelector";
import ReservationForm from "./ReservationForm";
import { DateRange } from "react-day-picker";
import LoginMessage from "./LoginMessage";
import type { User as NextAuthUser } from "next-auth"; // ✅ official NextAuth type

// App settings type
interface Settings {
  minBookingLength: number;
  maxBookingLength: number;
  maxGuestsPerBooking: number;
}

// ✅ AppUser type aligned with next-auth.d.ts augmentation
type AppUser = NextAuthUser & {
  id: string; // always string (token.sub)
  guestId?: string | null; // ✅ allow null OR undefined
};

interface ReservationProps {
  cabinId: string;
  bookedDates: (Date | string)[];
  settings: Settings;
  user: AppUser | null; // ✅ now consistent
}

export default function Reservation({
  cabinId,
  bookedDates,
  settings,
  user,
}: ReservationProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border border-primary-800 rounded-lg p-6 min-h-[400px] mb-10 text-accent-400">
      {/* ✅ Date picker */}
      <DateSelector
        settings={settings}
        bookedDates={bookedDates}
        cabinId={cabinId}
        selectedDate={selectedRange}
        onChange={setSelectedRange}
      />

      {/* ✅ Show form if logged in, otherwise login prompt */}
      {user ? (
        <ReservationForm
          cabinId={cabinId}
          selectedDate={selectedRange}
          settings={settings}
          user={{
            ...user,
            // normalize null → undefined for React components
            name: user.name ?? undefined,
            email: user.email ?? undefined,
            image: user.image ?? undefined,
            guestId: user.guestId ?? undefined,
          }}
        />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}
