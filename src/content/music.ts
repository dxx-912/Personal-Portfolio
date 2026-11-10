// Music settings. The files themselves live in public/assets/audio/ (see CREDITS.md there).

export const music = {
    /** Background lofi volume, 0..1 (quiet but present). */
    lofiVolume: 0.088,
    /** How far the lofi drops while the speaker, the piano, or a video plays (0..1 of its volume). */
    duckTo: 0.05,
    /** Crossfade between lofi tracks, in seconds. */
    crossfade: 4,
    /**
     * Where the speaker's featured track starts, in seconds. The file is the full third movement
     * of Rachmaninoff's Piano Concerto No. 2; 612 s is just before the C major Maestoso coda.
     * [TODO: Daniel to confirm by ear]
     */
    featuredStart: 612,
    featuredVolume: 0.595
};
