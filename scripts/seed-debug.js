require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, serverTimestamp, getDoc } = require('firebase/firestore');

// STEP 1: Validate Environment Variables
console.log('🔍 STEP 1: Validating Environment Variables...');
console.log('='.repeat(50));

// Verify dotenv loaded correctly
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('❌ CRITICAL: dotenv failed to load .env.local file');
  console.error('📁 Expected file path:', require('path').resolve('.env.local'));
  console.error('🔧 Check if .env.local exists and is readable');
  process.exit(1);
}

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_ADMIN_EMAIL',
  'NEXT_PUBLIC_HASH_SALT'
];

let envVarsValid = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ MISSING: ${varName}`);
    envVarsValid = false;
  } else {
    // Handle FIREBASE_PRIVATE_KEY format if present
    let displayValue = value;
    if (varName.includes('PRIVATE_KEY') && value.includes('\\n')) {
      process.env[varName] = value.replace(/\\n/g, '\n');
      displayValue = `${value.substring(0, 20)}... (formatted)`;
    }
    // Mask sensitive values for logging
    const maskedValue = varName.includes('KEY') || varName.includes('SALT') 
      ? `${displayValue.substring(0, 8)}...` 
      : displayValue;
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

if (!envVarsValid) {
  console.error('\n❌ CRITICAL: Missing environment variables. Please check your .env.local file.');
  console.error('📁 Expected file:', require('path').resolve('.env.local'));
  console.error('📝 Required variables:');
  requiredEnvVars.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

console.log(`✅ Environment loaded from: ${require('path').resolve('.env.local')}`);

// STEP 2: Initialize Firebase with Validation
console.log('\n🔥 STEP 2: Initializing Firebase...');
console.log('='.repeat(50));

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Firebase Config:');
console.log(`   - Project ID: ${firebaseConfig.projectId}`);
console.log(`   - Auth Domain: ${firebaseConfig.authDomain}`);
console.log(`   - Storage Bucket: ${firebaseConfig.storageBucket}`);

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  process.exit(1);
}

// STEP 3: Test Firebase Connection
console.log('\n🔗 STEP 3: Testing Firebase Connection...');
console.log('='.repeat(50));

async function testFirebaseConnection() {
  try {
    // Test read access
    console.log('📖 Testing read access...');
    const testCollection = collection(db, '_connection_test');
    const snapshot = await getDocs(testCollection);
    console.log('✅ Read access confirmed');
    
    // Test write access
    console.log('✍️  Testing write access...');
    const testDoc = doc(testCollection, 'test_doc_' + Date.now());
    await setDoc(testDoc, { 
      test: true,
      timestamp: serverTimestamp(),
      message: 'Connection test'
    });
    
    // Clean up test document
    await deleteDoc(testDoc);
    console.log('✅ Write access confirmed');
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error.message);
    console.error('🔧 Possible solutions:');
    console.error('   1. Check Firebase project rules in Firestore console');
    console.error('   2. Ensure your Firebase API key is valid');
    console.error('   3. Verify network connectivity');
    return false;
  }
}

// Data definitions
const students = [
  { id: 'BITF22M001', rollNumber: 'BITF22M001', name: 'Muhammad Mohid' },
  { id: 'BITF22M002', rollNumber: 'BITF22M002', name: 'Muhammad Asif Abbas' },
  { id: 'BITF22M003', rollNumber: 'BITF22M003', name: 'Alina Idrees' },
  { id: 'BITF22M004', rollNumber: 'BITF22M004', name: 'Husnain Raza' },
  { id: 'BITF22M005', rollNumber: 'BITF22M005', name: 'Laiba Idrees' },
  { id: 'BITF22M006', rollNumber: 'BITF22M006', name: 'Mariam Qadeem' },
  { id: 'BITF22M007', rollNumber: 'BITF22M007', name: 'Areeba Munawar' },
  { id: 'BITF22M008', rollNumber: 'BITF22M008', name: 'Umair Ahmad Zubair' },
  { id: 'BITF22M009', rollNumber: 'BITF22M009', name: 'Abbas Afzal' },
  { id: 'BITF22M011', rollNumber: 'BITF22M011', name: 'Areeba Tahir Munir' },
  { id: 'BITF22M012', rollNumber: 'BITF22M012', name: 'Muhammad Umair' },
  { id: 'BITF22M013', rollNumber: 'BITF22M013', name: 'Sami Ullah' },
  { id: 'BITF22M016', rollNumber: 'BITF22M016', name: 'Usman kareem' },
  { id: 'BITF22M017', rollNumber: 'BITF22M017', name: 'Inam Ul Haq' },
  { id: 'BITF22M018', rollNumber: 'BITF22M018', name: 'Abdullah Tahir' },
  { id: 'BITF22M019', rollNumber: 'BITF22M019', name: 'Khadija Subhani' },
  { id: 'BITF22M021', rollNumber: 'BITF22M021', name: 'Mukaram Majeed' },
  { id: 'BITF22M023', rollNumber: 'BITF22M023', name: 'Maria Habib' },
  { id: 'BITF22M024', rollNumber: 'BITF22M024', name: 'Muhammad Mujeeb' },
  { id: 'BITF22M025', rollNumber: 'BITF22M025', name: 'Khadija tul kubra' },
  { id: 'BITF22M026', rollNumber: 'BITF22M026', name: 'Areeba Ahmad' },
  { id: 'BITF22M027', rollNumber: 'BITF22M027', name: 'Ghulam Muhi Ul Din' },
  { id: 'BITF22M028', rollNumber: 'BITF22M028', name: 'Khadija Ali' },
  { id: 'BITF22M029', rollNumber: 'BITF22M029', name: 'Rimsha Majeed' },
  { id: 'BITF22M030', rollNumber: 'BITF22M030', name: 'Talha Ishaq' },
  { id: 'BITF22M031', rollNumber: 'BITF22M031', name: 'Maheen Fatima' },
  { id: 'BITF22M033', rollNumber: 'BITF22M033', name: 'Roumaisa Tanveer' },
  { id: 'BITF22M034', rollNumber: 'BITF22M034', name: 'Maheen Abdul Razzaq' },
  { id: 'BITF22M035', rollNumber: 'BITF22M035', name: 'Muhammad Junaid' },
  { id: 'BITF22M036', rollNumber: 'BITF22M036', name: 'Zara Zainab' },
  { id: 'BITF22M037', rollNumber: 'BITF22M037', name: 'Rabia Sadiq' },
  { id: 'BITF22M038', rollNumber: 'BITF22M038', name: 'Ahmad Ali' },
  { id: 'BITF22M039', rollNumber: 'BITF22M039', name: 'Hassan Adil' },
  { id: 'BITF22M040', rollNumber: 'BITF22M040', name: 'Muhammad Ramzan' },
  { id: 'BITF22M041', rollNumber: 'BITF22M041', name: 'Muhammad Nouman' },
  { id: 'BITF22M043', rollNumber: 'BITF22M043', name: 'Laiba Saleem' },
  { id: 'BITF22M044', rollNumber: 'BITF22M044', name: 'Shezonia Idrees' },
  { id: 'BITF22M045', rollNumber: 'BITF22M045', name: 'Bushra Imran' },
  { id: 'BITF22M046', rollNumber: 'BITF22M046', name: 'Abdullah Abid Ali' },
  { id: 'BITF22M047', rollNumber: 'BITF22M047', name: 'Salmon Samson' },
];

const categories = [
  { title: 'Always the late comer', description: 'Fashionably late to every class', emoji: '⏰' },
  { title: 'Selfie expert', description: 'Master of the perfect selfie angle', emoji: '📸' },
  { title: 'The fashionista', description: 'Trendsetter with impeccable style', emoji: '👗' },
  { title: 'Mr/Miss popular', description: 'Everyone knows and loves them', emoji: '⭐' },
  { title: 'Drama queen', description: 'Extra dramatic about everything', emoji: '🎭' },
  { title: 'The sweetest', description: 'Kindness personified', emoji: '🍯' },
  { title: 'The notes provider', description: 'Go-to person for class notes', emoji: '📝' },
  { title: 'The ghost student', description: 'Present but never really there', emoji: '👻' },
  { title: 'The last bencher', description: 'Ruler of the back row', emoji: '🪑' },
  { title: 'The front bencher', description: 'Always sitting in the front', emoji: '🎓' },
  { title: 'The comedian', description: 'Class joker who keeps everyone laughing', emoji: '😂' },
  { title: 'The philosopher', description: 'Deep thoughts about everything', emoji: '🤔' },
  { title: 'The walking radio', description: 'Plays music everywhere they go', emoji: '🎵' },
  { title: 'The Bhai person', description: 'The protective older sibling type', emoji: '👨‍👩‍👧‍👦' },
  { title: 'The hardware specialist', description: 'Fixes everyone\'s tech problems', emoji: '💻' },
  { title: 'The "mn nai tou kon be"', description: 'Always has someone else to blame', emoji: '🤷‍♂️' },
  { title: 'The best dressing sense', description: 'Always dressed to impress', emoji: '👔' },
  { title: 'The pindi boy', description: 'Rawalpindi vibes and attitude', emoji: '🏙️' },
  { title: 'The news reporter', description: 'Knows all the latest gossip', emoji: '📰' },
  { title: 'The innocent face', description: 'Looks angelic but we know better', emoji: '😇' },
  { title: 'The chill pill', description: 'Super relaxed about everything', emoji: '😌' },
  { title: 'The class entertainer', description: 'Life of every party', emoji: '🎪' },
  { title: 'The question machine', description: 'Asks questions non-stop', emoji: '❓' },
  { title: 'The "Liked by everyone"', description: 'Universally loved by classmates', emoji: '❤️' },
  { title: 'The event manager', description: 'Organizes all class events', emoji: '📅' },
  { title: 'The social butterfly', description: 'Friends with everyone', emoji: '🦋' },
  { title: 'The fashion icon', description: 'Style inspiration for the class', emoji: '💄' },
  { title: 'The most likely to be famous', description: 'Future celebrity in the making', emoji: '🌟' },
  { title: 'All rounder', description: 'Good at everything they do', emoji: '🎯' },
  { title: 'The most likely to work at Google', description: 'Tech genius destined for big things', emoji: '🔍' },
  { title: 'The master of excuses', description: 'Has an excuse for everything', emoji: '🗣️' },
  { title: 'The "main nhi prha" lair', description: 'Claims they didn\'t study but always pass', emoji: '📚' },
  { title: 'The rebel', description: 'Breaks all the rules', emoji: '😈' },
  { title: 'The helper bee', description: 'Always helping others', emoji: '🐝' },
  { title: 'The chatter box', description: 'Talks non-stop', emoji: '💬' },
  { title: 'The cool cat', description: 'Effortlessly cool and calm', emoji: '😎' },
  { title: 'The "Dil tou bacha hai g"', description: 'Child at heart', emoji: '🧸' },
  { title: 'The geet (jab we met)', description: 'Loves romantic Bollywood songs', emoji: '💕' },
  { title: 'Student of the year', description: 'Perfect student in every way', emoji: '🏆' },
  { title: 'Pk of the class', description: 'Pakistani pride personified', emoji: '🇵🇰' },
  { title: 'Don of the class', description: 'Respected leader of the batch', emoji: '🕶️' },
  { title: 'The devdas', description: 'Dramatic and emotional about everything', emoji: '😢' },
  { title: 'The chulbul Pandy', description: 'Mix of funny and serious', emoji: '👮‍♂️' },
  { title: 'The basanti', description: 'Energetic and talkative', emoji: '🐴' },
  { title: 'mr/miss khiladi', description: 'Always ready for action', emoji: '🎬' },
  { title: 'atif aslam', description: 'Sings like Atif Aslam', emoji: '🎤' },
  { title: 'Doremon', description: 'Has a solution for every problem', emoji: '🔧' },
  { title: 'Nobita', description: 'Relies on friends for help', emoji: '👨‍🎓' },
  { title: 'Jiyan of the class', description: 'Sweet and innocent', emoji: '🍬' },
  { title: 'teacher\'s favourite', description: 'Loved by all teachers', emoji: '🍎' },
];

// Main seeding function
async function seedDatabase() {
  try {
    // Test connection first
    const connectionTest = await testFirebaseConnection();
    if (!connectionTest) {
      console.error('\n❌ SEEDING ABORTED: Firebase connection failed');
      process.exit(1);
    }

    console.log('\n🚀 STEP 4: Starting Database Seeding...');
    console.log('='.repeat(50));
    console.log(`📊 Expected: ${students.length} students, ${categories.length} categories`);
    console.log(`👤 Admin email: ${process.env.NEXT_PUBLIC_ADMIN_EMAIL}`);

    // Check existing data first (idempotent check)
    console.log('\n🔍 Checking existing data...');
    const existingStudents = await getDocs(collection(db, 'students'));
    const existingCategories = await getDocs(collection(db, 'categories'));
    
    console.log(`📊 Existing: ${existingStudents.size} students, ${existingCategories.size} categories`);
    
    // Clear existing data to ensure idempotent operation
    console.log('\n🗑️  Clearing existing data (idempotent operation)...');
    const collections = ['students', 'categories', 'votes', 'userVotes'];
    
    for (const collectionName of collections) {
      await clearCollection(collectionName);
    }

    // Add students with verification
    console.log('\n➕ Adding students...');
    let studentsAdded = 0;
    for (const student of students) {
      try {
        const studentRef = doc(db, 'students', student.id);
        await setDoc(studentRef, {
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.name
        });
        studentsAdded++;
        
        // Verify immediate write
        const verifyDoc = await getDoc(studentRef);
        if (!verifyDoc.exists()) {
          throw new Error(`Student ${student.id} not found after write`);
        }
      } catch (writeError) {
        console.error(`❌ Failed to add student ${student.id}:`, writeError.message);
        throw writeError; // Fail fast
      }
    }
    console.log(`✅ Added ${studentsAdded}/${students.length} students`);

    // Add categories with verification
    console.log('\n➕ Adding categories...');
    let categoriesAdded = 0;
    for (const category of categories) {
      try {
        const categoryRef = doc(collection(db, 'categories'));
        await setDoc(categoryRef, category);
        categoriesAdded++;
        
        // Verify immediate write
        const verifyDoc = await getDoc(categoryRef);
        if (!verifyDoc.exists()) {
          throw new Error(`Category not found after write`);
        }
      } catch (writeError) {
        console.error(`❌ Failed to add category:`, writeError.message);
        throw writeError; // Fail fast
      }
    }
    console.log(`✅ Added ${categoriesAdded}/${categories.length} categories`);

    // Final verification with actual Firestore data
    console.log('\n🔍 STEP 5: Final Verification...');
    console.log('='.repeat(50));
    
    const finalStudents = await getDocs(collection(db, 'students'));
    const finalCategories = await getDocs(collection(db, 'categories'));

    console.log('\n📊 FINAL VERIFICATION RESULTS:');
    console.log(`� Students: ${finalStudents.size}/${students.length} expected`);
    console.log(`🏆 Categories: ${finalCategories.size}/${categories.length} expected`);
    console.log(`👤 Admin email: ${process.env.NEXT_PUBLIC_ADMIN_EMAIL}`);

    // Critical verification - fail if counts don't match
    const studentsMatch = finalStudents.size === students.length;
    const categoriesMatch = finalCategories.size === categories.length;
    
    if (studentsMatch && categoriesMatch) {
      console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY!');
      console.log('✅ All data verified in Firestore');
      
      // List actual data for confirmation
      console.log('\n📋 Students in Firestore:');
      finalStudents.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.rollNumber} - ${data.name}`);
      });
      
      console.log('\n📋 Categories in Firestore:');
      finalCategories.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.emoji} ${data.title}`);
      });
      
    } else {
      console.error('\n❌ CRITICAL: Data verification failed!');
      if (!studentsMatch) {
        console.error(`❌ Students mismatch: ${finalStudents.size} found, ${students.length} expected`);
      }
      if (!categoriesMatch) {
        console.error(`❌ Categories mismatch: ${finalCategories.size} found, ${categories.length} expected`);
      }
      console.error('🔧 Possible causes:');
      console.error('   - Firestore security rules blocking writes');
      console.error('   - Network connectivity issues');
      console.error('   - Firebase configuration errors');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ SEEDING FAILED:', error.message);
    console.error('🔧 Error details:');
    console.error('   - Error code:', error.code || 'N/A');
    console.error('   - Error details:', error.details || 'N/A');
    console.error('   - Stack trace:', error.stack);
    
    // Fail fast on any Firebase error
    if (error.message.includes('permission-denied') || error.message.includes('7 PERMISSION_DENIED')) {
      console.error('\n🔥 FIRESTORE PERMISSION ERROR:');
      console.error('   - Check Firestore security rules in Firebase Console');
      console.error('   - Ensure rules allow write access during development');
      console.error('   - Current rules may be too restrictive for seeding');
    }
    
    process.exit(1);
  }
}

async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing ${collectionName}...`);
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  
  if (snapshot.size > 0) {
    console.log(`📊 Found ${snapshot.size} documents to clear`);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Verify collection is actually empty
    const verifySnapshot = await getDocs(collectionRef);
    if (verifySnapshot.size === 0) {
      console.log(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
    } else {
      throw new Error(`Failed to clear ${collectionName}: ${verifySnapshot.size} documents remaining`);
    }
  } else {
    console.log(`✅ ${collectionName} already empty`);
  }
}

// Run the seeding with comprehensive error handling
seedDatabase().catch(error => {
  console.error('\n💥 UNHANDLED ERROR - SEEDING ABORTED:');
  console.error('❌ Error:', error.message);
  console.error('🔧 Type:', error.constructor.name);
  if (error.stack) {
    console.error('📍 Stack:', error.stack);
  }
  process.exit(1);
});
