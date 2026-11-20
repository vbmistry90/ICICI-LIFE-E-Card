"use client";
import { useEffect, useState, useCallback } from "react";
import { Btn, PageSk, Num } from "@/components/Ui";
import Quotes from "@/components/Quotes";
import Module, { MODS } from "@/components/Module";
import { DEFAULT_PROFILE } from "@/lib/profile";
import { PERYR, inr, days, addM, earn, FREQ } from "@/lib/utils";
const TABS = [["dashboard", "Dashboard", "📊"], ["leads", "Leads", "🧲"], ["e-quote", "E-Quote", "📄"], ["meetings", "Meetings", "📅"], ["checkins", "Checkins", "✅"], ["policies", "Policies", "🛡️"], ["claims", "Claims", "📋"], ["earnings", "Earnings", "💼"]];
const COLS = ["leads", "policies", "claims", "meetings", "checkins", "quotes"], J = { "Content-Type": "application/json" };
const putProfile = (b) => fetch("/api/profile", { method: "PUT", headers: J, body: JSON.stringify(b) });
export default function Admin() {
  const [ok, setOk] = useState(false), [pw, setPw] = useState(""), [tab, setTab] = useState("dashboard"), [D, setD] = useState(Object.fromEntries(COLS.map((c) => [c, []]))), [ready, setReady] = useState(false), [logging, setLogging] = useState(false);
  const [show, setShow] = useState(false), [lerr, setLerr] = useState(""), [prof, setProf] = useState({}), [pf, setPf] = useState(null), [savingP, setSavingP] = useState(false), [pmsg, setPmsg] = useState("");
  const load = useCallback(async () => {
    setProf(await fetch("/api/profile").then((x) => x.json()).catch(() => ({})));
    const r = await Promise.all(COLS.map((c) => fetch("/api/admin/" + c)));
    if (r.some((x) => x.status === 401)) { setOk(false); return setReady(true); }
    setOk(true); const js = await Promise.all(r.map((x) => x.json()));
    setD(Object.fromEntries(COLS.map((c, i) => [c, Array.isArray(js[i]) ? js[i] : []]))); setReady(true); }, []);
  useEffect(() => { load().catch(() => setReady(true)); }, [load]);
  const login = async (e) => { e.preventDefault(); setLogging(true); setLerr(""); const r = await fetch("/api/auth", { method: "POST", headers: J, body: JSON.stringify({ password: pw }) }); if (r.ok) await load(); else setLerr("Incorrect password. Please try again."); setLogging(false); };
  if (!ready) return <PageSk />;
  if (!ok) { const P = { ...DEFAULT_PROFILE, ...prof }; return <div className="lgwrap"><div className="bg"><i /><i /></div>
    <a href="/" className="btn" title="Home" style={{ position: "fixed", top: 16, right: 16, padding: "8px 14px", zIndex: 5 }}>🏠 Home</a>
    <form className="lgcard" onSubmit={login}>
      <div><img src={P.photo || "/avatar.png"} alt="" className="lgav" /><h1 style={{ textAlign: "center" }}>{P.name}</h1><p className="sub">{P.designation}</p><span className="lgcode">Advisor Code: {P.code}</span></div>
      <div className="lgchips"><span>📞 {P.phone}</span><span>✉️ {P.email}</span><span>📍 {P.addr}</span></div>
      <div><label className="lgl">Admin password</label><div className="lgin"><span>🔒</span><input type={show ? "text" : "password"} placeholder="Enter your password" autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        <button type="button" title={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>{show ? "🙈" : "👁️"}</button></div>{lerr && <p className="lgerr">{lerr}</p>}</div>
      <Btn type="submit" className="btn p" style={{ width: "100%", padding: 14 }} busy={logging}>Sign in to dashboard →</Btn>
      <p className="small">🔐 Secure advisor area · Vivek Partner</p></form></div>; }
  const openProfile = () => { setPf({ ...DEFAULT_PROFILE, ...prof }); setPmsg(""); setTab("profile"); };
  const pickPhoto = (e) => { const f = e.target.files[0]; if (!f) return; const im = new Image(); im.onload = () => { const s = Math.min(1, 320 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = im.width * s; c.height = im.height * s; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); setPf((x) => ({ ...x, photo: c.toDataURL("image/jpeg", 0.8) })); }; im.src = URL.createObjectURL(f); };
  const saveProfile = async (e) => { e.preventDefault(); setSavingP(true); const r = await putProfile(pf); if (r.ok) { setProf(pf); setPmsg("✅ Profile saved. Your card is updated."); } else setPmsg("❌ Could not save"); setSavingP(false); };
  const removePhoto = async () => { if (!confirm("Remove profile photo?")) return; setPf({ ...pf, photo: "" }); await putProfile({ photo: "" }); setProf({ ...prof, photo: "" }); setPmsg("✅ Photo removed"); };
  const togglePop = async () => { const n = pf.showPopular === false; setPf({ ...pf, showPopular: n }); setProf({ ...prof, showPopular: n }); await putProfile({ showPopular: n }); setPmsg(n ? "✅ Popular plans marquee is ON for the home page" : "✅ Popular plans marquee is OFF for the home page"); };
  const logout = async () => { await fetch("/api/auth", { method: "DELETE" }); setOk(false); };
  const paid = async (p) => { await fetch("/api/admin/policies", { method: "PUT", headers: J, body: JSON.stringify({ _id: p._id, nextDue: addM(p.nextDue, FREQ[p.frequency] || 12), remindedFor: "" }) }); await load(); };
  const due = D.policies.filter((p) => p.status === "Active" && p.nextDue && days(p.nextDue) <= 7).sort((a, b) => a.nextDue.localeCompare(b.nextDue));
  const byClient = Object.values(D.policies.reduce((m, p) => { const k = p.clientName || "?"; m[k] ??= { name: k, n: 0, prem: 0, earn: 0 }; m[k].n++; m[k].prem += (+p.premium || 0) * (PERYR[p.frequency] || 1); m[k].earn += earn(p); return m; }, {})).sort((a, b) => b.earn - a.earn);
  const wa = (p) => `https://wa.me/91${p.phone}?text=${encodeURIComponent(`Dear ${p.clientName}, your ${p.plan} premium of Rs ${p.premium} is due on ${p.nextDue}. Please pay on time. - Vivek Mistry, ICICI Pru Life`)}`;
  const cards = [["leads", "🧲", "Total Leads", D.leads.length, "#2b5be8"], ["leads", "🆕", "New Leads", D.leads.filter((l) => l.status === "New").length, "#0d9488"], ["leads", "🏆", "Won Leads", D.leads.filter((l) => l.status === "Won").length, "#16a34a"],
    ["e-quote", "📄", "E-Quotes", D.quotes.length, "#db2777"], ["meetings", "📅", "Upcoming Meetings", D.meetings.filter((m) => m.status === "Upcoming").length, "#7c3aed"], ["checkins", "✅", "Meeting Check-ins", D.checkins.length, "#0ea5e9"],
    ["policies", "🛡️", "Active Policies", D.policies.filter((p) => p.status === "Active").length, "#e8472b"], ["policies", "💳", "Yearly Premium", Math.round(byClient.reduce((s, c) => s + c.prem, 0)), "#d97706", 1],
    ["earnings", "💼", "Yearly Earning", Math.round(byClient.reduce((s, c) => s + c.earn, 0)), "#16a34a", 1], ["claims", "📋", "Open Claims", D.claims.filter((c) => ["Filed", "Under Review"].includes(c.status)).length, "#dc2626"]];
  return <div style={{ maxWidth: 1180, margin: "0 auto", padding: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
      <h2 style={{ margin: 0 }}>🛡️ Vivek Partner · Admin Panel</h2>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className={"btn" + (tab === "profile" ? " p" : "")} style={{ padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }} onClick={openProfile}><img src={prof.photo || "/avatar.png"} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} /> Advisor Profile</button>
        <a className="btn ib" href="/" title="Home" aria-label="Home">🏠</a><Btn className="btn ib out" title="Logout" aria-label="Logout" onClick={logout}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 2v10" /><path d="M18.4 6.6a9 9 0 1 1-12.8 0" /></svg></Btn></div></div>
    <div className="tabs">{TABS.map(([t, l, i]) => <button key={t} className={"btn" + (tab === t ? " p" : "")} onClick={() => { setTab(t); if (t === "dashboard") load(); }}>{i} {l}</button>)}</div>
    {tab === "dashboard" && <>
      <div className="dgrid">{cards.map(([t, ic, l, v, c, m], i) => <button key={l} className="dcard" style={{ "--c": c, animationDelay: i * 70 + "ms" }} onClick={() => setTab(t)}><span className="dic">{ic}</span><span className="dv"><Num to={v} money={m} /></span><span className="dl">{l}</span><span className="darr">→</span></button>)}</div>
      <div className="card"><h2>🔔 Premiums due in 7 days / overdue ({due.length})</h2>{!due.length && <p className="small">No premiums due this week. 🎉</p>}{due.map((p) => <div className="svc" key={p._id} style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <span>{p.clientName} · {p.plan} · {inr(p.premium)} · <b style={{ color: days(p.nextDue) < 0 ? "#ff6b6b" : "#ffb199" }}>{p.nextDue} ({days(p.nextDue)}d)</b></span>
        <span style={{ display: "flex", gap: 6 }}><a className="btn" href={wa(p)} target="_blank">WhatsApp</a><a className="btn" href={`tel:${p.phone}`}>Call</a><Btn className="btn p" onClick={() => paid(p)}>Mark paid</Btn></span></div>)}
        <p className="small">Email reminders go out automatically every morning (9 AM IST).</p></div></>}
    {tab === "earnings" && <div className="card" style={{ overflowX: "auto" }}><h2>💼 Client-wise earning (yearly premium × commission %)</h2><table className="bt"><thead><tr>{["#", "Client", "Policies", "Yearly Premium", "Earning"].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>
      {byClient.map((c, i) => <tr key={c.name}><td>{i + 1}</td><td>{c.name}</td><td>{c.n}</td><td>{inr(c.prem)}</td><td><b>{inr(c.earn)}</b></td></tr>)}{!byClient.length && <tr><td colSpan={5} style={{ textAlign: "center" }}>No policies yet.</td></tr>}</tbody></table>
      <p className="small">Set the commission % on each policy (Policies menu).</p></div>}
    {tab === "e-quote" && <Quotes />}
    {MODS[tab] && <Module key={tab} col={tab} M={MODS[tab]} rows={D[tab]} D={D} reload={load} />}
    {tab === "profile" && pf && <form className="card" onSubmit={saveProfile}><h2>👤 Advisor Profile</h2>
      <div style={{ textAlign: "center", marginBottom: 14 }}><img src={pf.photo || "/avatar.png"} alt="" className="avatar" style={{ objectFit: "cover" }} />
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}><label className="btn" style={{ display: "inline-block", padding: "8px 14px" }}>📷 {pf.photo ? "Change photo" : "Upload photo"}<input type="file" accept="image/*" hidden onChange={pickPhoto} /></label>
          {pf.photo && <Btn className="btn" style={{ padding: "8px 14px" }} onClick={removePhoto}>🗑️ Remove photo</Btn>}</div></div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>{[["name", "Full Name"], ["designation", "Designation"], ["code", "Advisor Code"], ["phone", "Mobile (with +91)"], ["wa", "WhatsApp (91XXXXXXXXXX)"], ["email", "Email"], ["addr", "Address"], ["tagline", "Tagline"]].map(([k, l]) =>
        <label key={k} style={{ fontSize: 12, opacity: 0.85 }}>{l}<input value={pf[k] || ""} onChange={(e) => setPf({ ...pf, [k]: e.target.value })} style={{ marginTop: 4 }} /></label>)}</div>
      <div className="svc" style={{ justifyContent: "space-between", marginBottom: 10 }}><span>🔥 Show "Popular Plans" marquee on home page</span><button type="button" role="switch" aria-checked={pf.showPopular !== false} className={"sw" + (pf.showPopular !== false ? " on" : "")} onClick={togglePop}><i /></button></div>
      <Btn type="submit" className="btn p" style={{ width: "100%" }} busy={savingP}>Save profile</Btn>{pmsg && <p className="small" style={{ opacity: 1 }}>{pmsg}</p>}</form>}
  </div>;
}
