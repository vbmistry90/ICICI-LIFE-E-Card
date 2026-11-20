export const FREQ = { Monthly: 1, Quarterly: 3, "Half-Yearly": 6, Yearly: 12 }, PERYR = { Monthly: 12, Quarterly: 4, "Half-Yearly": 2, Yearly: 1 };
export const inr = (n) => (n === "" || n == null || isNaN(n) ? "-" : "₹" + Math.round(+n).toLocaleString("en-IN"));
export const days = (d) => Math.ceil((new Date(d) - new Date(new Date().toDateString())) / 864e5);
export const addM = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x.toISOString().slice(0, 10); };
export const earn = (p) => (+p.premium || 0) * (PERYR[p.frequency] || 1) * (+p.commissionPct || 0) / 100;
