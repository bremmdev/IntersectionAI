import { connectDB } from "@/mongodb/db";
import { User, IUser } from "@/mongodb/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const userId = searchParams.get("userId");
  await connectDB();
  const user: IUser | null = await User.findOne({ userId });

  return NextResponse.json(user?.translations || []);
}
