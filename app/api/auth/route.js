import { NextResponse } from "next/server";
import { makeToken } from "@/lib/db";
export async function POST(req) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  const r = NextResponse.json({ ok: true });
  r.cookies.set("adm", makeToken(), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 604800 });
  return r;
}
export async function DELETE() { const r = NextResponse.json({ ok: true }); r.cookies.delete("adm"); return r; }
