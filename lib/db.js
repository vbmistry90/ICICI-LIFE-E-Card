import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";
let p;
export const db = async () => { p ??= new MongoClient(process.env.MONGODB_URI).connect(); return (await p).db("advisor"); };
export { ObjectId };
const sign = (v) => crypto.createHmac("sha256", process.env.JWT_SECRET).update(v).digest("hex");
export const makeToken = () => { const e = Date.now() + 7 * 864e5; return e + "." + sign("" + e); };
export const isAuthed = (req) => {
  const t = req.cookies.get("adm")?.value; if (!t) return false;
  const [e, s] = t.split("."); return +e > Date.now() && s === sign(e);
};
