"use client";
import { useState } from "react";
import { Btn, Modal } from "./Ui";
import ExportMenu from "./ExportMenu";
import { FREQ, inr, addM, earn } from "@/lib/utils";
const st = (o, def) => ({ k: "status", l: "Status", t: "select", o, badge: 1, col: 1, def });
export const MODS = {
  leads: { one: "Lead", key: "name", fields: [{ k: "name", l: "Name", req: 1, col: 1 }, { k: "phone", l: "Phone", t: "tel", col: 1 }, { k: "location", l: "Location", col: 1 }, { k: "interest", l: "Interest", col: 1 },
    st(["New", "Contacted", "Interested", "Proposal Sent", "Won", "Lost"], "New"), { k: "notes", l: "Notes", t: "textarea", span: 2 }] },
  meetings: { one: "Meeting", key: "title", link: "/meeting/", fields: [{ k: "banner", l: "Invitation banner (16:9 works best)", t: "file", span: 2, col: 1 }, { k: "title", l: "Title", req: 1, span: 2, col: 1 },
    { k: "date", l: "Date", t: "date", col: 1 }, { k: "time", l: "Time", t: "time", col: 1 }, { k: "venue", l: "Venue", col: 1 }, { k: "mapLink", l: "Map Link", t: "url" }, st(["Upcoming", "Completed", "Cancelled"], "Upcoming"),
    { k: "agenda", l: "Agenda", t: "textarea", span: 2 }, { k: "description", l: "Description", t: "textarea", span: 2 }] },
  checkins: { one: "Check-in", key: "name", fields: [{ k: "meetingId", l: "Meeting", t: "meeting", span: 2, noView: 1 }, { k: "meetingTitle", l: "Meeting", col: 1, noForm: 1 }, { k: "name", l: "Name", req: 1, col: 1 }, { k: "phone", l: "Phone", t: "tel", col: 1 },
    { k: "location", l: "Location", col: 1 }, { k: "guests", l: "Guests", t: "number", col: 1 }, st(["Registered", "Attended", "No-show"], "Registered")] },
  policies: { one: "Policy", key: "clientName", fields: [{ k: "clientName", l: "Client Name", req: 1, col: 1 }, { k: "phone", l: "Phone", t: "tel", col: 1 }, { k: "email", l: "Email", t: "email" }, { k: "policyNo", l: "Policy No." }, { k: "plan", l: "Plan", col: 1 },
    { k: "cover", l: "Sum Assured (₹)", t: "number", money: 1 }, { k: "premium", l: "Premium (₹)", t: "number", money: 1, col: 1 }, { k: "frequency", l: "Frequency", t: "select", o: Object.keys(FREQ), col: 1, def: "Yearly" },
    { k: "nextDue", l: "Next Due", t: "date", col: 1 }, { k: "commissionPct", l: "Commission %", t: "number", pct: 1, col: 1 }, st(["Active", "Lapsed", "Matured", "Surrendered"], "Active")] },
  claims: { one: "Claim", key: "clientName", fields: [{ k: "clientName", l: "Client Name", req: 1, col: 1 }, { k: "policyNo", l: "Policy No.", col: 1 }, { k: "type", l: "Claim Type", t: "select", o: ["Death", "Maturity", "Health", "Rider", "Surrender"], col: 1 },
    { k: "amount", l: "Claim Amount (₹)", t: "number", money: 1, col: 1 }, st(["Filed", "Under Review", "Settled", "Rejected"], "Filed"), { k: "date", l: "Date", t: "date", col: 1 }, { k: "notes", l: "Notes", t: "textarea", span: 2 }] },
};
const J = { "Content-Type": "application/json" }, GOOD = ["Won", "Active", "Attended", "Settled", "Upcoming", "Matured"], BAD = ["Lost", "Lapsed", "Rejected", "Cancelled", "No-show", "Surrendered"];
const Bdg = ({ v }) => (v ? <span className="bdg" style={{ background: GOOD.includes(v) ? "#16a34a" : BAD.includes(v) ? "#dc2626" : "#d97706" }}>{v}</span> : "-");
const empty = (v) => v === "" || v == null;
export default function Module({ col, M, rows, D, reload }) {
  const [q, setQ] = useState(""), [page, setPage] = useState(1), [size, setSize] = useState(10), [sort, setSort] = useState({}), [modal, setModal] = useState(null), [form, setForm] = useState({});
  const [saving, setSaving] = useState(false), [mut, setMut] = useState(false);
  const api = (m, b, qs = "") => fetch(`/api/admin/${col}${qs}`, { method: m, headers: J, body: b && JSON.stringify(b) });
  const run = async (fn) => { setMut(true); try { await fn(); } finally { setMut(false); } };
  const cols = M.fields.filter((f) => f.col), name = M.one, link = (r) => location.origin + M.link + r._id;
  const val = (r, f) => f.t === "file" ? <div className="qthumb">{r[f.k] ? <img src={r[f.k]} alt="" /> : "No banner"}</div> : f.badge ? <Bdg v={r[f.k]} /> : empty(r[f.k]) ? "-" : f.money ? inr(r[f.k]) : f.pct ? r[f.k] + "%" : String(r[f.k]);
  const all = (rows || []).filter((r) => JSON.stringify({ ...r, banner: 0 }).toLowerCase().includes(q.toLowerCase())).sort((a, b) => { if (!sort.k) return 0; const x = a[sort.k] ?? "", y = b[sort.k] ?? "";
    const c = !empty(x) && !empty(y) && !isNaN(x) && !isNaN(y) ? +x - +y : String(x).localeCompare(String(y)); return sort.dir === "desc" ? -c : c; });
  const pages = Math.max(1, Math.ceil(all.length / size)), cur = Math.min(page, pages), view = all.slice((cur - 1) * size, cur * size);
  const openForm = (r) => { setForm(r ? { ...r } : Object.fromEntries(M.fields.filter((f) => f.def).map((f) => [f.k, f.def]))); setModal({ mode: "form" }); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const pick = (e, k) => { const f = e.target.files[0]; if (!f) return; const im = new Image(); im.onload = () => { const s = Math.min(1, 1000 / im.width), c = document.createElement("canvas"); c.width = im.width * s; c.height = im.height * s; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); setForm((x) => ({ ...x, [k]: c.toDataURL("image/jpeg", 0.75) })); }; im.src = URL.createObjectURL(f); };
  const save = async (e) => { e.preventDefault(); setSaving(true); const b = { ...form };
    M.fields.forEach((f) => { if (f.t === "number" && !empty(b[f.k])) b[f.k] = +b[f.k]; });
    if (b.meetingId) b.meetingTitle = D.meetings.find((m) => m._id === b.meetingId)?.title || b.meetingTitle;
    await api(b._id ? "PUT" : "POST", b); await reload(); setSaving(false); setModal(null); };
  const del = (r) => confirm(`Delete this ${name.toLowerCase()}?`) && run(async () => { await api("DELETE", null, "?id=" + r._id); await reload(); });
  const paid = (r) => run(async () => { await api("PUT", { _id: r._id, nextDue: addM(r.nextDue, FREQ[r.frequency] || 12), remindedFor: "" }); await reload(); });
  const copy = async (r) => { await navigator.clipboard.writeText(link(r)); alert("Link copied"); };
  const share = async (r) => { const text = `You are invited: ${r.title} on ${r.date} ${r.time} at ${r.venue}. Details & check-in: ${link(r)}`; if (navigator.share) { try { await navigator.share({ title: r.title, text, url: link(r) }); } catch {} } else window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank"); };
  const v = modal?.mode === "view" ? (rows || []).find((r) => r._id === modal.id) : null, ck = v && col === "meetings" ? D.checkins.filter((c) => c.meetingId === v._id) : [];
  const th = { cursor: "pointer" };
  return <div>
    {mut && <div className="bar" />}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><input style={{ flex: 1, minWidth: 200 }} placeholder={`🔍 Search ${col}...`} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      <select style={{ width: 120 }} value={size} onChange={(e) => { setSize(+e.target.value); setPage(1); }}>{[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}</select>
      <ExportMenu get={() => { const fs = M.fields.filter((f) => f.t !== "file" && f.t !== "meeting"); return { head: fs.map((f) => f.l), body: all.map((r) => fs.map((f) => (f.t === "number" && !empty(r[f.k]) ? +r[f.k] : r[f.k] ?? ""))), name: `${col}-${new Date().toISOString().slice(0, 10)}`, title: `Vivek Partner - ${name} records` }; }} />
      <button className="btn p" style={{ height: 42, padding: "0 18px" }} onClick={() => openForm()}>➕ New {name}</button></div>
    <div className="card" style={{ overflowX: "auto", opacity: mut ? 0.5 : 1, pointerEvents: mut ? "none" : "auto", transition: ".2s", marginTop: 4 }}>
      <table className="bt"><thead><tr><th>#</th>{cols.map((f) => <th key={f.k} style={f.t === "file" ? null : th} onClick={() => f.t !== "file" && setSort(sort.k === f.k && sort.dir === "asc" ? { k: f.k, dir: "desc" } : { k: f.k, dir: "asc" })}>{f.t === "file" ? "Banner" : f.l}{sort.k === f.k ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}</th>)}<th>Actions</th></tr></thead><tbody>
        {view.map((r, i) => <tr key={r._id}><td>{(cur - 1) * size + i + 1}</td>{cols.map((f) => <td key={f.k}>{val(r, f)}</td>)}
          <td className="act"><button title="View" onClick={() => setModal({ mode: "view", id: r._id })}>👁️</button><button title="Edit" onClick={() => openForm(r)}>✏️</button>
            {M.link && <><button title="Copy link" onClick={() => copy(r)}>🔗</button><button title="Share" onClick={() => share(r)}>📤</button></>}
            {r.phone && <a title="WhatsApp" href={`https://wa.me/91${r.phone}`} target="_blank">💬</a>}{col === "policies" && <button title="Mark paid (next due)" onClick={() => paid(r)}>✔️</button>}
            <button title="Delete" onClick={() => del(r)}>🗑️</button></td></tr>)}
        {!view.length && <tr><td colSpan={cols.length + 2} style={{ textAlign: "center" }}>No records found. Click "New {name}" to add one.</td></tr>}</tbody></table>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 12, fontSize: 13 }}>
        <span>Showing {all.length ? (cur - 1) * size + 1 : 0}–{Math.min(cur * size, all.length)} of {all.length}</span>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>{[["«", 1, cur === 1], ["‹ Prev", cur - 1, cur === 1]].map(([l, p, d]) => <button key={l} className="btn" style={{ padding: "6px 12px" }} disabled={d} onClick={() => setPage(p)}>{l}</button>)}
          Page {cur} / {pages}{[["Next ›", cur + 1, cur === pages], ["»", pages, cur === pages]].map(([l, p, d]) => <button key={l} className="btn" style={{ padding: "6px 12px" }} disabled={d} onClick={() => setPage(p)}>{l}</button>)}</span></div></div>
    {modal?.mode === "form" && <form onSubmit={save}><Modal title={form._id ? `✏️ Edit ${name}` : `➕ New ${name}`} onClose={() => setModal(null)} foot={<><button type="button" className="qbtn" onClick={() => setModal(null)}>Cancel</button><Btn type="submit" className="qbtn p" busy={saving}>{form._id ? "Update" : "Save"} {name.toLowerCase()}</Btn></>}>
      <div className="qb"><div className="qg">{M.fields.filter((f) => !f.noForm).map((f) => <label key={f.k} style={f.span ? { gridColumn: "span 2" } : null}><span className="ql">{f.l}</span>
        {f.t === "file" ? <><span className="qdrop">{form[f.k] ? <img src={form[f.k]} alt="" className="qban" /> : "📷 Click to upload banner image"}<input type="file" accept="image/*" hidden onChange={(e) => pick(e, f.k)} /></span>
          {form[f.k] && <button type="button" style={{ marginTop: 6, fontSize: 12, color: "#b91c1c", background: "none", border: 0, cursor: "pointer" }} onClick={() => setForm({ ...form, [f.k]: "" })}>Remove banner</button>}</>
        : f.t === "select" ? <select className="qi" value={form[f.k] || ""} onChange={set(f.k)}>{f.o.map((o) => <option key={o}>{o}</option>)}</select>
        : f.t === "meeting" ? <select className="qi" value={form[f.k] || ""} onChange={set(f.k)}><option value="">Select meeting</option>{D.meetings.map((m) => <option key={m._id} value={m._id}>{m.title} ({m.date})</option>)}</select>
        : f.t === "textarea" ? <textarea className="qi" rows={3} value={form[f.k] || ""} onChange={set(f.k)} />
        : <input className="qi" type={f.t || "text"} step="any" value={form[f.k] ?? ""} onChange={set(f.k)} required={!!f.req} />}</label>)}</div></div></Modal></form>}
    {v && <Modal title={`📄 ${name} details`} onClose={() => setModal(null)} foot={<>{M.link && <><button className="qbtn" onClick={() => copy(v)}>🔗 Copy link</button><button className="qbtn" onClick={() => share(v)}>📤 Share</button><a className="qbtn" href={M.link + v._id} target="_blank">Open page ↗</a></>}
      {v.phone && <a className="qbtn" href={`https://wa.me/91${v.phone}`} target="_blank">💬 WhatsApp</a>}<button className="qbtn p" onClick={() => openForm(v)}>✏️ Edit</button></>}>
      <div className="qb">{M.fields.filter((f) => f.t === "file").map((f) => v[f.k] ? <img key={f.k} src={v[f.k]} alt="" className="qban" style={{ marginBottom: 14 }} /> : <div key={f.k} className="qban" style={{ display: "grid", placeItems: "center", color: "#9ca3af", marginBottom: 14 }}>No banner</div>)}
        <h3 style={{ fontSize: 20, marginBottom: 12 }}>{v[M.key]}</h3>
        <div className="qg">{M.fields.filter((f) => f.k !== M.key && f.t !== "file" && f.t !== "textarea" && !f.noView).map((f) => <div key={f.k} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}><div style={{ fontSize: 11, color: "#6b7280" }}>{f.l}</div><b>{val(v, f)}</b></div>)}
          {col === "policies" && <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}><div style={{ fontSize: 11, color: "#6b7280" }}>Yearly Earning</div><b>{inr(earn(v))}</b></div>}
          {col === "meetings" && <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}><div style={{ fontSize: 11, color: "#6b7280" }}>Registered / Attended / Guests</div><b>{ck.length} / {ck.filter((c) => c.status === "Attended").length} / {ck.reduce((s, c) => s + (+c.guests || 0), 0)}</b></div>}</div>
        {M.fields.filter((f) => f.t === "textarea" && v[f.k]).map((f) => <div key={f.k} style={{ marginTop: 14 }}><b>{f.l}</b><p style={{ fontSize: 14, color: "#374151", whiteSpace: "pre-line" }}>{v[f.k]}</p></div>)}
        {M.link && <p style={{ marginTop: 12, fontSize: 12, background: "#f3f4f6", borderRadius: 8, padding: 8, wordBreak: "break-all" }}>{link(v)}</p>}</div></Modal>}
  </div>;
}
