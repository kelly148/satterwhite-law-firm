import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./_core/adminAuth";

describe("admin password hashing", () => {
  it("verifies a correct password", async () => {
    const stored = await hashPassword("correct-horse-battery-staple");
    await expect(
      verifyPassword("correct-horse-battery-staple", stored)
    ).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const stored = await hashPassword("correct-horse-battery-staple");
    await expect(verifyPassword("wrong-password", stored)).resolves.toBe(false);
  });

  it("is case sensitive", async () => {
    const stored = await hashPassword("MixedCasePassword1");
    await expect(verifyPassword("mixedcasepassword1", stored)).resolves.toBe(
      false
    );
  });

  it("salts each hash, so the same password never produces the same digest", async () => {
    const a = await hashPassword("same-password-twice");
    const b = await hashPassword("same-password-twice");
    expect(a).not.toBe(b);
    await expect(verifyPassword("same-password-twice", a)).resolves.toBe(true);
    await expect(verifyPassword("same-password-twice", b)).resolves.toBe(true);
  });

  it("produces the documented scrypt:<salt>:<key> shape", async () => {
    const stored = await hashPassword("shape-check-password");
    const [scheme, salt, key] = stored.split(":");
    expect(scheme).toBe("scrypt");
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
    expect(key).toMatch(/^[0-9a-f]{128}$/);
  });

  it("rejects a malformed stored hash instead of throwing", async () => {
    await expect(verifyPassword("anything", "not-a-hash")).resolves.toBe(false);
    await expect(verifyPassword("anything", "scrypt:zz:zz")).resolves.toBe(
      false
    );
    await expect(verifyPassword("anything", "")).resolves.toBe(false);
  });

  it("rejects a digest of the wrong key length", async () => {
    await expect(verifyPassword("anything", "scrypt:abcd:0011")).resolves.toBe(
      false
    );
  });
});
