/* Pure anti-cheat check, no Firebase needed (tested by test.js).
   a = before, b = after: {nw, day, ms}. ms = real time of the write in milliseconds. Returns a list of reasons. */
const DEFAULTS = {
  maxNw: 1e15,           // above this is impossible at any point
  minJump: 5e8,          // ignore rises smaller than $500M
  maxGrowthPerHour: 20,  // net worth may at most x20 per real hour between two writes
  maxGrowthPerDay: 3,    // net worth may at most x3 per in-game day passed
  maxDayJump: 400,       // in-game days that can pass between two cloud saves
};
const num = x => (typeof x === "number" && isFinite(x) ? x : null);
function fmt(n) {
  const a = Math.abs(n);
  return a >= 1e12 ? (n / 1e12).toFixed(1) + "T" : a >= 1e9 ? (n / 1e9).toFixed(1) + "B" : a >= 1e6 ? (n / 1e6).toFixed(1) + "M" : Math.round(n) + "";
}
function check(a, b, c) {
  c = Object.assign({}, DEFAULTS, c || {});
  const r = [], nw = num(b && b.nw);
  if (nw === null) return r;
  if (nw > c.maxNw) r.push(`net worth $${fmt(nw)} is above the possible maximum`);
  const pnw = num(a && a.nw);
  if (pnw === null) return r;
  if (nw - Math.max(pnw, 0) < c.minJump) return r;
  const f = nw / Math.max(pnw, 1e6);
  const hrs = Math.max(((b.ms || 0) - (a.ms || 0)) / 36e5, 1 / 60);
  if (f > Math.pow(c.maxGrowthPerHour, Math.max(hrs, 1)))
    r.push(`net worth x${f.toFixed(1)} in ${hrs < 1 ? Math.round(hrs * 60) + " min" : hrs.toFixed(1) + " h"} ($${fmt(pnw)} to $${fmt(nw)})`);
  const pd = num(a.day), d = num(b.day);
  if (pd !== null && d !== null) {
    const dd = d - pd;
    if (dd > c.maxDayJump) r.push(`in-game day jumped ${dd} days in one save`);
    else if (dd >= 0 && f > Math.pow(c.maxGrowthPerDay, Math.max(dd, 1)))
      r.push(`net worth x${f.toFixed(1)} over ${dd} in-game day${dd === 1 ? "" : "s"}`);
  }
  return r;
}
module.exports = { check, DEFAULTS, num };
