import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function POST(req) {
  const b = await req.json();
  const phone = String(b.phone || "").replace(/\D/g, "").slice(-10);
  if (!b.name || phone.length !== 10) return NextResponse.json({ error: "Valid name and 10-digit mobile required" }, { status: 400 });
  await (await db()).collection("leads").insertOne({
    name: String(b.name).slice(0, 80), phone, location: String(b.location || "").slice(0, 120),
    interest: String(b.interest || "").slice(0, 60), status: "New", notes: "",
    ua: req.headers.get("user-agent")?.slice(0, 120), createdAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
