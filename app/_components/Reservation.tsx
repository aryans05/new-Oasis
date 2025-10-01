"use client";

import { useState } from "react";
import DateSelector from "./DateSelector";
import ReservationForm from "./ReservationForm";
import { DateRange } from "react-day-picker";
import LoginMessage from "./LoginMessage";

// App settings type
interface Settings {
  minBookingLength: number;
  maxBookingLength: number;
  maxGuestsPerBooking: number;
}

// User type from NextAuth session
interface User {
  id: string; // NextAuth token.sub is always string
  guestId?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ReservationProps {
  cabinId: string;
  bookedDates: (Date | string)[];
  settings: Settings;
  user: User | null; // ✅ expect user directly, not whole session
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
      <DateSelector
        settings={settings}
        bookedDates={bookedDates}
        cabinId={cabinId}
        selectedDate={selectedRange}
        onChange={setSelectedRange}
      />

      {user ? (
        <ReservationForm
          cabinId={cabinId}
          selectedDate={selectedRange}
          settings={settings}
          user={user} // ✅ no TS error
        />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}
