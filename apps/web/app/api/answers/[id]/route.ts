import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { AnswerModel } from "@/lib/models/Answer";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const payload = await request.json();
  const updated = await AnswerModel.findByIdAndUpdate(params.id, payload, { new: true });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  await AnswerModel.findByIdAndDelete(params.id);
  return NextResponse.json({}, { status: 204 });
}
