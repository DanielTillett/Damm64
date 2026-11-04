/*
 Base64 implementation of the Damm error detection algorithm in C

 Copyright (c) 2026, Daniel Tillett
 SPDX-License-Identifier: BSD-2-Clause
 */

#ifndef DAMM64_H
#define DAMM64_H

#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define DAMM64_BASE 64

/* Returned by damm64_check_digit() when the input contains a character
   outside the base64 alphabet. '\0' can never be a check digit. */
#define DAMM64_INVALID '\0'

/*
 The base64url alphabet (RFC 4648 section 5), so base64 zero is 'A'.
 Input is case-sensitive.
 */
extern const char damm64_alphabet[DAMM64_BASE + 1];

/*
 Returns the value (0-63) of a base64 character, or -1 if the character is not
 in the alphabet.
 */
int damm64_value(char c);

/*
 Returns the base64 check digit for a null-terminated string, or
 DAMM64_INVALID if the string contains a character outside the alphabet.
 */
char damm64_check_digit(const char *code);

/*
 Returns true if the last character of a null-terminated string is a valid
 Damm check digit for the characters before it.
 */
bool damm64_is_valid(const char *code);

#ifdef __cplusplus
}
#endif

#endif /* DAMM64_H */
