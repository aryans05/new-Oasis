// app/_lib/action.ts
"use server";

import { auth, signIn, signOut } from "./auth";
import { getBookings, getCabinPrice } from "./data-service";
import supabase from "./supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

//////////////////////////////////////////
// Update guest
export async function updateGuest(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = (formData.get("nationalID") as string)?.trim() || "";
  const nationality = (formData.get("nationality") as string) || null;
  const countryFlag = (formData.get("countryFlag") as string) || null;

  if (!/^[a-zA-Z0-9-\s]{6,20}$/.test(nationalID)) {
    throw new Error("Please provide a valid national ID");
  }

  const updateData = { nationality, countryFlag, nationalID };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("email", session.user.email)
    .select("id, email, fullName, nationality, nationalID, countryFlag")
    .single();

  if (error || !data) {
    console.error("Supabase error in updateGuest:", error);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
  return { guest: data };
}

//////////////////////////////////////////
// INTERNAL: low-level create booking helper (used by both programmatic callers
// and the createBookingAction server action). Returns created booking or throws.
async function createBookingInternal(
  bookingData: {
    cabinId: string;
    startDate: string;
    endDate: string;
    numNight: number;
    // optional extras can be present
  },
  formFields: {
    numGuests?: number;
    observations?: string;
  }
) {
  // Authenticate server-side
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // Find guest
  const { data: guest } = await supabase
    .from("guests")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!guest) throw new Error("Guest not found");

  // Recompute price server-side
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
    console.error("Supabase error in createBookingInternal:", error);
    throw new Error("Booking could not be created");
  }

  // Revalidate cabin page so server components refresh
  revalidatePath(`/cabins/${bookingData.cabinId}`);

  return createdBooking;
}

//////////////////////////////////////////
// Server action intended to be used as a <form action={createBookingAction}>
// It extracts required fields from the FormData, calls the internal helper,
// and then performs a server redirect to the thank-you page.
export async function createBookingAction(formData: FormData) {
  // The form is expected to include these fields:
  // - cabinId (string)
  // - startDate (ISO string)
  // - endDate (ISO string)
  // - numNight (string or number)
  // - numGuests (optional)
  // - observations (optional)
  const cabinId = String(formData.get("cabinId") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const numNightRaw = formData.get("numNight");
  const numNight = numNightRaw ? Number(numNightRaw) : 0;

  if (!cabinId || !startDate || !endDate || !numNight) {
    throw new Error("Missing booking information");
  }

  const numGuestsRaw = formData.get("numGuests");
  const numGuests = numGuestsRaw ? Number(numGuestsRaw) : 1;
  const observations = String(formData.get("observations") ?? "");

  // Call internal helper which authenticates and inserts
  await createBookingInternal(
    { cabinId, startDate, endDate, numNight },
    { numGuests, observations }
  );

  // Server redirect to thank-you page (this returns a 3xx to the browser)
  redirect("/cabins/thankyou");
}

//////////////////////////////////////////
// For backwards-compat or programmatic server usage you can still export
// a function that accepts bookingData + formData and reuses the internal helper.
export async function createBooking(bookingData: any, formData: FormData) {
  // build formFields from formData
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

  // return created booking for programmatic callers (does NOT redirect)
  return { booking: created };
}

//////////////////////////////////////////
// Delete reservation
export async function deleteReservation(formData: FormData) {
  const bookingId = String(formData.get("bookingId"));

  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const { data: guest } = await supabase
    .from("guests")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!guest) throw new Error("Guest not found");

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
    console.error("Supabase error in deleteReservation:", error);
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
  return { success: true };
}

//////////////////////////////////////////
// Update booking
export async function updateBooking(formData: FormData) {
  const bookingId = String(formData.get("bookingId"));

  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const { data: guest } = await supabase
    .from("guests")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (!guest) throw new Error("Guest not found");

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

  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select("id, startDate, endDate, guestId")
    .single();

  if (error || !data) {
    console.error("Supabase error in updateBooking:", error);
    throw new Error("Booking could not be updated");
  }

  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");
  return { booking: data };
}

//////////////////////////////////////////
// Auth helpers
export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
