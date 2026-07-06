import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../lib/models/Admin";

async function main() {
  const uri = process.env.DATABASE_URL;
  const name = process.env.ADMIN_NAME || "Site Administrator";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!uri) throw new Error("DATABASE_URL is not set");
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set to seed the first admin");
  }

  await mongoose.connect(uri);

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin with email ${email} already exists — skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await Admin.create({
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    role: "SUPER_ADMIN",
    createdBy: null,
  });

  console.log(`Created Super Admin: ${email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
