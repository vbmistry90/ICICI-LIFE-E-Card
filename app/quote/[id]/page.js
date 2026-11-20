"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Btn, MeetSk } from "@/components/Ui";
const inr = (n) => (n === "" || n == null ? "-" : "₹" + Number(n).toLocaleString("en-IN"));
const post = (u, b) => fetch(u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
export default function QuotePage() {
  const { id } = useParams(); const [q, setQ] = useState(null), [err, setErr] = useState(""), [f, setF] = useState({ name: "", phone: "", location: "" }), [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  useEffect(() => { fetch("/api/quotes?id=" + id).then((r) => r.json()).then((j) => { if (j.error) return setErr(j.error); setQ(j);
    if (!sessionStorage.getItem("qv" + id)) { sessionStorage.setItem("qv" + id, "1"); post("/api/quotes", { id, type: "view" }); } }).catch(() => setErr("Could not load")); }, [id]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const go = async (e) => { e.preventDefault(); setBusy(true); const r = await post("/api/lead", { ...f, interest: "e-Quote: " + q.title }); setBusy(false); r.ok ? setDone(true) : alert((await r.json()).error); };
  const share = async () => { const url = location.href, text = `${q.title} - e-Quote by Vivek Partner`; if (navigator.share) { try { await navigator.share({ title: q.title, text, url }); } catch { return; } } else window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + url), "_blank"); post("/api/quotes", { id, type: "share" }); };
  if (err) return <div className="wrap"><div className="card">{err}</div></div>;
  if (!q) return <MeetSk />;
  const feats = (q.features || "").split("\n").filter(Boolean), exp = q.status === "Expired" || (q.validTill && q.validTill < new Date().toISOString().slice(0, 10));
  return <><div className="bg"><i /><i /></div><div className="wrap">
    {q.banner && <img src={q.banner} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 20, marginBottom: 16, animation: "up .7s both" }} />}
    <div className="card"><span className="tag" style={{ textAlign: "left", margin: 0 }}>{q.planType} · e-Quote</span><h1 style={{ textAlign: "left", marginTop: 6 }}>{q.title}</h1>
      {exp && <p style={{ color: "#ff6b6b", marginTop: 8 }}><b>This quote has expired. Contact the advisor for a new one.</b></p>}
      <div className="grid" style={{ marginTop: 14 }}>{[["Sum Assured", inr(q.sumAssured)], ["Premium", inr(q.premium) + (q.frequency ? " / " + q.frequency : "")], ["Policy Term", q.policyTerm ? q.policyTerm + " yrs" : "-"], ["Valid Till", q.validTill || "-"]].map(([l, v]) => <div className="stat" key={l}><b style={{ fontSize: 18 }}>{v}</b><span>{l}</span></div>)}</div>
      {feats.length > 0 && <><h2 style={{ marginTop: 16 }}>Key Features</h2>{feats.map((x, i) => <div className="svc" key={i}>✅ {x}</div>)}</>}
      {q.description && <p style={{ marginTop: 12, fontSize: 14, opacity: 0.85, whiteSpace: "pre-line" }}>{q.description}</p>}
      <button className="btn" style={{ width: "100%", marginTop: 14 }} onClick={share}>📤 Share this quote</button></div>
    <div className="card">{done ? <h2>✅ Thank you! I will contact you shortly.</h2> : <form onSubmit={go}><h2>Interested? Get a personal quote</h2>
      <input placeholder="Your name" value={f.name} onChange={set("name")} required /><input placeholder="Mobile number" inputMode="numeric" value={f.phone} onChange={set("phone")} required /><input placeholder="Location / City" value={f.location} onChange={set("location")} />
      <Btn type="submit" className="btn p" style={{ width: "100%" }} busy={busy}>Request callback</Btn></form>}</div>
    <a className="btn" href="/">← Vivek Partner card</a><p className="small">Illustrative quote. Final premium and benefits are as per the ICICI Prudential Life policy document. Insurance is a subject matter of solicitation. Not an official ICICI Prudential website.</p></div></>;
}
