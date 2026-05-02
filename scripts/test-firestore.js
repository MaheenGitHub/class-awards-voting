require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs } = require('firebase/firestore');

console.log('🔍 TESTING FIRESTORE CONNECTION...');
console.log('='.repeat(50));

// Check environment variables
console.log('📋 Environment Variables:');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'MISSING');

if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('❌ PROJECT_ID missing!');
  process.exit(1);
}

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('\n🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('✅ Firebase initialized');

// Test connection
async function testConnection() {
  try {
    console.log('\n🔗 Testing Firestore connection...');
    
    // Test 1: Try to read a document (should fail gracefully if no data)
    console.log('📖 Test 1: Reading a test document...');
    const testDoc = doc(db, 'test', 'connection-test');
    const docSnapshot = await getDoc(testDoc);
    
    if (docSnapshot.exists()) {
      console.log('✅ Document read successfully');
    } else {
      console.log('✅ Connection successful (document not found is expected)');
    }
    
    // Test 2: Try to read collection
    console.log('📚 Test 2: Reading students collection...');
    const studentsCollection = collection(db, 'students');
    const collectionSnapshot = await getDocs(studentsCollection);
    console.log(`✅ Collection read successfully (${collectionSnapshot.size} documents found)`);
    
    // Test 3: Try to read categories collection
    console.log('🏆 Test 3: Reading categories collection...');
    const categoriesCollection = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCollection);
    console.log(`✅ Categories read successfully (${categoriesSnapshot.size} documents found)`);
    
    console.log('\n🎉 ALL TESTS PASSED - Firestore is working!');
    console.log(`📊 Current data: ${collectionSnapshot.size} students, ${categoriesSnapshot.size} categories`);
    
  } catch (error) {
    console.error('\n❌ FIRESTORE CONNECTION FAILED:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Analyze specific errors
    if (error.message.includes('permission-denied') || error.code === 'permission-denied') {
      console.error('\n🔥 PERMISSION DENIED:');
      console.error('   - Check Firestore security rules');
      console.error('   - Ensure rules allow read access');
      console.error('   - Go to Firebase Console → Firestore → Rules');
    }
    
    if (error.message.includes('not-found') || error.message.includes('Database not found')) {
      console.error('\n🔥 DATABASE NOT FOUND:');
      console.error('   - Check if Firestore is enabled');
      console.error('   - Verify PROJECT_ID is correct');
      console.error('   - Go to Firebase Console → Firestore → Create database');
    }
    
    if (error.message.includes('timeout') || error.message.includes('network')) {
      console.error('\n🔥 NETWORK/CONNECTION ISSUE:');
      console.error('   - Check internet connection');
      console.error('   - Check for proxy/firewall issues');
      console.error('   - Try again in a few moments');
    }
    
    process.exit(1);
  }
}

testConnection();
