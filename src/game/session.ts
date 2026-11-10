// Stats for this visit only (iteration 5, group B). Nothing here is saved: every page load starts
// fresh with Caffeine 0/7, Sleep 8/8, Creativity 200/200. Lives outside the scene so it survives
// walking between rooms.

export const CAFFEINE_MAX = 7;
export const SLEEP_MAX = 8;
/** Walking speed multiplier once Daniel has had the Red Bull. */
export const CAFFEINE_BOOST = 1.3;
/** Sleep drops by one every this many ms of active play. */
export const SLEEP_TICK_MS = 90_000;

export const session = {
    caffeine: 0,
    sleep: SLEEP_MAX,
    /** Active play since waking (no panel open, tab visible). */
    activeMs: 0,
    /** Active play since Sleep last changed. */
    sleepMs: 0,
    caffeineHints: 0,
    nextCaffeineHintAt: 20_000,
    /** Tired lines said in the current tired stretch (resets when Sleep refills). */
    tiredHints: 0,
    nextTiredHintAt: 0,
    /** Last time any need line was said (activeMs), so two never land back to back. */
    lastLineAt: -Infinity,
    /** Each nap moves the window on: day, sunset, night, day... */
    todShift: 0,
    /** Basketball: where it came to rest, and this visit's tally. */
    ball: null as { x: number; y: number } | null,
    makes: 0,
    attempts: 0,
    /** Bed glow on: Sleep is low. Fridge glow on: hinted at but not drunk yet. */
    get tired() { return this.sleep <= 2; },
    get caffeinated() { return this.caffeine >= CAFFEINE_MAX; },
    get fridgeGlow() { return this.caffeineHints > 0 && !this.caffeinated; }
};

/** Random delay between need lines: 45 to 60 seconds. */
export const hintGap = () => 45_000 + Math.random() * 15_000;
