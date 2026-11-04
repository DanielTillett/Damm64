/*
 Base64 implementation of the Damm error detection algorithm in C

 Copyright (c) 2026, Daniel Tillett
 SPDX-License-Identifier: BSD-2-Clause

 Background
 The Damm algorithm is a check digit algorithm that detects all single-digit
 errors and all adjacent transposition errors. Prepending leading zeros
 ('A' in this alphabet) does not affect the check digit.
 https://en.wikipedia.org/wiki/Damm_algorithm
 */

#include "damm64.h"

const char damm64_alphabet[DAMM64_BASE + 1] =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/*
 The quasigroup operation x * y = 2(x XOR y) in GF(64), using the primitive
 polynomial x^6 + x + 1. XOR gives a zero diagonal, and because 2 and 2^2 + 2
 are both non-zero in the field the operation is totally anti-symmetric, so
 every single-character error and adjacent transposition is detected. This is
 the same construction as the base32 table in damm32 (which uses x^5 + x + 1).
 */
static int damm64_op(int x, int y) {
    int z = (x ^ y) << 1;

    return (z & DAMM64_BASE) ? z ^ 0x43 : z;
}

int damm64_value(char c) {
    if (c >= 'A' && c <= 'Z') {
        return c - 'A';
    }
    if (c >= 'a' && c <= 'z') {
        return c - 'a' + 26;
    }
    if (c >= '0' && c <= '9') {
        return c - '0' + 52;
    }
    if (c == '-') {
        return 62;
    }
    if (c == '_') {
        return 63;
    }
    return -1;
}

char damm64_check_digit(const char *code) {
    int interim = 0;

    for (const char *p = code; *p != '\0'; ++p) {
        int i = damm64_value(*p);

        if (i < 0) {
            return DAMM64_INVALID;
        }

        interim = damm64_op(interim, i);
    }

    return damm64_alphabet[interim];
}

bool damm64_is_valid(const char *code) {
    return code[0] != '\0' && damm64_check_digit(code) == damm64_alphabet[0];
}
