"use client";
import { useEffect, useState, useCallback } from "react";
import Marquee from "react-fast-marquee";
import { Btn, Sk } from "./Ui";
import ExportMenu from "./ExportMenu";
const F = [["title", "Plan Name", "text", 2], ["planType", "Plan Type", "select"], ["frequency", "Premium Frequency", "select"], ["sumAssured", "Sum Assured (₹)", "number"], ["premium", "Premium (₹)", "number"],
  ["policyTerm", "Policy Term (years)", "number"], ["validTill", "Valid Till", "date"], ["status", "Status", "select"], ["features", "Key Features (one per line)", "textarea", 2], ["description", "Description", "textarea", 2]];
const OPT = { planType: ["Term Life", "Savings", "ULIP", "Child Plan", "Retirement", "Health"], frequency: ["Monthly", "Quarterly", "Half-Yearly", "Yearly", "Single"], status: ["Active", "Draft", "Expired"] };
const inr = (n) => (n === "" || n == null ? "-" : "₹" + Number(n).toLocaleString("en-IN"));
const score = (q) => (q.views || 0) + 2 * (q.shares || 0), link = (q) => `${location.origin}/quote/${q._id}`;
const J = { "Content-Type": "application/json" };
const api = (m, b, q = "") => fetch("/api/admin/quotes" + q, { method: m, headers: J, body: b && JSON.stringify(b) });
const track = (id, type) => fetch("/api/quotes", { method: "POST", headers: J, body: JSON.stringify({ id, type }) });
function Modal({ title, onClose, children, foot }) {
  return <div className="qov" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="qm"><div className="qh"><h3>{title}</h3><button type="button" className="qx" onClick={onClose}>✕</button></div>{children}{foot && <div className="qf">{foot}</div>}</div></div>;
}
export default function Quotes() {
  const [rows, setRows] = useState(null), [q, setQ] = useState(""), [page, setPage] = useState(1), [modal, setModal] = useState(null), [form, setForm] = useState({}), [saving, setSaving] = useState(false);
  const load = useCallback(async () => { const r = await api("GET"); setRows(r.ok ? await r.json() : []); }, []);
  useEffect(() => { load(); }, [load]);
  const SZ = 10, all = (rows || []).filter((r) => JSON.stringify({ ...r, banner: 0 }).toLowerCase().includes(q.toLowerCase())), pages = Math.max(1, Math.ceil(all.length / SZ)), cur = Math.min(page, pages), view = all.slice((cur - 1) * SZ, cur * SZ);
  const act = (rows || []).filter((r) => r.status === "Active"), top = [...act].filter((r) => score(r) > 0).sort((a, b) => score(b) - score(a)).slice(0, 6);
  const mv = [...act].sort((a, b) => (b.views || 0) - (a.views || 0))[0], ms = [...act].sort((a, b) => (b.shares || 0) - (a.shares || 0))[0], topId = top[0]?._id;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const pick = (e) => { const f = e.target.files[0]; if (!f) return; const im = new Image(); im.onload = () => { const s = Math.min(1, 1000 / im.width), c = document.createElement("canvas"); c.width = im.width * s; c.height = im.height * s; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); setForm((x) => ({ ...x, banner: c.toDataURL("image/jpeg", 0.75) })); }; im.src = URL.createObjectURL(f); };
  const save = async (e) => { e.preventDefault(); setSaving(true); const { views, shares, createdAt, ...b } = form; await api(form._id ? "PUT" : "POST", form._id ? b : { ...b, status: b.status || "Active", views: 0, shares: 0 }); await load(); setSaving(false); setModal(null); };
  const del = async (x) => { if (confirm(`Delete "${x.title}"?`)) { await api("DELETE", null, "?id=" + x._id); await load(); } };
  const bump = (id) => setRows((rs) => rs.map((r) => (r._id === id ? { ...r, shares: (r.shares || 0) + 1 } : r)));
  const copy = async (x) => { await navigator.clipboard.writeText(link(x)); await track(x._id, "share"); bump(x._id); alert("Quote link copied"); };
  const share = async (x) => { const text = `${x.title} - Premium ${inr(x.premium)} (${x.frequency || ""}), Cover ${inr(x.sumAssured)}. View e-Quote: ${link(x)}`;
    if (navigator.share) { try { await navigator.share({ title: x.title, text, url: link(x) }); } catch { return; } } else window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank"); await track(x._id, "share"); bump(x._id); };
  const openForm = (x) => { setForm(x ? { ...x } : { status: "Active", frequency: "Yearly", planType: "Term Life" }); setModal({ mode: "form" }); };
  const v = modal?.mode === "view" ? (rows || []).find((r) => r._id === modal.id) : null;
  const chips = [mv && (mv.views || 0) > 0 && ["🏆 Most visited", mv], ms && (ms.shares || 0) > 0 && ["🔗 Most shared", ms], ...top.map((x, i) => [`🔥 #${i + 1}`, x])].filter(Boolean);
  const Badge = ({ x }) => x._id === topId ? <span style={{ marginLeft: 6, fontSize: 11, background: "#e8472b", borderRadius: 99, padding: "2px 8px" }}>🔥 Popular</span> : null;
  return <div>
    <div className="qpop"><b>🔥 POPULAR PLANS</b><div style={{ flex: 1, minWidth: 0 }}>{chips.length ? <Marquee gradient={false} speed={45} pauseOnHover style={{ padding: "8px 0" }}>{chips.map(([l, x], i) => <span className="qchip" key={i}><b>{l}</b> {x.title} · 👁 {x.views || 0} · 🔗 {x.shares || 0}</span>)}</Marquee>
      : <span style={{ padding: "0 14px", fontSize: 13 }}>No activity yet. Share a quote link to find your popular plan.</span>}</div></div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><input style={{ flex: 1, minWidth: 200 }} placeholder="🔍 Search quotes..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      <ExportMenu get={() => ({ head: ["Plan Name", "Plan Type", "Frequency", "Sum Assured (₹)", "Premium (₹)", "Policy Term (years)", "Valid Till", "Status", "Views", "Shares", "Key Features", "Description"],
        body: all.map((x) => [x.title, x.planType, x.frequency, x.sumAssured, x.premium, x.policyTerm, x.validTill, x.status, x.views || 0, x.shares || 0, x.features, x.description].map((v) => v ?? "")), name: "equotes-" + new Date().toISOString().slice(0, 10), title: "Vivek Partner - E-Quote records" })} />
      <button className="btn p" style={{ height: 42, padding: "0 18px" }} onClick={() => openForm()}>➕ New e-Quote</button></div>
    <div className="card" style={{ overflowX: "auto" }}>{!rows ? [...Array(5)].map((_, i) => <Sk key={i} h={40} style={{ marginBottom: 10 }} />) :
      <table className="bt"><thead><tr>{["#", "Banner", "Plan", "Type", "Sum Assured", "Premium", "Valid Till", "Status", "Views", "Shares", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>
        {view.map((x, i) => <tr key={x._id}><td>{(cur - 1) * SZ + i + 1}</td><td><div className="qthumb">{x.banner ? <img src={x.banner} alt="" /> : "No banner"}</div></td>
          <td><b>{x.title}</b><Badge x={x} /></td><td>{x.planType}</td><td>{inr(x.sumAssured)}</td><td>{inr(x.premium)}<br /><small>{x.frequency}</small></td><td>{x.validTill || "-"}</td><td>{x.status}</td><td>{x.views || 0}</td><td>{x.shares || 0}</td>
          <td className="act"><button title="View" onClick={() => setModal({ mode: "view", id: x._id })}>👁️</button> <button title="Edit" onClick={() => openForm(x)}>✏️</button> <button title="Copy link" onClick={() => copy(x)}>🔗</button> <button title="Share" onClick={() => share(x)}>📤</button> <button title="Delete" onClick={() => del(x)}>🗑️</button></td></tr>)}
        {!view.length && <tr><td colSpan={11} style={{ textAlign: "center" }}>No quotes yet. Click "New e-Quote".</td></tr>}</tbody></table>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, flexWrap: "wrap", gap: 8, fontSize: 13 }}><span>{all.length} quote(s)</span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}><button className="btn" style={{ padding: "6px 12px" }} disabled={cur === 1} onClick={() => setPage(cur - 1)}>‹ Prev</button>Page {cur} / {pages}<button className="btn" style={{ padding: "6px 12px" }} disabled={cur === pages} onClick={() => setPage(cur + 1)}>Next ›</button></span></div></div>
    {modal?.mode === "form" && <form onSubmit={save}><Modal title={form._id ? "✏️ Edit e-Quote" : "➕ New e-Quote"} onClose={() => setModal(null)} foot={<><button type="button" className="qbtn" onClick={() => setModal(null)}>Cancel</button><Btn type="submit" className="qbtn p" busy={saving}>{form._id ? "Update quote" : "Save quote"}</Btn></>}>
      <div className="qb"><div className="qg">
        <div style={{ gridColumn: "span 2" }}><span className="ql">Invitation / plan banner (16:9 works best)</span>
          <label className="qdrop">{form.banner ? <img src={form.banner} alt="" className="qban" /> : "📷 Click to upload banner image"}<input type="file" accept="image/*" hidden onChange={pick} /></label>
          {form.banner && <button type="button" style={{ marginTop: 6, fontSize: 12, color: "#b91c1c", background: "none", border: 0, cursor: "pointer" }} onClick={() => setForm({ ...form, banner: "" })}>Remove banner</button>}</div>
        {F.map(([k, l, t, span]) => <label key={k} style={span ? { gridColumn: "span 2" } : null}><span className="ql">{l}</span>
          {t === "select" ? <select className="qi" value={form[k] || ""} onChange={set(k)}>{OPT[k].map((o) => <option key={o}>{o}</option>)}</select> : t === "textarea" ? <textarea className="qi" rows={3} value={form[k] || ""} onChange={set(k)} /> : <input className="qi" type={t} value={form[k] ?? ""} onChange={set(k)} required={k === "title"} />}</label>)}</div></div></Modal></form>}
    {v && <Modal title="📄 e-Quote details" onClose={() => setModal(null)} foot={<><button className="qbtn" onClick={() => copy(v)}>🔗 Copy link</button><button className="qbtn" onClick={() => share(v)}>📤 Share</button><a className="qbtn" href={"/quote/" + v._id} target="_blank">Open page ↗</a><button className="qbtn p" onClick={() => { openForm(v); }}>✏️ Edit</button></>}>
      <div className="qb">{v.banner ? <img src={v.banner} alt="" className="qban" /> : <div className="qban" style={{ display: "grid", placeItems: "center", color: "#9ca3af" }}>No banner</div>}
        <h3 style={{ margin: "14px 0 4px", fontSize: 20 }}>{v.title} <Badge x={v} /></h3><p style={{ color: "#6b7280", fontSize: 13 }}>{v.planType} · {v.status} · Valid till {v.validTill || "-"}</p>
        <div className="qg" style={{ margin: "14px 0" }}>{[["Sum Assured", inr(v.sumAssured)], ["Premium", inr(v.premium) + " / " + (v.frequency || "-")], ["Policy Term", v.policyTerm ? v.policyTerm + " yrs" : "-"], ["Views / Shares", `👁 ${v.views || 0} · 🔗 ${v.shares || 0}`]].map(([l, x]) => <div key={l} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}><div style={{ fontSize: 11, color: "#6b7280" }}>{l}</div><b>{x}</b></div>)}</div>
        {v.features && <><b>Key features</b><ul style={{ margin: "6px 0 12px 18px", fontSize: 14 }}>{v.features.split("\n").filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}</ul></>}
        {v.description && <p style={{ fontSize: 14, color: "#374151", whiteSpace: "pre-line" }}>{v.description}</p>}
        <p style={{ marginTop: 12, fontSize: 12, background: "#f3f4f6", borderRadius: 8, padding: 8, wordBreak: "break-all" }}>{link(v)}</p></div></Modal>}
  </div>;
}
