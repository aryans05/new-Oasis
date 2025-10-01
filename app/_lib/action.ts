// app/_lib/action.ts
"use server";

import { auth, signIn, signOut } from "./auth";
import { getBookings, getCabinPrice } from "./data-service";
import supabase from "./supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

//////////////////////////////////////////
// Update guest
export async function updateGuest(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = (formData.get("nationalID") as string)?.trim() || "";
  const nationality = (formData.get("nationality") as string) || null;
  const countryFlag = (formData.get("countryFlag") as string) || null;

  if (!/^[a-zA-Z0-9-\s]{6,20}$/.test(nationalID)) {
    throw new Error("Please provide a valid national ID");
  }

  const updateData = { nationality, countryFlag, nationalID };

  const { error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("email", session.user.email);

  if (error) {
    console.error("❌ Supabase error in updateGuest:", error);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

//////////////////////////////////////////
// INTERNAL helper for booking creation
async function createBookingInternal(
  bookingData: {
    cabinId: string;
    startDate: string;
    endDate: string;
    numNight: number;
  },
  formFields: {
    numGuests?: number;
    observations?: string;
  }
) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (guestError || !guest) throw new Error("Guest not found");

  // ✅ recompute price on the server
  const { regularPrice, discount } = await getCabinPrice(bookingData.cabinId);
  const cabinPrice = bookingData.numNight * (regularPrice - discount);

  const newBooking = {
    cabinId: bookingData.cabinId,
    startDate: bookingData.startDate,
    endDate: bookingData.endDate,
    numNight: bookingData.numNight,
    guestId: guest.id,
    numGuests: Number(formFields.numGuests ?? 1),
    observations: (formFields.observations ?? "").slice(0, 1000),
    cabinPrice,
    extrasPrice: 0,
    totalPrice: cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { data: createdBooking, error } = await supabase
    .from("bookings")
    .insert([newBooking])
    .select("id, startDate, endDate, guestId, cabinId, totalPrice")
    .single();

  if (error || !createdBooking) {
    console.error("❌ Supabase error in createBookingInternal:", error);
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  return createdBooking;
}

//////////////////////////////////////////
// Server action for <form action={...}>
export async function createBookingAction(formData: FormData): Promise<void> {
  const cabinId = String(formData.get("cabinId") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const numNightRaw = formData.get("numNight");
  const numNight = numNightRaw ? Number(numNightRaw) : 0;

  if (!cabinId || !startDate || !endDate || !numNight) {
    throw new Error("Missing booking information");
  }

  const numGuests = Number(formData.get("numGuests") ?? 1);
  const observations = String(formData.get("observations") ?? "");

  await createBookingInternal(
    { cabinId, startDate, endDate, numNight },
    { numGuests, observations }
  );

  redirect("/cabins/thankyou");
}

//////////////////////////////////////////
// Programmatic booking creation (not for <form>)
export async function createBooking(bookingData: any, formData: FormData) {
  const numGuests = Number(formData.get("numGuests") ?? 1);
  const observations = String(formData.get("observations") ?? "");

  const created = await createBookingInternal(
    {
      cabinId: bookingData.cabinId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      numNight: bookingData.numNight,
    },
    { numGuests, observations }
  );

  return { booking: created };
}

//////////////////////////////////////////
// Delete reservation
export async function deleteReservation(formData: FormData): Promise<void> {
  const bookingId = String(formData.get("bookingId"));
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (guestError || !guest) throw new Error("Guest not found");

  const guestBookings = await getBookings(guest.id);
  const guestBookingIds = guestBookings.map((b) => String(b.id));

  if (!guestBookingIds.includes(bookingId)) {
    throw new Error("You are not allowed to delete this booking");
  }

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error("❌ Supabase error in deleteReservation:", error);
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

//////////////////////////////////////////
// Update booking
export async function updateBooking(formData: FormData): Promise<void> {
  const bookingId = String(formData.get("bookingId"));
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (guestError || !guest) throw new Error("Guest not found");

  const guestBookings = await getBookings(guest.id);
  const guestBookingIds = guestBookings.map((b) => String(b.id));

  if (!guestBookingIds.includes(bookingId)) {
    throw new Error("You are not allowed to update this booking");
  }

  const updateData = {
    numGuests: Number(formData.get("numGuests")) || 1,
    observations:
      (formData.get("observations") as string)?.slice(0, 1000) || "",
  };

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) {
    console.error("❌ Supabase error in updateBooking:", error);
    throw new Error("Booking could not be updated");
  }

  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");
}

//////////////////////////////////////////
// Auth helpers
export async function signInAction(): Promise<void> {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
