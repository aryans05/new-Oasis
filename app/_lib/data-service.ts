// app/_lib/data-service.ts
import { notFound } from "next/navigation";
import { eachDayOfInterval } from "date-fns";
import supabase from "./supabase";
import { BookingWithCabin } from "./types";

/////////////
// GET

export async function getCabin(id: string) {
  const { data, error } = await supabase
    .from("cabins")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getCabin error:", error || "No data");
    notFound();
  }

  return data;
}

export async function getCabinPrice(id: string) {
  const { data, error } = await supabase
    .from("cabins")
    .select("regularPrice, discount")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getCabinPrice error:", error || "No data");
    throw new Error("Cabin price could not be loaded");
  }

  return data;
}

export async function getCabins() {
  const { data, error } = await supabase
    .from("cabins")
    .select("id, name, maxCapacity, regularPrice, discount, image")
    .order("name");

  if (error) {
    console.error("getCabins error:", error);
    throw new Error("Cabins could not be loaded");
  }

  return data ?? [];
}

export async function getGuest(email: string) {
  const { data, error } = await supabase
    .from("guests")
    .select("id, email, fullName, nationality, nationalID, countryFlag")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("getGuest error:", error);
    throw new Error("Guest could not be loaded");
  }

  return data;
}

export async function getBooking(id: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getBooking error:", error || "No data");
    notFound();
  }

  return data;
}

export async function getBookings(
  guestId: string
): Promise<BookingWithCabin[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id, created_at, startDate, endDate, numNight, numGuests, totalPrice, guestId, cabinId, status,
      cabin: cabins ( id, name, image )
      `
    )
    .eq("guestId", guestId)
    .order("startDate");

  if (error) {
    console.error("getBookings error:", error);
    throw new Error("Bookings could not be loaded");
  }

  // ✅ Normalize and cast safely
  if (!data) return [];

  return data.map((b: any) => ({
    id: b.id,
    created_at: b.created_at,
    startDate: b.startDate,
    endDate: b.endDate,
    numNight: b.numNight,
    numGuests: b.numGuests,
    totalPrice: b.totalPrice,
    guestId: b.guestId,
    cabinId: b.cabinId,
    status: b.status,
    cabin: b.cabin
      ? {
          id: b.cabin.id,
          name: b.cabin.name,
          image: b.cabin.image,
        }
      : null,
  })) as BookingWithCabin[];
}

export async function getBookedDatesByCabinId(cabinId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("bookings")
    .select("startDate, endDate, status")
    .eq("cabinId", cabinId)
    .gte("endDate", today.toISOString());

  if (error) {
    console.error("getBookedDatesByCabinId error:", error);
    throw new Error("Booked dates could not be loaded");
  }

  return (data ?? [])
    .filter((b) => b.status === "checked-in" || new Date(b.endDate) >= today)
    .map((booking) =>
      eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      })
    )
    .flat();
}

export async function getSettings() {
  const { data, error } = await supabase.from("settings").select("*").single();

  if (error || !data) {
    console.error("getSettings error:", error || "No data");
    throw new Error("Settings could not be loaded");
  }

  return data;
}

export async function getCountries() {
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags"
    );
    if (!res.ok) throw new Error("Failed to fetch countries");
    return await res.json();
  } catch (err) {
    console.error("getCountries error:", err);
    throw new Error("Countries could not be loaded");
  }
}

/////////////
// CREATE

export async function createGuest(newGuest: any) {
  const { data, error } = await supabase
    .from("guests")
    .insert([newGuest])
    .select("id, email, fullName, nationality, nationalID, countryFlag")
    .single();

  if (error || !data) {
    console.error("createGuest error:", error || "No data");
    throw new Error("Guest could not be created");
  }

  return data;
}

export async function createBooking(newBooking: any) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    .select("id, startDate, endDate, guestId, cabinId, totalPrice")
    .single();

  if (error || !data) {
    console.error("createBooking error:", error);
    throw new Error("Booking could not be created");
  }

  return data;
}

/////////////
// UPDATE

export async function updateGuest(id: string, updatedFields: any) {
  const { data, error } = await supabase
    .from("guests")
    .update(updatedFields)
    .eq("id", id)
    .select("id, email, fullName, nationality, nationalID, countryFlag")
    .single();

  if (error || !data) {
    console.error("updateGuest error:", error || "No data");
    throw new Error("Guest could not be updated");
  }

  return data;
}

export async function updateBooking(id: string, updatedFields: any) {
  const { data, error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", id)
    .select("id, startDate, endDate, guestId")
    .single();

  if (error || !data) {
    console.error("updateBooking error:", error || "No data");
    throw new Error("Booking could not be updated");
  }

  return data;
}

/////////////
// DELETE

export async function deleteBooking(id: string) {
  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    console.error("deleteBooking error:", error);
    throw new Error("Booking could not be deleted");
  }

  return true;
}
