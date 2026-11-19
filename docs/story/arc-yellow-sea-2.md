# Arc 4: After the Shoal (Yellow Sea, part 2)

Design doc, narration only: nothing here changes odds, money, tension or approval. It picks up where
[arc-yellow-sea.md](arc-yellow-sea.md) beat 5 (Aftermath) leaves off and folds in two open TODO items:
**reporter calls** (Arc B4 in [arc-rivalries.md](arc-rivalries.md)) and the **Quiet Ledger leak**.
People: [cast.md](cast.md). Places and companies: [world.md](world.md).

**One-line story:** the guns are quiet, but someone paid for the Kestrel Shoal war. Ines Barros starts leaking
transfers one at a time, Priya Lindqvist follows the money, and the player learns whether their own name is
anywhere near it.

## State

Stored later in `S.story.ys2 = {st, d0, end, lk, rp, cd}` (defaulted for old saves):
`st` beat 0..4, `d0` day the arc started, `end` = which part-1 ending (`"conq"|"accord"|"frozen"`),
`lk` = leaks shown (max 3), `rp` = reporter call done (0/1), `cd` = day before which no new run starts.

Starts only when part 1 reaches beat 5 (`S.story.ys.st===5`) and `ys2.st===0` and `S.day>=ys2.cd`.
Offline (`quiet`): beats advance silently, then one `S.log` line: "While you were away: {beat names}".
Shared worlds: only `wfAuth()` advances `ys2.st`; every client shows the same text.

## Beats

| # | Beat | Enter when (real state) | What the world says |
|---|---|---|---|
| 1 | **Counting the Dead** | 1 day after `ys.st===5` | Dr Amara Nwosu (Nairobi relief): "We counted the shelters before the guns. We will count them after." Ending-specific line below. |
| 2 | **The First Leak** | 2-4 days after beat 1, and the Yellow Sea war had a `wfBreak` record in the `S.wf` feed | Ines Barros leak (see "Quiet Ledger leak"). The Counting House: "One transfer confirmed. Two to go." |
| 3 | **The Reporter** | one of the reporter triggers below, else skipped | Priya Lindqvist phone call (flavour choices only). |
| 4 | **The Ledger Closes** | 8 days after beat 1 | Closing line per ending; `cd=S.day+40`, `st=0`. Unlocks journal chapter "After the Shoal". |

Early end: if a new war on a Yellow Sea pair reaches `w.l>=3`, drop to beat 4 with the line "The Shoal is
not finished with us" and hand back to part 1.

### Ending-specific lines (beat 1 and beat 4)

| Part-1 ending | Beat 1 | Beat 4 |
|---|---|---|
| Conquest | Aiko Tanabe: "A flag is not a peace." Talia Okonjo files from a city with a new name on the signs. | "The Counting House: every flag has an invoice." |
| Seoul Accord | Ambassador Demirel: "Signed in Istanbul. Kept, we hope, in Busan." | "Kestrel Shoal ferries run on time. Nobody mentions who paid for the fuel." |
| Frozen line | Park Ji-hwan: "A ceasefire is a war that is resting." | "Sanctions stay. The line stays. The money, the Counting House says, has already moved on." |

## The Quiet Ledger leak (folds in TODO "Quiet Ledger leak")

A rare news line that hints which **company** funded a recent `wfBreak` war, read from the `S.wf` donor feed.
Rules: at most one leak per 6 days, at most 3 per arc run (`lk`), and outside this arc the same event may fire
for any `wfBreak` war at 2% per day. Never names the player; if the top donor was the player, the leak names
"a private account" instead.

Leak lines (signed Ines Barros, via the Counting House):
- "A transfer of {amt} left an account in {HQ city} two days before {fav} and {oth} went to war."
- "The Notary cleared it at 03:00. The account holder sells {product} in {n} countries."
- "I was in the room when they called it insurance. {Company} does not insure ships."
- Player was top donor: "One account paid more than the rest. It is not a company. I will not say more yet."

{Company}, {HQ city} and {product} come from [world.md](world.md) for the top company donor on that war.

## Reporter calls (folds in TODO "reporter calls", Arc B4)

One phone call per arc run (`rp`). Choices are flavour only: no fines, arrests or approval changes.

| Trigger | Caller | Text | Choices (flavour) |
|---|---|---|---|
| Player took 3+ backer offers (`S.story.rv.off.taken>=3`), or a taken offer was followed by `wfBreak` on that pair within 3 days | **Priya Lindqvist** | "I am writing about the Ledger and the Kestrel Shoal. A transfer matches one in your books. Do you want to comment?" | "No comment" → "Then I will write that you declined." · "Ask what she knows" → "Less than I want. More than you'd like." |
| Player declined offers and took none (`declined>=1`, `taken==0`) | **Dr Amara Nwosu** | "Someone turned down money to start a fight. I do not know who. Thank you anyway." | "You're welcome" / "Just business" → "Then it was good business." |
| Neither | none | Beat 3 is skipped silently. | |

Priya never says "you started the war"; she only says a transfer matches. Same rule as Arc B.

## Journal chapter (for STORYCH later)

- id `ys2`, title "Chapter 7b: After the Shoal", unlock `story().ys2.st>=1`:
  "The Yellow Sea is quiet, and quiet is when the bills come in. A defector called Ines Barros starts
  leaking the Ledger one transfer at a time, and Priya Lindqvist wants to know whose name is on them."

## Hand-off

- **meridian-events**: wire the leak event and the reporter call from this doc (the two TODO items now
  point here). Narration only; any odds stay as written above.
- **meridian-builder**: add `S.story.ys2` defaults, the beats in the story tick next to the Yellow Sea arc,
  and the `ys2` STORYCH entry.
