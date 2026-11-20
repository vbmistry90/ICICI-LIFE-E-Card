"use client";
import { useEffect, useState } from "react";
export const Sk = ({ h = 16, w = "100%", r = 8, style }) => <div className="sk" style={{ height: h, width: w, borderRadius: r, ...style }} />;
export function Btn({ onClick, children, className = "btn", style, type = "button", busy: ext, disabled, ...rest }) {
  const [b, setB] = useState(false); const busy = ext ?? b;
  const click = async (e) => { if (!onClick) return; setB(true); try { await onClick(e); } finally { setB(false); } };
  return <button type={type} className={className} style={style} disabled={busy || disabled} onClick={type === "submit" ? undefined : click} {...rest}>{busy && <span className="spin" />}{children}</button>;
}
const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i));
export const CardSk = () => <div className="wrap">
  <div className="card"><Sk h={96} w={96} r={48} style={{ margin: "0 auto 12px" }} /><Sk h={22} w="60%" style={{ margin: "0 auto 8px" }} /><Sk h={14} w="80%" style={{ margin: "0 auto" }} /></div>
  <div className="card"><div className="grid">{rep(6, (i) => <Sk key={i} h={44} r={12} />)}</div></div>
  <div className="card">{rep(5, (i) => <Sk key={i} h={18} style={{ marginBottom: 12 }} />)}</div></div>;
export const MeetSk = () => <div className="wrap"><Sk h={180} r={20} style={{ marginBottom: 16 }} />
  <div className="card"><Sk h={24} w="70%" style={{ marginBottom: 12 }} />{rep(4, (i) => <Sk key={i} h={14} style={{ marginBottom: 10 }} />)}</div>
  <div className="card">{rep(4, (i) => <Sk key={i} h={42} r={10} style={{ marginBottom: 10 }} />)}</div></div>;
export const PageSk = () => <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}><Sk h={26} w={260} style={{ marginBottom: 16 }} />
  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>{rep(6, (i) => <Sk key={i} h={44} r={12} style={{ flex: 1 }} />)}</div>
  <div className="card"><div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>{rep(8, (i) => <Sk key={i} h={50} />)}</div></div>
  <div className="card">{rep(6, (i) => <Sk key={i} h={18} style={{ marginBottom: 12 }} />)}</div></div>;
export function Num({ to = 0, money }) {
  const [v, setV] = useState(0);
  useEffect(() => { let s = null, id; const f = (t) => { s ??= t; const k = Math.min((t - s) / 900, 1); setV(to * k); if (k < 1) id = requestAnimationFrame(f); }; id = requestAnimationFrame(f); return () => cancelAnimationFrame(id); }, [to]);
  const r = Math.round(v).toLocaleString("en-IN"); return <>{money ? "₹" + r : r}</>;
}
export function Modal({ title, onClose, children, foot }) {
  return <div className="qov" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="qm"><div className="qh"><h3>{title}</h3><button type="button" className="qx" onClick={onClose}>✕</button></div>{children}{foot && <div className="qf">{foot}</div>}</div></div>;
}
