import { NextResponse } from "next/server";
import { db, ObjectId } from "@/lib/db";
export async function GET(req) {
  const id = new URL(req.url).searchParams.get("id"); const c = (await db()).collection("meetings");
  if (id) { let m; try { m = await c.findOne({ _id: new ObjectId(id) }); } catch {} return m ? NextResponse.json(m) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
  const from = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  return NextResponse.json(await c.find({ status: "Upcoming", date: { $gte: from } }).sort({ date: 1 }).limit(4).toArray());
}
