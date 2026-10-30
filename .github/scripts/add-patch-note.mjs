// Adds one "What's new" entry to the top of PATCH_NOTES in index.html.
// Usage: node add-patch-note.mjs <version> <title line> [more title lines...]
import fs from "node:fs";
const [, , version, ...titles] = process.argv;
const file = process.env.PATCH_FILE || "index.html";
const items = titles
  .map(t => t.replace(/^\s*(feat|fix|chore|refactor|perf|style|docs|test)(\([^)]*\))?!?:\s*/i, "").trim())
  .filter(Boolean)
  .map(t => t[0].toUpperCase() + t.slice(1));
if (!version || !items.length) { console.log("Nothing to add."); process.exit(0); }
const html = fs.readFileSync(file, "utf8");
const marker = "const PATCH_NOTES=[";
const at = html.indexOf(marker);
if (at < 0) { console.error("PATCH_NOTES not found"); process.exit(1); }
if (html.includes(`{v:${JSON.stringify(version)},`)) { console.log("Entry exists."); process.exit(0); }
const entry = `\n {v:${JSON.stringify(version)},title:"What's new",items:[\n` +
  items.map(i => "  " + JSON.stringify(i)).join(",\n") + "]},";
const out = html.slice(0, at + marker.length) + entry + html.slice(at + marker.length);
fs.writeFileSync(file, out);
console.log(`Added ${version}: ${items.length} item(s).`);
