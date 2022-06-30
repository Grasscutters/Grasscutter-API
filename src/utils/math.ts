/**
 * Attempts to parse a version string into a number.
 * @param version The version string to parse.
 * @return 6942 from "6.9.420"
 */
export function toVersionNumber(version: string): number {
    return parseInt(version.replace(/\./g, ''));
}