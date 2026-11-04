# damm64: base64url Damm check digits

The [Damm algorithm](https://en.wikipedia.org/wiki/Damm_algorithm) is a check digit algorithm that detects every single-character error and every adjacent transposition. Prepending leading zeros does not change the check digit.

**damm64** applies it to the base64url alphabet ([RFC 4648 §5](https://www.rfc-editor.org/rfc/rfc4648#section-5)), with matching implementations in C, PHP and JavaScript. Each one is a library plus a command-line tool, and all three give identical output.

```
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_
```

Base64 zero is `A`. Input is **case-sensitive**.

## Usage

```bash
npm install damm64
```

```js
import { checkDigit, isValid, value, INVALID } from 'damm64';

checkDigit('Hello');  // 'p', or INVALID (null)
isValid('Hellop');    // true
value('H');           // 0-63, or -1 if not in the alphabet
```

The package is a dependency-free ES module with TypeScript declarations, and includes the `damm64` command (`npx damm64`). C and PHP implementations with identical output are in the [GitHub repository](https://github.com/DanielTillett/Damm64).

## Licence

BSD 2-Clause
