#!/usr/bin/env node
/**
 * Generate an ADMIN_PASSWORD_HASH value.
 *
 *   node scripts/hash-password.mjs 'your-password'
 *
 * Paste the output into Railway → Variables as ADMIN_PASSWORD_HASH.
 * The plaintext password is never stored anywhere.
 */
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);
const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs '<password>'");
  process.exit(1);
}

if (password.length < 12) {
  console.error("Refusing: use a password of at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const key = await scrypt(password, salt, 64);
console.log(`scrypt:${salt.toString("hex")}:${key.toString("hex")}`);
