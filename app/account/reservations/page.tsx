import ReservationCard from "@/app/_components/ReservationCard";
import { getBookings } from "@/app/_lib/data-service";
import { auth } from "@/app/_lib/auth";
import supabase from "@/app/_lib/supabase";
import { BookingWithCabin } from "@/app/_lib/types";

export const metadata = {
  title: "Reservations",
};

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    return (
      <p className="text-lg text-red-400">
        You must be logged in to view your reservations.
      </p>
    );
  }

  const { data: guest, error } = await supabase
    .from("guests")
    .select("id")
    .eq("email", session.user.email)
    .single();

  if (error || !guest) {
    return (
      <p className="text-lg text-red-400">
        No guest profile found. Please update your profile first.
      </p>
    );
  }

  const bookings = await getBookings(guest.id);

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Your reservations
      </h2>

      {bookings.length === 0 ? (
        <p className="text-lg">
          You have no reservations yet. Check out our{" "}
          <a className="underline text-accent-500" href="/cabins">
            luxury cabins &rarr;
          </a>
        </p>
      ) : (
        <ul className="space-y-6">
          {bookings.map((booking: BookingWithCabin) => (
            <ReservationCard booking={booking} key={booking.id} />
          ))}
        </ul>
      )}
    </div>
  );
}
