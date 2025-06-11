const bcrypt = require('bcryptjs');

// Generate hash for 'admin123'
const password = 'admin123';
const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nMongoDB insert command:');
console.log(`db.users.insertOne({
  username: "admin",
  password: "${hash}",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
});`);