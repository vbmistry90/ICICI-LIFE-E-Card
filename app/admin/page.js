"use client";
import { useEffect, useState, useCallback } from "react";
const FREQ = { Monthly: 1, Quarterly: 3, "Half-Yearly": 6, Yearly: 12 }, PERYR = { Monthly: 12, Quarterly: 4, "Half-Yearly": 2, Yearly: 1 };
const S = (...o) => ({ t: "select", o });
const CFG = {
  leads: [["name"], ["phone"], ["location"], ["interest"], ["status", S("New", "Contacted", "Interested", "Proposal Sent", "Won", "Lost")], ["notes"]],
  policies: [["clientName"], ["phone"], ["email"], ["policyNo"], ["plan"], ["cover", { t: "number" }], ["premium", { t: "number" }], ["frequency", S(...Object.keys(FREQ))],
    ["nextDue", { t: "date" }], ["commissionPct", { t: "number" }], ["status", S("Active", "Lapsed", "Matured", "Surrendered")]],
  claims: [["clientName"], ["policyNo"], ["type", S("Death", "Maturity", "Health", "Rider", "Surrender")], ["amount", { t: "number" }], ["status", S("Filed", "Under Review", "Settled", "Rejected")], ["date", { t: "date" }], ["notes"]],
  meetings: [["title"], ["date", { t: "date" }], ["time", { t: "time" }], ["venue"], ["mapLink"], ["agenda"], ["description"], ["status", S("Upcoming", "Completed", "Cancelled")], ["banner", { t: "file" }]],
  checkins: [["meetingTitle"], ["name"], ["phone"], ["location"], ["guests", { t: "number" }], ["status", S("Registered", "Attended", "No-show")]] };
const inr = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
const days = (d) => Math.ceil((new Date(d) - new Date(new Date().toDateString())) / 864e5);
const addM = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x.toISOString().slice(0, 10); };
const earn = (p) => (+p.premium || 0) * (PERYR[p.frequency] || 1) * (+p.commissionPct || 0) / 100;
const api = (c, m = "GET", b, q = "") => fetch(`/api/admin/${c}${q}`, { method: m, headers: { "Content-Type": "application/json" }, body: b && JSON.stringify(b) });
export default function Admin() {
  const [ok, setOk] = useState(false), [pw, setPw] = useState(""), [tab, setTab] = useState("dashboard"), [D, setD] = useState({ leads: [], policies: [], claims: [], meetings: [], checkins: [] }), [form, setForm] = useState({}), [q, setQ] = useState("");
  const load = useCallback(async () => { const r = await Promise.all(Object.keys(CFG).map((c) => api(c)));
    if (r.some((x) => x.status === 401)) return setOk(false); setOk(true); const js = await Promise.all(r.map((x) => x.json())); setD(Object.fromEntries(Object.keys(CFG).map((k, i) => [k, js[i]]))); }, []);
  useEffect(() => { load(); }, [load]);
  const login = async (e) => { e.preventDefault(); const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) }); r.ok ? load() : alert("Wrong password"); };
  if (!ok) return <div className="wrap"><form className="card" onSubmit={login}><h2>🔐 Advisor Admin</h2><input type="password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} /><button className="btn p" style={{ width: "100%" }}>Login</button></form></div>;
  const pick = (e, k) => { const f = e.target.files[0]; if (!f) return; const im = new Image(); im.onload = () => { const s = Math.min(1, 900 / im.width), c = document.createElement("canvas"); c.width = im.width * s; c.height = im.height * s; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); setForm((x) => ({ ...x, [k]: c.toDataURL("image/jpeg", 0.72) })); }; im.src = URL.createObjectURL(f); };
  const ci = (m) => D.checkins.filter((c) => c.meetingId === m._id);
  const save = async (e) => { e.preventDefault(); await api(tab, form._id ? "PUT" : "POST", form); setForm({}); load(); };
  const del = async (id) => { if (confirm("Delete?")) { await api(tab, "DELETE", null, "?id=" + id); load(); } };
  const paid = async (p) => { await api("policies", "PUT", { _id: p._id, nextDue: addM(p.nextDue, FREQ[p.frequency] || 12), remindedFor: "" }); load(); };
  const upd = async (c, row, k, v) => { await api(c, "PUT", { _id: row._id, [k]: v }); load(); };
  const due = D.policies.filter((p) => p.status === "Active" && p.nextDue && days(p.nextDue) <= 7).sort((a, b) => a.nextDue.localeCompare(b.nextDue));
  const byClient = Object.values(D.policies.reduce((m, p) => { const k = p.clientName || "?"; m[k] ??= { name: k, n: 0, prem: 0, earn: 0 }; m[k].n++; m[k].prem += (+p.premium || 0) * (PERYR[p.frequency] || 1); m[k].earn += earn(p); return m; }, {})).sort((a, b) => b.earn - a.earn);
  const rows = (D[tab] || []).filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const wa = (p) => `https://wa.me/91${p.phone}?text=${encodeURIComponent(`Dear ${p.clientName}, your ${p.plan} premium of Rs ${p.premium} is due on ${p.nextDue}. Please pay on time. - Vivek Mistry, ICICI Pru Life`)}`;
  const st = { padding: "6px 8px", borderBottom: "1px solid #ffffff18", fontSize: 13, textAlign: "left" };
  return <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      {["dashboard", "leads", "policies", "claims", "meetings", "checkins", "earnings"].map((t) => <button key={t} className={"btn" + (tab === t ? " p" : "")} onClick={() => { setTab(t); setForm({}); }} style={{ flex: 1 }}>{t.toUpperCase()}</button>)}
      <button className="btn" onClick={async () => { await fetch("/api/auth", { method: "DELETE" }); setOk(false); }}>Logout</button></div>
    {tab === "dashboard" && <>
      <div className="card"><div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
        {[["Leads", D.leads.length], ["New leads", D.leads.filter((l) => l.status === "New").length], ["Won", D.leads.filter((l) => l.status === "Won").length], ["Active policies", D.policies.filter((p) => p.status === "Active").length],
          ["Yearly premium", inr(byClient.reduce((s, c) => s + c.prem, 0))], ["Yearly earning", inr(byClient.reduce((s, c) => s + c.earn, 0))], ["Open claims", D.claims.filter((c) => ["Filed", "Under Review"].includes(c.status)).length], ["Upcoming meetings", D.meetings.filter((m) => m.status === "Upcoming").length], ["Meeting check-ins", D.checkins.length]]
          .map(([l, v]) => <div className="stat" key={l}><b>{v}</b><span>{l}</span></div>)}</div></div>
      <div className="card"><h2>🔔 Premiums due in 7 days / overdue ({due.length})</h2>{due.map((p) => <div className="svc" key={p._id} style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <span>{p.clientName} · {p.plan} · {inr(p.premium)} · <b style={{ color: days(p.nextDue) < 0 ? "#ff6b6b" : "#ffb199" }}>{p.nextDue} ({days(p.nextDue)}d)</b></span>
        <span style={{ display: "flex", gap: 6 }}><a className="btn" href={wa(p)} target="_blank">WhatsApp</a><a className="btn" href={`tel:${p.phone}`}>Call</a><button className="btn p" onClick={() => paid(p)}>Mark paid</button></span></div>)}
        <p className="small">Email reminders go out automatically every morning (9 AM IST).</p></div></>}
    {tab === "earnings" && <div className="card"><h2>💼 Client-wise earning (yearly premium × commission %)</h2><table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr>{["Client", "Policies", "Yearly premium", "Earning"].map((h) => <th key={h} style={st}>{h}</th>)}</tr></thead><tbody>
        {byClient.map((c) => <tr key={c.name}><td style={st}>{c.name}</td><td style={st}>{c.n}</td><td style={st}>{inr(c.prem)}</td><td style={st}><b>{inr(c.earn)}</b></td></tr>)}</tbody></table>
      <p className="small">Set the commission % on each policy (Policies tab).</p></div>}
    {tab === "meetings" && <div className="card"><h2>📅 Meeting overview</h2>{D.meetings.map((m) => { const c = ci(m); return <div className="svc" key={m._id} style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
      <span><b>{m.title}</b> · {m.date} {m.time} · {m.venue} · {m.status}<br />Registered {c.length} · Attended {c.filter((x) => x.status === "Attended").length} · Guests {c.reduce((s, x) => s + (+x.guests || 0), 0)}</span>
      <span style={{ display: "flex", gap: 6 }}><button className="btn" onClick={() => navigator.clipboard.writeText(`${location.origin}/meeting/${m._id}`).then(() => alert("Invite link copied"))}>🔗 Link</button>
        <a className="btn" target="_blank" href={`https://wa.me/?text=${encodeURIComponent(`You are invited: ${m.title} on ${m.date} ${m.time} at ${m.venue}. Details & check-in: ${location.origin}/meeting/${m._id}`)}`}>Share</a></span></div>; })}</div>}
    {CFG[tab] && <>
      <form className="card" onSubmit={save}><h2>{form._id ? "Edit" : "Add"} {tab.slice(0, -1)}</h2><div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
        {CFG[tab].map(([k, o]) => o?.t === "file" ? <label key={k} className="btn">🖼️ {form[k] ? "Change banner" : "Upload invitation banner"}<input type="file" accept="image/*" hidden onChange={(e) => pick(e, k)} />{form[k] && <img src={form[k]} alt="" style={{ width: "100%", marginTop: 6, borderRadius: 8 }} />}</label> : o?.t === "select" ? <select key={k} value={form[k] || ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })}><option value="">{k}</option>{o.o.map((x) => <option key={x}>{x}</option>)}</select>
          : <input key={k} placeholder={k} type={o?.t || "text"} value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} title={k} />)}</div>
        <button className="btn p" style={{ width: "100%" }}>Save</button></form>
      <input placeholder="🔍 Search..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card" style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr>{CFG[tab].map(([k]) => <th key={k} style={st}>{k}</th>)}<th style={st} /></tr></thead><tbody>
        {rows.map((r) => <tr key={r._id}>{CFG[tab].map(([k, o]) => <td key={k} style={st}>{o?.t === "file" ? (r[k] ? <img src={r[k]} alt="" style={{ height: 40, borderRadius: 4 }} /> : "") : o?.t === "select" ? <select style={{ margin: 0, padding: 4 }} value={r[k] || ""} onChange={(e) => upd(tab, r, k, e.target.value)}>{o.o.map((x) => <option key={x}>{x}</option>)}</select> : String(r[k] ?? "")}</td>)}
          <td style={{ ...st, whiteSpace: "nowrap" }}>{r.phone && <a href={`https://wa.me/91${r.phone}`} target="_blank">💬</a>} <button onClick={() => setForm(r)}>✏️</button> <button onClick={() => del(r._id)}>🗑️</button></td></tr>)}</tbody></table></div></>}
  </div>;
}
