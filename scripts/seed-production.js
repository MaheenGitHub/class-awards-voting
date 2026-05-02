require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp, 
  getDoc,
  writeBatch,
  runTransaction,
  query,
  where
} = require('firebase/firestore');

// DEBUG: Check environment variables
console.log("Current ENV keys found:", Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
console.log("ENV CHECK:");
console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log("NEXT_PUBLIC_HASH_SALT:", process.env.NEXT_PUBLIC_HASH_SALT);

// STEP 1: Environment Validation
console.log('🔍 STEP 1: Validating Environment...');
console.log('='.repeat(50));

if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('❌ CRITICAL: dotenv failed to load .env.local');
  console.error('📁 Expected path:', require('path').resolve('.env.local'));
  process.exit(1);
}

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_ADMIN_EMAIL'
];

let envValid = true;
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ MISSING: ${varName}`);
    envValid = false;
  }
});

if (!envValid) {
  console.error('\n❌ Environment validation failed');
  process.exit(1);
}

console.log('✅ Environment variables loaded');

// STEP 2: Firebase Initialization
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('✅ Firebase initialized');

// Data definitions with deterministic IDs
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

// Generate deterministic category IDs based on title hash
function generateCategoryId(title) {
  return 'cat_' + title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

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
].map(cat => ({
  ...cat,
  id: generateCategoryId(cat.title)
}));

// STEP 3: Comprehensive Permission Testing
async function testPermissions() {
  console.log('\n🔐 STEP 3: Testing Permissions...');
  console.log('='.repeat(50));
  
  try {
    // Test read permission
    const testRead = await getDocs(collection(db, '_permission_test'));
    console.log('✅ Read permission OK');
    
    // Test write permission  
    const testDoc = doc(collection(db, '_permission_test'));
    await setDoc(testDoc, { test: true, timestamp: serverTimestamp() });
    console.log('✅ Write permission OK');
    
    // Test delete permission
    await deleteDoc(testDoc);
    console.log('✅ Delete permission OK');
    
    // Test batch operations
    const batch = writeBatch(db);
    const batchDoc1 = doc(collection(db, '_permission_test'));
    const batchDoc2 = doc(collection(db, '_permission_test'));
    batch.set(batchDoc1, { test: 'batch1' });
    batch.set(batchDoc2, { test: 'batch2' });
    await batch.commit();
    
    // Clean up batch test
    await deleteDoc(batchDoc1);
    await deleteDoc(batchDoc2);
    console.log('✅ Batch operations OK');
    
    return true;
  } catch (error) {
    console.error('❌ Permission test failed:', error.message);
    if (error.message.includes('permission-denied')) {
      console.error('\n🔥 FIRESTORE PERMISSION ERROR:');
      console.error('   Check Firestore security rules in Firebase Console');
      console.error('   Ensure rules allow read, write, delete operations');
    }
    return false;
  }
}

// Recursive collection deletion
async function deleteCollectionRecursive(collectionPath, batchSize = 100) {
  const collectionRef = collection(db, collectionPath);
  const snapshot = await getDocs(collectionRef);
  
  if (snapshot.size === 0) {
    console.log(`✅ ${collectionPath} already empty`);
    return;
  }
  
  console.log(`🗑️  Deleting ${snapshot.size} documents from ${collectionPath}...`);
  
  // Delete in batches to avoid quota limits
  let deletedCount = 0;
  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchDocs = snapshot.docs.slice(i, i + batchSize);
    
    batchDocs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    deletedCount += batchDocs.length;
    console.log(`   Deleted ${deletedCount}/${snapshot.size} documents`);
  }
  
  // Verify deletion
  const verifySnapshot = await getDocs(collectionRef);
  if (verifySnapshot.size > 0) {
    throw new Error(`Failed to delete all documents from ${collectionPath}: ${verifySnapshot.size} remaining`);
  }
  
  console.log(`✅ Successfully deleted all ${deletedCount} documents from ${collectionPath}`);
}

// Transaction-based atomic seeding
async function seedWithTransaction() {
  console.log('\n🚀 STEP 4: Atomic Database Seeding...');
  console.log('='.repeat(50));
  
  try {
    await runTransaction(db, async (transaction) => {
      console.log('🔄 Starting transaction...');
      
      // Clear all collections atomically
      const collections = ['students', 'categories', 'votes', 'userVotes'];
      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        snapshot.docs.forEach(doc => {
          transaction.delete(doc.ref);
        });
        
        if (snapshot.size > 0) {
          console.log(`🗑️  Queued ${snapshot.size} documents for deletion from ${collectionName}`);
        }
      }
      
      // Add students atomically
      console.log('➕ Adding students to transaction...');
      students.forEach(student => {
        const studentRef = doc(db, 'students', student.id);
        transaction.set(studentRef, {
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.name
        });
      });
      
      // Add categories atomically with deterministic IDs
      console.log('➕ Adding categories to transaction...');
      categories.forEach(category => {
        const categoryRef = doc(db, 'categories', category.id);
        transaction.set(categoryRef, {
          id: category.id,
          title: category.title,
          description: category.description,
          emoji: category.emoji
        });
      });
      
      console.log('✅ Transaction prepared - committing...');
    });
    
    console.log('✅ Transaction committed successfully');
    
  } catch (error) {
    console.error('❌ Transaction failed:', error.message);
    throw error;
  }
}

// Final verification with retry logic
async function verifyWithRetry(maxRetries = 3, delay = 1000) {
  console.log('\n🔍 STEP 5: Final Verification...');
  console.log('='.repeat(50));
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📊 Verification attempt ${attempt}/${maxRetries}...`);
      
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      
      const studentsMatch = studentsSnapshot.size === students.length;
      const categoriesMatch = categoriesSnapshot.size === categories.length;
      
      console.log(`📊 Results: ${studentsSnapshot.size}/${students.length} students, ${categoriesSnapshot.size}/${categories.length} categories`);
      
      if (studentsMatch && categoriesMatch) {
        console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY!');
        console.log('✅ All data verified in Firestore');
        console.log(`👤 Admin email: ${process.env.NEXT_PUBLIC_ADMIN_EMAIL}`);
        
        // Verify deterministic IDs
        console.log('\n🔍 Verifying deterministic category IDs...');
        const categoryIds = categoriesSnapshot.docs.map(doc => doc.id).sort();
        const expectedIds = categories.map(cat => cat.id).sort();
        const idsMatch = JSON.stringify(categoryIds) === JSON.stringify(expectedIds);
        
        if (idsMatch) {
          console.log('✅ Category IDs are deterministic');
        } else {
          console.log('⚠️  Category IDs may have changed');
        }
        
        return true;
      } else {
        throw new Error(`Count mismatch: students(${studentsMatch}), categories(${categoriesMatch})`);
      }
      
    } catch (error) {
      console.log(`⚠️  Verification attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('\n❌ FINAL VERIFICATION FAILED');
        console.error('🔧 Possible causes:');
        console.error('   - Eventual consistency delays');
        console.error('   - Transaction rollback issues');
        console.error('   - Network connectivity problems');
        throw error;
      }
      
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}

// Main execution
async function main() {
  try {
    // Test permissions first
    const permissionsOk = await testPermissions();
    if (!permissionsOk) {
      console.error('\n❌ SEEDING ABORTED: Permission test failed');
      process.exit(1);
    }
    
    // Clear collections recursively
    console.log('\n🗑️  Clearing all collections...');
    await deleteCollectionRecursive('students');
    await deleteCollectionRecursive('categories'); 
    await deleteCollectionRecursive('votes');
    await deleteCollectionRecursive('userVotes');
    await deleteCollectionRecursive('_permission_test'); // Clean up test data
    
    // Atomic seeding with transaction
    await seedWithTransaction();
    
    // Final verification with retry
    await verifyWithRetry();
    
  } catch (error) {
    console.error('\n💥 SEEDING FAILED:', error.message);
    console.error('🔧 Error details:', error.code || 'N/A');
    console.error('📍 Stack:', error.stack);
    process.exit(1);
  }
}

// Execute with comprehensive error handling
main().catch(error => {
  console.error('\n💥 UNHANDLED ERROR:', error.message);
  console.error('🔧 Type:', error.constructor.name);
  process.exit(1);
});
