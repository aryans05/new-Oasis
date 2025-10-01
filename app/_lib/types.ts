// app/_lib/types.ts

// ✅ Cabin type (matches Supabase `cabins` table)
export type Cabin = {
  id: string;
  name: string;
  maxCapacity: number;
  regularPrice: number;
  discount: number;
  image: string;
};

// ✅ Guest type (matches Supabase `guests` table)
export type Guest = {
  id: string;
  email: string;
  fullName: string;
  nationality: string | null;
  nationalID: string | null;
  countryFlag: string | null;
};

// ✅ Booking type with joined cabin info
export type BookingWithCabin = {
  id: string;
  created_at: string;
  startDate: string;
  endDate: string;
  numNight: number;
  numGuests: number;
  totalPrice: number;
  guestId: string;
  cabinId: string;
  status?: string;

  // ✅ Normalized cabin object (not an array)
  cabin: {
    name: string;
    image: string;
  } | null;
};

// ✅ App settings type (from `settings` table)
export type Settings = {
  minBookingLength: number;
  maxBookingLength: number;
  maxGuestsPerBooking: number;
};

// ✅ Authenticated user type (aligned with NextAuth + Supabase guestId)
export type AppUser = {
  id: string; // Google user ID (from token.sub)
  guestId?: string | null; // Supabase guest.id, can be null if not linked
  name?: string | null;
  email?: string | null;
  image?: string | null;
};
