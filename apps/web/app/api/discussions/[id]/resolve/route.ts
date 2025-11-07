import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DiscussionModel } from "@/lib/models/Discussion";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { isResolved } = await request.json();
  const updated = await DiscussionModel.findByIdAndUpdate(
    params.id,
    { isResolved: Boolean(isResolved) },
    { new: true },
  );
  return NextResponse.json({ data: updated });
}
