// app/cabins/[cabinId]/page.tsx
import Reservation from "@/app/_components/Reservation";
import Spinner from "@/app/_components/Spinner";
import TextExpander from "@/app/_components/TextExpander";
import {
  getCabin,
  getCabins,
  getBookedDatesByCabinId,
  getSettings,
} from "@/app/_lib/data-service";
import { auth } from "@/app/_lib/auth";
import { EyeSlashIcon, MapPinIcon, UsersIcon } from "@heroicons/react/24/solid";
import { Suspense } from "react";

// ✅ Params type
interface PageParams {
  params: { cabinId: string }; // plain object, not Promise
}

// ✅ Cabin type (aligned with DB)
type Cabin = {
  id: string;
  name: string;
  maxCapacity: number;
  image: string;
  description: string;
};

// ✅ Dynamic <title> for SEO
export async function generateMetadata({ params }: PageParams) {
  const { cabinId } = params;
  const { name } = await getCabin(cabinId);
  return { title: `Cabin ${name}` };
}

// ✅ Pre-render paths at build time
export async function generateStaticParams() {
  const cabins = await getCabins();
  return cabins.map((cabin: { id: string }) => ({
    cabinId: String(cabin.id),
  }));
}

// ✅ Page Component
export default async function Page({ params }: PageParams) {
  const { cabinId } = params;

  // Fetch data in parallel
  const [cabin, bookedDates, settings, session] = await Promise.all([
    getCabin(cabinId),
    getBookedDatesByCabinId(cabinId),
    getSettings(),
    auth(),
  ]);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
      {/* Cabin Image + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_4fr] gap-10 lg:gap-20 border border-primary-800 py-6 px-6 sm:px-8 lg:px-10 mb-16 lg:mb-24">
        <div className="relative">
          <img
            src={cabin.image}
            alt={`Cabin ${cabin.name}`}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>

        <div>
          <h3 className="text-accent-100 font-black text-4xl sm:text-5xl lg:text-7xl mb-6 bg-primary-950 p-4 sm:p-6 pb-2 inline-block rounded-lg">
            Cabin {cabin.name}
          </h3>

          <p className="text-base sm:text-lg text-primary-300 mb-8">
            <TextExpander>{cabin.description}</TextExpander>
          </p>

          <ul className="flex flex-col gap-4 mb-7">
            <li className="flex gap-3 items-center">
              <UsersIcon className="h-5 w-5 text-primary-600" />
              <span className="text-base sm:text-lg">
                For up to <span className="font-bold">{cabin.maxCapacity}</span>{" "}
                guests
              </span>
            </li>
            <li className="flex gap-3 items-center">
              <MapPinIcon className="h-5 w-5 text-primary-600" />
              <span className="text-base sm:text-lg">
                Located in the heart of the{" "}
                <span className="font-bold">Dolomites</span> (Italy)
              </span>
            </li>
            <li className="flex gap-3 items-center">
              <EyeSlashIcon className="h-5 w-5 text-primary-600" />
              <span className="text-base sm:text-lg">
                Privacy <span className="font-bold">100%</span> guaranteed
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Reservation Widget */}
      <div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-center mb-8">
          Reserve {cabin.name} today. Pay on arrival.
        </h2>

        <Suspense fallback={<Spinner />}>
          <Reservation
            cabinId={cabinId}
            bookedDates={bookedDates}
            settings={settings}
            user={session?.user ?? null}
          />
        </Suspense>
      </div>
    </div>
  );
}
