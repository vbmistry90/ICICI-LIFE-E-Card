"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Btn, MeetSk } from "@/components/Ui";
export default function Meeting() {
  const { id } = useParams(); const [m, setM] = useState(null), [err, setErr] = useState(""), [f, setF] = useState({ name: "", phone: "", location: "", guests: 0 }), [res, setRes] = useState(null), [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/meetings?id=" + id).then((r) => r.json()).then((j) => j.error ? setErr(j.error) : setM(j)); }, [id]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const go = async (e) => { e.preventDefault(); setBusy(true); const r = await fetch("/api/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, meetingId: id }) }); const j = await r.json(); setBusy(false); r.ok ? setRes(j.status) : alert(j.error); };
  if (err) return <div className="wrap"><div className="card">{err}</div></div>;
  if (!m) return <MeetSk />;
  const ymd = (m.date || "").replace(/-/g, ""), t = (m.time || "10:00").replace(":", "") + "00";
  const cal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(m.title)}&dates=${ymd}T${t}/${ymd}T${t}&location=${encodeURIComponent(m.venue || "")}&details=${encodeURIComponent(m.agenda || "")}`;
  return <><div className="bg"><i /><i /></div><div className="wrap">
    {m.banner && <img src={m.banner} alt="" style={{ width: "100%", borderRadius: 20, marginBottom: 16, animation: "up .7s both" }} />}
    <div className="card"><h1 style={{ textAlign: "left" }}>{m.title}</h1>
      <p className="sub" style={{ textAlign: "left" }}>📅 {m.date} · 🕒 {m.time}<br />📍 {m.venue}{m.status === "Cancelled" && <><br /><b style={{ color: "#ff6b6b" }}>This meeting is cancelled</b></>}</p>
      {m.agenda && <><h2 style={{ marginTop: 14 }}>Agenda</h2><p style={{ whiteSpace: "pre-line", fontSize: 14 }}>{m.agenda}</p></>}
      {m.description && <p style={{ marginTop: 10, fontSize: 14, opacity: .85, whiteSpace: "pre-line" }}>{m.description}</p>}
      <div className="grid" style={{ marginTop: 14 }}>{m.mapLink && <a className="btn" href={m.mapLink}>🗺️ Directions</a>}<a className="btn" href={cal} target="_blank">➕ Add to calendar</a></div></div>
    {m.status !== "Cancelled" && <div className="card">{res ? <h2>✅ {res === "Attended" ? "Checked in! Welcome." : "Registered! See you there."}</h2> :
      <form onSubmit={go}><h2>Check-in / RSVP</h2><input placeholder="Your name" value={f.name} onChange={set("name")} required /><input placeholder="Mobile number" inputMode="numeric" value={f.phone} onChange={set("phone")} required />
        <input placeholder="Location / City" value={f.location} onChange={set("location")} /><input type="number" min="0" placeholder="Guests coming with you" value={f.guests} onChange={set("guests")} /><Btn type="submit" className="btn p" style={{ width: "100%" }} busy={busy}>Check in</Btn></form>}</div>}
    <a className="btn" href="/">← Vivek Partner card</a></div></>;
}
