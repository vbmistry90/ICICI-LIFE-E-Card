import { NextResponse } from "next/server";
import { db, ObjectId } from "@/lib/db";
export async function POST(req) {
  const b = await req.json(); const phone = String(b.phone || "").replace(/\D/g, "").slice(-10);
  if (!b.name || phone.length !== 10) return NextResponse.json({ error: "Valid name and 10-digit mobile required" }, { status: 400 });
  const d = await db(); let m; try { m = await d.collection("meetings").findOne({ _id: new ObjectId(b.meetingId) }); } catch {}
  if (!m || m.status === "Cancelled") return NextResponse.json({ error: "Meeting not available" }, { status: 404 });
  const today = new Date(Date.now() + 5.5 * 36e5).toISOString().slice(0, 10);
  const status = m.date === today ? "Attended" : "Registered", now = new Date().toISOString();
  await d.collection("checkins").updateOne({ meetingId: String(m._id), phone },
    { $set: { meetingTitle: m.title, name: String(b.name).slice(0, 80), location: String(b.location || "").slice(0, 120), guests: Math.min(+b.guests || 0, 20), status, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
  await d.collection("leads").updateOne({ phone }, { $setOnInsert: { name: String(b.name).slice(0, 80), phone, location: String(b.location || "").slice(0, 120), interest: "Meeting: " + m.title, status: "New", notes: "", createdAt: now } }, { upsert: true });
  return NextResponse.json({ ok: true, status });
}
