"use client";
import { useEffect, useState } from "react";
const A = { name: "Vivekkumar Mistry", code: "ICI01765238", phone: "+918469672572", wa: "918469672572",
  email: "vbmistry90@gmail.com", addr: "Kalyan Nagar Soc, Karan Gam, Karan, Surat, Gujarat 394305" };
const STATS = [[99.3, "% Claim Settlement", 1], [27900, "Cr Death Claims Paid", 0], [2.2, "Lakh+ Advisors", 1], [25, "Years of Trust", 0]];
const SERVICES = ["🛡️ Term Life Insurance", "💰 Savings & Guaranteed Return Plans", "📈 ULIP / Wealth Plans", "👶 Child Education Plans", "🏖️ Retirement & Pension Plans", "🏥 Health & Critical Illness Cover", "🔔 Premium Reminders & Claim Support"];
function Count({ to, dec }) {
  const [v, setV] = useState(0);
  useEffect(() => { let s = null; const f = (t) => { s ??= t; const k = Math.min((t - s) / 1800, 1); setV(to * k); k < 1 && requestAnimationFrame(f); }; requestAnimationFrame(f); }, [to]);
  return <b>{v.toLocaleString("en-IN", { maximumFractionDigits: dec })}</b>;
}
function LeadForm({ onDone, title }) {
  const [f, setF] = useState({ name: "", phone: "", location: "", interest: "Term Life Insurance" });
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const gps = () => navigator.geolocation?.getCurrentPosition(async (p) => {
    try { const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.coords.latitude}&lon=${p.coords.longitude}`); const j = await r.json();
      setF((x) => ({ ...x, location: [j.address?.suburb || j.address?.village, j.address?.city || j.address?.state_district, j.address?.state].filter(Boolean).join(", ") })); } catch {} });
  const go = async (e) => { e.preventDefault(); setBusy(true);
    const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    setBusy(false); if (r.ok) { localStorage.setItem("seen", "1"); setMsg("✅ Thank you! I will call you shortly."); setTimeout(() => onDone?.(), 1800); } else setMsg("❌ " + (await r.json()).error); };
  return <form onSubmit={go}><h2>{title}</h2>
    <input placeholder="Your name" value={f.name} onChange={set("name")} required />
    <input placeholder="Mobile number" inputMode="numeric" value={f.phone} onChange={set("phone")} required />
    <input placeholder="Location / City" value={f.location} onChange={set("location")} />
    <button type="button" className="btn" style={{ marginBottom: 10, width: "100%" }} onClick={gps}>📍 Use my current location</button>
    <select value={f.interest} onChange={set("interest")}>{["Term Life Insurance", "Savings Plan", "ULIP / Investment", "Child Plan", "Retirement Plan", "Health Cover", "Premium / Claim Help"].map((o) => <option key={o}>{o}</option>)}</select>
    <button className="btn p" style={{ width: "100%" }} disabled={busy}>{busy ? "Sending..." : "Request Free Callback"}</button>
    {msg && <p className="small" style={{ opacity: 1 }}>{msg}</p>}<p className="small">Your details are shared only with the advisor.</p></form>;
}
function Meetings() {
  const [ms, setMs] = useState([]);
  useEffect(() => { fetch("/api/meetings").then((r) => r.json()).then((j) => Array.isArray(j) && setMs(j)).catch(() => {}); }, []);
  if (!ms.length) return null;
  return <div className="card" style={{ animationDelay: ".4s" }}><h2>📅 Upcoming meetings</h2>{ms.map((m) => <a key={m._id} href={"/meeting/" + m._id} style={{ display: "block", marginBottom: 12 }}>
    {m.banner && <img src={m.banner} alt="" style={{ width: "100%", borderRadius: 12 }} />}<b>{m.title}</b><div className="sub" style={{ textAlign: "left" }}>{m.date} · {m.time} · {m.venue}</div><span className="btn p" style={{ marginTop: 8 }}>View & Check-in</span></a>)}</div>;
}
export default function Home() {
  const [modal, setModal] = useState(false);
  useEffect(() => { if (!localStorage.getItem("seen")) { const t = setTimeout(() => setModal(true), 3500); return () => clearTimeout(t); } }, []);
  const vcard = () => { const b = new Blob([`BEGIN:VCARD\nVERSION:3.0\nFN:${A.name}\nORG:ICICI Prudential Life Insurance\nTITLE:Insurance Advisor\nTEL:${A.phone}\nEMAIL:${A.email}\nADR:;;${A.addr};;;;\nEND:VCARD`], { type: "text/vcard" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "Vivek-Mistry.vcf"; a.click(); };
  const share = () => navigator.share ? navigator.share({ title: "Vivekkumar Mistry - Insurance Advisor", url: location.href }) : navigator.clipboard.writeText(location.href).then(() => alert("Link copied"));
  return (<><div className="bg"><i /><i /></div><div className="wrap">
    <div className="card"><div className="avatar">VM</div><h1>{A.name}</h1>
      <p className="sub">Insurance Advisor · ICICI Prudential Life Insurance<br />Advisor Code: {A.code}</p><p className="tag">Ke Saath Zimmedari Lagey Pyaari</p></div>
    <div className="card" style={{ animationDelay: ".15s" }}><div className="grid">
      <a className="btn p" href={`tel:${A.phone}`}>📞 Call</a><a className="btn" href={`https://wa.me/${A.wa}?text=Hi%20Vivek,%20I%20want%20insurance%20details`}>💬 WhatsApp</a>
      <a className="btn" href={`mailto:${A.email}`}>✉️ Email</a><a className="btn" href={`https://maps.google.com/?q=${encodeURIComponent(A.addr)}`}>🗺️ Map</a>
      <button className="btn" onClick={vcard}>💾 Save Contact</button><button className="btn" onClick={share}>🔗 Share Card</button></div></div>
    <div className="card" style={{ animationDelay: ".3s" }}><div className="grid">{STATS.map(([n, l, d]) => <div className="stat" key={l}><Count to={n} dec={d} /><span>{l}</span></div>)}</div>
      <p className="small">1-day claim settlement · 471 branches · Data as on 31 Mar 2025</p></div>
    <Meetings /><div className="card" style={{ animationDelay: ".45s" }}><h2>How I can help you</h2>{SERVICES.map((s) => <div className="svc" key={s}>{s}</div>)}</div>
    <div className="card" style={{ animationDelay: ".6s" }}><LeadForm title="📩 Get a free insurance consultation" /></div>
    <p className="small">{A.addr}<br />ICICI Prudential Life Insurance Co. Ltd. · Helpline 1800 2660<br />Insurance is a subject matter of solicitation.</p></div>
    {modal && <div className="modal"><div className="card"><LeadForm title="👋 Welcome! Tell me about yourself" onDone={() => setModal(false)} />
      <button className="btn" style={{ width: "100%", marginTop: 10 }} onClick={() => { localStorage.setItem("seen", "1"); setModal(false); }}>Skip for now</button></div></div>}</>);
}
