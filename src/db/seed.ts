import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.env.SEED_OWNER_EMAIL || "owner@example.com";
  const password = process.env.SEED_OWNER_PASSWORD || "changeme123";

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    console.log(`User ${email} already exists, skipping.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    name: "Shop Owner",
    email,
    passwordHash,
    role: "owner",
  });

  console.log(`Created owner account: ${email} / ${password}`);
  console.log("Change this password after first login.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
