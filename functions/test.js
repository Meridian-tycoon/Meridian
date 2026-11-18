const assert = require("assert");
const { check } = require("./check");
const H = 36e5;
// normal growth: no flag
assert.deepStrictEqual(check({ nw: 2e9, day: 50, ms: 0 }, { nw: 3e9, day: 52, ms: H }), []);
// small numbers never flag
assert.deepStrictEqual(check({ nw: 1e5, ms: 0 }, { nw: 4e8, ms: 60000 }), []);
// edited save: $10M to $50B in 5 minutes
assert.ok(check({ nw: 1e7, day: 20, ms: 0 }, { nw: 5e10, day: 20, ms: 3e5 }).length >= 1);
// above max
assert.ok(check(null, { nw: 5e15 })[0].includes("maximum"));
// day jump
assert.ok(check({ nw: 1e9, day: 10, ms: 0 }, { nw: 2e9, day: 900, ms: H }).some(x => x.includes("day jumped")));
// a long offline gap with steady growth is fine
assert.deepStrictEqual(check({ nw: 1e9, day: 10, ms: 0 }, { nw: 2e10, day: 40, ms: 48 * H }), []);
console.log("anti-cheat checks ok");
