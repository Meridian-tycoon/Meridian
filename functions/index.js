/* Meridian light anti-cheat (Firebase Cloud Functions, needs the Blaze plan).
   Watches players/{uid} (public profile) and saves/{uid} (cloud save summary) and flags impossible jumps.
   - Writes acflags/{uid}: one doc per suspect with the latest reasons. Read by the dev Suspects list (Settings > Online)
     and by the Desk watchdog agent (.claude/agents/meridian-watchdog.md).
   - A profile with an impossible net worth jump is put back to its previous net worth, so the leaderboard stays clean.
   - Bans (bans/{uid}, written by Mark from the Suspects list) are enforced by firestore.rules.
   - Mark's dev account is never flagged.
   Thresholds can be tuned without a deploy in Firestore config/anticheat (same keys as DEFAULTS in check.js). */
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { check, num } = require("./check");
admin.initializeApp();
const db = admin.firestore();

const DEV_UIDS = ["BRGRStgYLlbkVbrBTagBrDbpVyg1"];
let cfgCache = null, cfgAt = 0;
async function cfg() {
  if (cfgCache && Date.now() - cfgAt < 600000) return cfgCache;
  let c = {};
  try { const s = await db.doc("config/anticheat").get(); if (s.exists) c = s.data() || {}; } catch (e) { /* defaults */ }
  cfgCache = c; cfgAt = Date.now();
  return c;
}
const msOf = d => {
  const u = d && (d.updated || d.lastSeen);
  return u && u.toMillis ? u.toMillis() : num(d && d.at) || Date.now();
};
async function flag(uid, src, reasons, nw, name) {
  const ref = db.doc("acflags/" + uid);
  await db.runTransaction(async t => {
    const s = await t.get(ref), o = s.exists ? s.data() : {};
    const list = [{ src, why: reasons.join("; "), nw, at: Date.now() }].concat(o.list || []).slice(0, 20);
    t.set(ref, { uid, name: name || o.name || "", n: (o.n || 0) + 1, last: Date.now(), list, st: o.st === "banned" ? "banned" : "new" }, { merge: true });
  });
}
function sides(ev) {
  return [ev.data.before.exists ? ev.data.before.data() : null, ev.data.after.exists ? ev.data.after.data() : null];
}

exports.acProfile = onDocumentWritten({ document: "players/{uid}", region: "us-central1" }, async ev => {
  const uid = ev.params.uid;
  if (DEV_UIDS.includes(uid)) return;
  const [a, b] = sides(ev);
  if (!b || (a && a.nw === b.nw)) return; // deleted, or no net worth change (also our own correction below)
  const r = check(a && { nw: a.nw, ms: msOf(a) }, { nw: b.nw, ms: msOf(b) }, await cfg());
  if (!r.length) return;
  await flag(uid, "profile", r, num(b.nw), b.name);
  if (a && num(a.nw) !== null) await ev.data.after.ref.update({ nw: a.nw }).catch(() => null);
});

exports.acSave = onDocumentWritten({ document: "saves/{uid}", region: "us-central1" }, async ev => {
  const uid = ev.params.uid;
  if (DEV_UIDS.includes(uid)) return;
  const [a, b] = sides(ev);
  if (!b) return;
  const r = check(a && { nw: a.nw, day: a.day, ms: msOf(a) }, { nw: b.nw, day: b.day, ms: msOf(b) }, await cfg());
  if (!r.length) return;
  let name = "";
  try { const p = await db.doc("players/" + uid).get(); name = p.exists ? p.data().name || "" : ""; } catch (e) { /* no name */ }
  await flag(uid, "save", r, num(b.nw), name);
});
