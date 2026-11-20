import { NextResponse } from "next/server";
import { db, ObjectId, isAuthed } from "@/lib/db";
const OK = ["leads", "policies", "claims", "meetings", "checkins"];
const guard = (req, col) => !isAuthed(req) ? NextResponse.json({ error: "Unauthorized" }, { status: 401 }) : !OK.includes(col) ? NextResponse.json({ error: "Bad" }, { status: 404 }) : null;
export async function GET(req, { params }) {
  const g = guard(req, params.col); if (g) return g;
  return NextResponse.json(await (await db()).collection(params.col).find().sort({ _id: -1 }).limit(2000).toArray());
}
export async function POST(req, { params }) {
  const g = guard(req, params.col); if (g) return g;
  const b = await req.json(); delete b._id; b.createdAt = new Date().toISOString();
  await (await db()).collection(params.col).insertOne(b); return NextResponse.json({ ok: true });
}
export async function PUT(req, { params }) {
  const g = guard(req, params.col); if (g) return g;
  const { _id, ...b } = await req.json();
  await (await db()).collection(params.col).updateOne({ _id: new ObjectId(_id) }, { $set: b }); return NextResponse.json({ ok: true });
}
export async function DELETE(req, { params }) {
  const g = guard(req, params.col); if (g) return g;
  await (await db()).collection(params.col).deleteOne({ _id: new ObjectId(new URL(req.url).searchParams.get("id")) }); return NextResponse.json({ ok: true });
}
