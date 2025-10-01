import { NextResponse } from "next/server";
import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";

// ✅ GET /api/cabins/[cabinId]
export async function GET(
  _request: Request,
  { params }: { params: { cabinId: string } }
) {
  const { cabinId } = params;

  try {
    const [cabin, bookedDates] = await Promise.all([
      getCabin(cabinId),
      getBookedDatesByCabinId(cabinId),
    ]);

    return NextResponse.json({ cabin, bookedDates }, { status: 200 });
  } catch (error) {
    console.error("GET cabin error:", error);
    return NextResponse.json({ message: "Cabin not found" }, { status: 404 });
  }
}

// ✅ Example POST (for later)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // do something with body
    return NextResponse.json({ message: "POST request successful", body });
  } catch (error) {
    console.error("POST cabin error:", error);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
