export const ENV = {
  // Kept as the JWT `appId` claim so existing sessions and the shared session
  // helpers keep the same shape. Any stable string works.
  appId: process.env.VITE_APP_ID ?? "satterwhite-law",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Owner identity for the single admin account.
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "owner",
  ownerName: process.env.OWNER_NAME ?? "Kelly Satterwhite",
  ownerEmail: process.env.OWNER_EMAIL ?? "kelly@thesatterwhitelawfirm.com",

  // scrypt digest of the admin password: scrypt:<saltHex>:<keyHex>
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
};
