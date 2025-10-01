// app/api/cabins/[cabinId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCabin, getBookedDatesByCabinId } from "@/app/_lib/data-service";

// ✅ GET handler for fetching a cabin and its booked dates
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cabinId: string }> } // 👈 Promise to satisfy Next.js validator
) {
  const { cabinId } = await context.params; // 👈 must await because of type mismatch in Next.js

  try {
    const cabin = await getCabin(cabinId);
    const bookedDates = await getBookedDatesByCabinId(cabinId);

    return NextResponse.json({ cabin, bookedDates });
  } catch (error) {
    console.error("Error fetching cabin:", error);
    return NextResponse.json(
      { message: "Error fetching cabin" },
      { status: 500 }
    );
  }
}

// ✅ Example POST handler (optional)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ cabinId: string }> }
) {
  const { cabinId } = await context.params;

  try {
    const body = await request.json();
    // Example: You could create a booking here using body data
    return NextResponse.json({
      message: `Booking created for cabin ${cabinId}`,
      data: body,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { message: "Error creating booking" },
      { status: 500 }
    );
  }
}
