export default async () => {
  const r = await fetch(`${process.env.URL}/api/cron?key=${process.env.CRON_SECRET}`);
  console.log(await r.text());
};
export const config = { schedule: "30 3 * * *" }; // daily 9:00 AM IST
