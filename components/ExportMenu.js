"use client";
import { useState } from "react";
import { Btn } from "./Ui";
export default function ExportMenu({ get }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false);
  const go = async (fmt) => {
    setOpen(false); setBusy(true);
    try {
      const { head, body, name, title } = get();
      if (fmt === "csv") { const t = [head, ...body].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + t], { type: "text/csv" })); a.download = name + ".csv"; a.click(); }
      else if (fmt === "excel") { const X = await import("xlsx"), ws = X.utils.aoa_to_sheet([head, ...body]), wb = X.utils.book_new(); ws["!cols"] = head.map((h) => ({ wch: Math.max(h.length + 2, 14) })); X.utils.book_append_sheet(wb, ws, "Data"); X.writeFile(wb, name + ".xlsx"); }
      else {
        const JP = (await import("jspdf")).default, AT = (await import("jspdf-autotable")).default, doc = new JP({ orientation: head.length > 6 ? "landscape" : "portrait" });
        const u8 = new Uint8Array(await (await fetch("/fonts/NotoSans-Regular.ttf")).arrayBuffer()); let bin = ""; for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        doc.addFileToVFS("NotoSans.ttf", btoa(bin)); doc.addFont("NotoSans.ttf", "NotoSans", "normal"); doc.setFont("NotoSans");
        doc.setFontSize(14); doc.text(title, 14, 15); doc.setFontSize(9); doc.text(`Generated ${new Date().toLocaleString("en-IN")} | ${body.length} records`, 14, 21);
        AT(doc, { head: [head], body: body.map((r) => r.map(String)), startY: 25, styles: { font: "NotoSans", fontSize: 8 }, headStyles: { font: "NotoSans", fontStyle: "normal", fillColor: [164, 18, 63] } }); doc.save(name + ".pdf");
      }
    } catch (e) { alert("Export failed: " + e.message); }
    setBusy(false);
  };
  return <div style={{ position: "relative" }}><Btn className="btn sq" title="Export" aria-label="Export" busy={busy} onClick={() => setOpen(!open)}>{busy ? null : "⬇️"}</Btn>
    {open && <><div style={{ position: "fixed", inset: 0, zIndex: 19 }} onClick={() => setOpen(false)} /><div style={{ position: "absolute", right: 0, top: 46, zIndex: 20, background: "#16213f", border: "1px solid #ffffff33", borderRadius: 12, overflow: "hidden", minWidth: 170 }}>
      {[["csv", "📄 CSV (.csv)"], ["excel", "📊 Excel (.xlsx)"], ["pdf", "📕 PDF (.pdf)"]].map(([f, t]) => <button key={f} onClick={() => go(f)} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: 0, color: "#fff", textAlign: "left", cursor: "pointer", fontSize: 14 }}>{t}</button>)}</div></>}</div>;
}
