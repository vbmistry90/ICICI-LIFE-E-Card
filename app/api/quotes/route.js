import { NextResponse } from "next/server";
import { db, ObjectId } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(req) {
  const id = new URL(req.url).searchParams.get("id"), c = (await db()).collection("quotes");
  if (id) { let q; try { q = await c.findOne({ _id: new ObjectId(id) }); } catch {} return q && q.status !== "Draft" ? NextResponse.json(q) : NextResponse.json({ error: "Quote not found" }, { status: 404 }); }
  const l = await c.find({ status: "Active" }, { projection: { banner: 0, features: 0, description: 0 } }).limit(100).toArray();
  const s = (x) => (x.views || 0) + 2 * (x.shares || 0);
  return NextResponse.json(l.filter((x) => s(x) > 0).sort((a, b) => s(b) - s(a)).slice(0, 6));
}
export async function POST(req) {
  const { id, type } = await req.json(); if (!["view", "share"].includes(type)) return NextResponse.json({ error: "bad" }, { status: 400 });
  try { await (await db()).collection("quotes").updateOne({ _id: new ObjectId(id) }, { $inc: { [type === "view" ? "views" : "shares"]: 1 } }); } catch { return NextResponse.json({ error: "bad" }, { status: 400 }); }
  return NextResponse.json({ ok: true });
}
