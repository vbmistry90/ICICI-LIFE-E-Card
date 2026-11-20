import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
export async function GET(req) {
  if (new URL(req.url).searchParams.get("key") !== process.env.CRON_SECRET) return NextResponse.json({ error: "no" }, { status: 401 });
  const c = (await db()).collection("policies");
  const due = await c.find({ status: "Active", nextDue: { $lte: d(7) } }).toArray();
  const fresh = due.filter((p) => p.remindedFor !== p.nextDue);
  if (!fresh.length) return NextResponse.json({ sent: 0 });
  const t = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  const line = (p) => `${p.clientName} | ${p.plan} | Policy ${p.policyNo} | Rs ${p.premium} | due ${p.nextDue} | ${p.phone}`;
  await t.sendMail({ from: process.env.SMTP_USER, to: process.env.ADVISOR_EMAIL, subject: `${fresh.length} premium(s) due within 7 days`, text: fresh.map(line).join("\n") });
  for (const p of fresh) {
    if (p.email) await t.sendMail({ from: process.env.SMTP_USER, to: p.email, subject: "Premium due reminder",
      text: `Dear ${p.clientName},\n\nYour ${p.plan} premium of Rs ${p.premium} (Policy ${p.policyNo}) is due on ${p.nextDue}. Please pay on time to keep your cover active.\n\nRegards,\nVivekkumar Mistry\nICICI Prudential Life Insurance Advisor\n+91 8469672572` }).catch(() => {});
    await c.updateOne({ _id: p._id }, { $set: { remindedFor: p.nextDue } });
  }
  return NextResponse.json({ sent: fresh.length });
}
