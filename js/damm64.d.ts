/** The base64url alphabet: A-Z a-z 0-9 - _ (input is case-sensitive). */
export const ALPHABET: string;

/** Returned by checkDigit() when the input contains a character outside the alphabet. */
export const INVALID: null;

/** Returns the value (0-63) of a base64 character, or -1 if it is not in the alphabet. */
export function value(char: string): number;

/** Returns the base64 check digit for a string, or INVALID (null) for characters outside the alphabet. */
export function checkDigit(code: string): string | null;

/** Returns true if the last character is a valid Damm check digit for the characters before it. */
export function isValid(code: string): boolean;
