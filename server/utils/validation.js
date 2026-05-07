export function requiredText(value) {
    if (typeof value !== "string") return "";
    return value.trim();
}

export function optionalText(value) {
    if (value == null) return "";
    return String(value).trim();
}

export function parseNonNegativeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
}

export function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
