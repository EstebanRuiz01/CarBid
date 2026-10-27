import bcrypt from "bcryptjs";
const hash = await bcrypt.hash("1234", 11);
console.log(hash);
