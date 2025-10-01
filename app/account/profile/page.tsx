import UpdateProfileForm from "@/app/_components/UpdateProfileForm";
import { auth } from "@/app/_lib/auth";
import { getGuest, getCountries } from "@/app/_lib/data-service";
import { updateGuest } from "@/app/_lib/action";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Update profile",
};

export default async function Page() {
  const session = await auth();

  // 🔐 Protect route
  if (!session) {
    redirect("/login"); // or handle unauthorized differently
  }

  // 🧑 Fetch guest
  const guest = await getGuest(session.user.email);

  if (!guest) {
    throw new Error("Guest not found"); // or redirect("/account/setup")
  }

  // 🌍 Fetch countries
  const countries = await getCountries();

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-4">
        Update your guest profile
      </h2>

      <p className="text-lg mb-8 text-primary-200">
        Providing the following information will make your check-in process
        faster and smoother. See you soon!
      </p>

      <UpdateProfileForm
        guest={guest}
        countries={countries}
        onSubmit={updateGuest}
      />
    </div>
  );
}
