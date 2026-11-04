/*
 Base64 implementation of the Damm error detection algorithm in JavaScript

 Copyright (c) 2026, Daniel Tillett
 SPDX-License-Identifier: BSD-2-Clause
 */

/** The base64url alphabet (RFC 4648 section 5), so base64 zero is 'A'. Input is case-sensitive. */
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Returned by checkDigit() when the input contains a character outside the alphabet. */
export const INVALID = null;

const BASE = 64;

/*
 The quasigroup operation x * y = 2(x XOR y) in GF(64), using the primitive
 polynomial x^6 + x + 1. It has a zero diagonal and is totally anti-symmetric,
 so every single-character error and adjacent transposition is detected.
 */
function op(x, y) {
  const z = (x ^ y) << 1;
  return z & BASE ? z ^ 0x43 : z;
}

const VALUES = new Map([...ALPHABET].map((char, i) => [char, i]));

/**
 * Returns the value (0-63) of a base64 character, or -1 if it is not in the alphabet.
 * @param {string} char
 * @returns {number}
 */
export function value(char) {
  return VALUES.get(char) ?? -1;
}

/**
 * Returns the base64 check digit for a string, or INVALID (null) if the string
 * contains a character outside the alphabet.
 * @param {string} code
 * @returns {string | null}
 */
export function checkDigit(code) {
  if (typeof code !== 'string') {
    throw new TypeError('code must be a string');
  }

  let interim = 0;

  for (const char of code) {
    const v = value(char);

    if (v < 0) {
      return INVALID;
    }

    interim = op(interim, v);
  }

  return ALPHABET[interim];
}

/**
 * Returns true if the last character of a string is a valid Damm check digit
 * for the characters before it.
 * @param {string} code
 * @returns {boolean}
 */
export function isValid(code) {
  return code !== '' && checkDigit(code) === ALPHABET[0];
}
