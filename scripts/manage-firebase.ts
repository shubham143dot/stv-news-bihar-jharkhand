// scripts/manage-firebase.ts
import { adminDb, adminAuth } from '../lib/firebase/admin';

async function makeAdmin(email: string) {
  try {
    const user = await adminAuth.getUserByEmail(email);
    await adminDb.collection('users').doc(user.uid).set({
      isAdmin: true,
      updatedAt: new Date(),
    }, { merge: true });
    
    console.log(`\x1b[32m✅ SUCCESS: ${email} is now an Admin.\x1b[0m`);
    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m❌ ERROR: Could not find user with email ${email}\x1b[0m`);
    process.exit(1);
  }
}

async function exportPosts() {
  try {
    const snapshot = await adminDb.collection('posts').orderBy('createdAt', 'desc').get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(JSON.stringify(posts, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m❌ ERROR exporting posts: ${error}\x1b[0m`);
    process.exit(1);
  }
}

// Simple CLI Router
const args = process.argv.slice(2);
const command = args[0];
const value = args[1];

async function run() {
  switch (command) {
    case '--make-admin':
      if (!value) return console.log('Usage: --make-admin email@example.com');
      await makeAdmin(value);
      break;
    case '--export-posts':
      await exportPosts();
      break;
    default:
      console.log(`
🚀 STV News Automation CLI
--------------------------
Usage:
  npm run automate -- --make-admin <email>   # Give admin rights
  npm run automate -- --export-posts          # Backup all posts to JSON
      `);
  }
}

run();
