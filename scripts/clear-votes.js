// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Verify environment variables are loaded
console.log('🔍 Checking environment variables...');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Loaded' : '❌ Missing');
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Missing');

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('❌ Firebase configuration not found in .env.local');
  console.error('Please ensure .env.local contains your Firebase configuration');
  process.exit(1);
}

// Firebase configuration - ensure it matches class-voting-app-f22
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Firebase Configuration:');
console.log(`   Project ID: ${firebaseConfig.projectId}`);
console.log(`   Auth Domain: ${firebaseConfig.authDomain}`);

// Initialize Firebase
try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log('🔥 Firebase initialized successfully');
  
  // Test connection by trying to access a collection
  console.log('🔍 Testing Firebase connection...');
  
  async function clearVotesAndUserVotes() {
    console.log('🧹 Starting database sanitization...');
    
    try {
      // VALIDATION: Check students and categories first
      console.log('🔍 Validating database structure...');
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      
      console.log(`📊 Found ${studentsSnapshot.docs.length} student records`);
      console.log(`📊 Found ${categoriesSnapshot.docs.length} category records`);
      
      // CRITICAL: Do not proceed if students or categories are missing
      if (studentsSnapshot.docs.length === 0) {
        console.error('❌ CRITICAL: No students found! Aborting deletion to prevent data loss.');
        process.exit(1);
      }
      
      if (categoriesSnapshot.docs.length === 0) {
        console.error('❌ CRITICAL: No categories found! Aborting deletion to prevent data loss.');
        process.exit(1);
      }
      
      console.log('✅ Validation passed - students and categories are intact');
      
      // Clear votes collection
      console.log('🗑️  Clearing votes collection...');
      const votesSnapshot = await getDocs(collection(db, 'votes'));
      const votesToDelete = votesSnapshot.docs.length;
      
      console.log(`� Found ${votesToDelete} documents in votes collection`);
      
      if (votesToDelete > 0) {
        for (const voteDoc of votesSnapshot.docs) {
          await deleteDoc(doc(db, 'votes', voteDoc.id));
        }
        console.log(`✅ Deleted ${votesToDelete} documents from votes collection`);
      } else {
        console.log('ℹ️  No documents to delete in votes collection');
      }
      
      // Clear userVotes collection
      console.log('🗑️  Clearing userVotes collection...');
      const userVotesSnapshot = await getDocs(collection(db, 'userVotes'));
      const userVotesToDelete = userVotesSnapshot.docs.length;
      
      console.log(`📊 Found ${userVotesToDelete} documents in userVotes collection`);
      
      if (userVotesToDelete > 0) {
        for (const userVoteDoc of userVotesSnapshot.docs) {
          await deleteDoc(doc(db, 'userVotes', userVoteDoc.id));
        }
        console.log(`✅ Deleted ${userVotesToDelete} documents from userVotes collection`);
      } else {
        console.log('ℹ️  No documents to delete in userVotes collection');
      }
      
      // Final verification
      const finalStudents = await getDocs(collection(db, 'students'));
      const finalCategories = await getDocs(collection(db, 'categories'));
      
      console.log(`📊 Final verification - ${finalStudents.docs.length} student records preserved`);
      console.log(`📊 Final verification - ${finalCategories.docs.length} category records preserved`);
      
      if (votesToDelete > 0 || userVotesToDelete > 0) {
        console.log('🎉 Database sanitization completed successfully!');
        console.log(`📈 Total documents deleted: ${votesToDelete + userVotesToDelete}`);
      } else {
        console.log('ℹ️  Database was already clean - no documents to delete');
      }
      
    } catch (error) {
      console.error('❌ Error during sanitization:', error);
      process.exit(1);
    }
  }

  // Run the sanitization
  clearVotesAndUserVotes();
  
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  process.exit(1);
}
