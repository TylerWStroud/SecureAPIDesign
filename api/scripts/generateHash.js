/**
 * Generates a bcrypt hash for a given password string.
 * Usage (PowerShell or terminal):
 *   node api/scripts/generateHash.js yourPasswordHere
 *
 * Example:
 *   node api/scripts/generateHash.js admin123
 */

import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

async function generateHash() {
  const password = process.argv[2];

  if (!password) {
    console.error(
      "Please provide a password.\nUsage: node api/scripts/generateHash.js <password>"
    );
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("\nPassword hash generated successfully!\n");
    console.log(`Input: ${password}`);
    console.log(`Hash:  ${hash}\n`);

    const verified = await bcrypt.compare(password, hash);
    console.log(
      verified
        ? "Hash verification successful!"
        : "Hash verification failed!"
    );
  } catch (err) {
    console.error("Error generating hash:", err);
    process.exit(1);
  }
}

generateHash();
