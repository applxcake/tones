#!/usr/bin/env node

/**
 * Firebase Setup Script for Tones Music App
 * 
 * This script helps you set up Firebase for your music app.
 * We're using Firebase for everything: auth, database, and avatar URLs.
 * Run this after creating your Firebase project.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎵 Firebase Setup for Tones Music App');
console.log('📋 Complete Firebase Setup: Auth + Database + Avatar URLs\n');

// Check if config file exists
const configPath = path.join(__dirname, 'src/integrations/firebase/config.ts');
const configExists = fs.existsSync(configPath);

if (configExists) {
  console.log('✅ Firebase config file found');
  
  // Read current config
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Check if config has placeholder values
  if (configContent.includes('your-api-key')) {
    console.log('⚠️  Firebase config needs to be updated with your project details');
    console.log('\n📝 Please update the following file:');
    console.log(`   ${configPath}`);
    console.log('\n🔧 Replace the placeholder values with your Firebase project config:');
    console.log('   - apiKey');
    console.log('   - authDomain');
    console.log('   - projectId');
    console.log('   - storageBucket (can be ignored)');
    console.log('   - messagingSenderId');
    console.log('   - appId');
  } else {
    console.log('✅ Firebase config appears to be properly configured');
  }
} else {
  console.log('❌ Firebase config file not found');
  console.log('   Please ensure the Firebase integration files are created');
}

console.log('\n📋 Next Steps:');
console.log('1. Create a Firebase project at https://console.firebase.google.com/');
console.log('2. Enable Authentication (Email/Password and Google)');
console.log('3. Create Firestore Database');
console.log('4. Update the config file with your project details');
console.log('5. Deploy Firestore security rules (firestore.rules)');
console.log('6. Avatar images will be stored as URLs in Firestore user profiles');
console.log('   Users can provide image URLs (e.g., from imgur, cloudinary, etc.)');
console.log('7. Test the app!');

console.log('\n📚 For detailed instructions, see: FIREBASE_MIGRATION.md');

// Check if security rules files exist
const firestoreRulesPath = path.join(__dirname, 'firestore.rules');

if (fs.existsSync(firestoreRulesPath)) {
  console.log('✅ Firestore security rules file found');
} else {
  console.log('❌ Firestore security rules file missing');
}

console.log('\n💡 Complete Firebase Setup Notes:');
console.log('- Firebase: Authentication, Database, and Avatar URL storage');
console.log('- Avatar images: Stored as URLs in user profiles (no file upload)');

console.log('\n🎉 Setup complete! Happy coding! 🎵'); 