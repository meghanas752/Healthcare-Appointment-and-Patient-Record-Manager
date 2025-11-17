// create_user.js
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', // change if needed
    password: 'ssvm@1234', // change to your MySQL password
    database: 'hmprs' // or your DB name from .env
  });

  const username = 'meghana';
  const email = 'meghana@example.com';
  const password = 'mypassword'; // the password you'll use to log in
  const role = 'patient';

  const hash = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (username, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `;
  await connection.execute(sql, [username, email, hash, role]);

  console.log('✅ User created successfully!');
  console.log('Use these credentials to log in:');
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);

  await connection.end();
}

main().catch(err => console.error('Error:', err));
