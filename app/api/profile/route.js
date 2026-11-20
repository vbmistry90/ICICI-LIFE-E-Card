import { NextResponse } from "next/server";
import { db, isAuthed } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const p = await (await db()).collection("profile").findOne({ _id: "main" });
  if (p) delete p._id; return NextResponse.json(p || {});
}
export async function PUT(req) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json(); const keys = ["name", "designation", "code", "phone", "wa", "email", "addr", "tagline", "photo"], d = {};
  if (typeof b.showPopular === "boolean") d.showPopular = b.showPopular;
  for (const k of keys) if (typeof b[k] === "string") d[k] = b[k].slice(0, k === "photo" ? 400000 : 300);
  await (await db()).collection("profile").updateOne({ _id: "main" }, { $set: d }, { upsert: true });
  return NextResponse.json({ ok: true });
}
