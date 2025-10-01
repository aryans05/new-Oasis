// app/_lib/types.ts

export type Cabin = {
  id: string;
  name: string;
  maxCapacity: number;
  regularPrice: number;
  discount: number;
  image: string;
};

export type Guest = {
  id: string;
  email: string;
  fullName: string;
  nationality: string | null;
  nationalID: string | null;
  countryFlag: string | null;
};

export type BookingWithCabin = {
  id: string;
  created_at: string;
  startDate: string;
  endDate: string;
  numNight: number; // ✅ matches DB column
  numGuests: number;
  totalPrice: number;
  guestId: string;
  cabinId: string;
  status?: string;
  cabins: {
    name: string;
    image: string;
  };
};

export type Settings = {
  minBookingLength: number;
  maxBookingLength: number;
  maxGuestsPerBooking: number;
};
