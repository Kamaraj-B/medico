require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db.config");
const User = require("../models/user.model");

const randomPassword = () => `Med${Math.random().toString(36).slice(2, 10)}9`;

async function run() {
  await connectDB();
  const users = await User.find({});
  const generatedCredentials = [];

  for (const user of users) {
    let changed = false;

    if (!user.accountStatus) {
      user.accountStatus = "active";
      changed = true;
    }
    if (typeof user.requirePasswordChange !== "boolean") {
      user.requirePasswordChange = false;
      changed = true;
    }

    // Backfill password for any account created during Google-only phase.
    if (!user.passwordHash) {
      const tempPassword = randomPassword();
      user.passwordHash = await bcrypt.hash(tempPassword, 12);
      user.requirePasswordChange = true;
      user.accountStatus = user.accountStatus || "active";
      changed = true;
      generatedCredentials.push({
        id: String(user._id),
        email: user.email,
        role: user.role,
        temporaryPassword: tempPassword,
      });
    }

    if (changed) {
      await user.save();
    }
  }

  console.log("Migration completed.");
  console.log(`Users scanned: ${users.length}`);
  console.log(`Temporary credentials generated: ${generatedCredentials.length}`);
  if (generatedCredentials.length) {
    console.log(
      "IMPORTANT: Share temporary passwords securely and force users to change password on first login."
    );
    console.table(generatedCredentials);
  }

  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error("Migration failed:", err);
  await mongoose.connection.close();
  process.exit(1);
});

