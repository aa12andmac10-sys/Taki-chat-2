import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("使い方: node scripts/hash-password.mjs <パスワード>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log(hash);
