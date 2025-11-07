import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DiscussionModel } from "@/lib/models/Discussion";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const payload = await request.json();
  const updated = await DiscussionModel.findByIdAndUpdate(params.id, payload, { new: true });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  await DiscussionModel.findByIdAndDelete(params.id);
  return NextResponse.json({}, { status: 204 });
}
