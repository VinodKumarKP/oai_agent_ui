/* ── Helpers ─────────────────────────────────────────────────────────────── */

export const DESCRIPTION_MIN_LENGTH = 20;

// Parses any URL into display segments; returns null if invalid.
export function parseUrl(raw) {
    try {
        const u = new URL(raw.trim());
        return { scheme: u.protocol + '//', host: u.host, path: u.pathname };
    } catch {
        return null;
    }
}

// Returns true for valid Git remote URLs (HTTPS, SSH, and git:// protocols).
export function isValidGitUrl(raw) {
    const s = raw.trim();
    // HTTPS: https://github.com/user/repo or https://github.com/user/repo.git
    if (/^https?:\/\/.+\/.+\/.+/.test(s)) return true;
    // SSH: git@github.com:user/repo.git
    if (/^git@[\w.-]+:[\w./-]+/.test(s)) return true;
    // git:// protocol
    if (/^git:\/\/.+/.test(s)) return true;
    return false;
}

// Replaces spaces with underscores and lowercases a name string.
export function normalizeName(raw) {
    return raw.replace(/ /g, '_').toLowerCase();
}
