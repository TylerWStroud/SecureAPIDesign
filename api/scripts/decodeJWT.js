/**
 * Decodes and verifies a JWT token.
 * Usage (PowerShell or terminal):
 *   node api/scripts/decodeJWT.js <token>
 *
 * Example:
 *   node api/scripts/decodeJWT.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * This script will:
 * - Decode the JWT header and payload (base64url decoding)
 * - Verify the signature using JWT_SECRET from .env
 * - Show token expiration information
 */

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function decodeJWT() {
  const token = process.argv[2];

  if (!token) {
    console.error(
      "Please provide a JWT token.\nUsage: node api/scripts/decodeJWT.js <token>"
    );
    process.exit(1);
  }

  console.log("\n========== JWT Token Analysis ==========\n");

  try {
    // Decode without verification (shows payload even if expired/invalid)
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      console.error("Invalid JWT token format");
      process.exit(1);
    }

    // Display header
    console.log("HEADER:");
    console.log(JSON.stringify(decoded.header, null, 2));
    console.log();

    // Display payload
    console.log("PAYLOAD:");
    console.log(JSON.stringify(decoded.payload, null, 2));
    console.log();

    // Display expiration info
    if (decoded.payload.exp) {
      const expDate = new Date(decoded.payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;

      console.log("  EXPIRATION:");
      console.log(`   Expires: ${expDate.toISOString()}`);
      console.log(`   Status:  ${isExpired ? " EXPIRED" : " Valid"}`);

      if (!isExpired) {
        const timeLeft = Math.round((expDate - now) / 1000 / 60);
        console.log(`   Time left: ${timeLeft} minutes`);
      }
      console.log();
    }

    if (decoded.payload.iat) {
      const iatDate = new Date(decoded.payload.iat * 1000);
      console.log(" ISSUED AT:");
      console.log(`   ${iatDate.toISOString()}`);
      console.log();
    }

    // Verify signature
    console.log(" SIGNATURE VERIFICATION:");
    if (!JWT_SECRET) {
      console.log("JWT_SECRET not found in .env - cannot verify signature");
    } else {
      try {
        jwt.verify(token, JWT_SECRET);
        console.log("Signature is VALID");
      } catch (verifyErr) {
        if (verifyErr.name === "TokenExpiredError") {
          console.log("Token expired but signature is valid");
        } else if (verifyErr.name === "JsonWebTokenError") {
          console.log("Signature is INVALID (token was tampered with)");
        } else {
          console.log(`Verification failed: ${verifyErr.message}`);
        }
      }
    }

    console.log("\n========================================\n");
  } catch (err) {
    console.error("Error decoding JWT:", err.message);
    process.exit(1);
  }
}

decodeJWT();
