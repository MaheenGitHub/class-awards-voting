const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, query, where, deleteDoc } = require('firebase/firestore');

// Firebase configuration - make sure these are set in your environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration missing. Please set environment variables.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// BITF22 Students (sorted by roll number)
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

// BITF22 Award Categories (50 categories)
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
  { title: 'The geet (jab we met)', description: 'Main apni favorite hoon! A lively, talkative, and chill person who lives life to the fullest.', emoji: '�' },
  { title: 'Student of the year', description: 'Perfect student in every way', emoji: '🏆' },
  { title: 'Pk of the class', description: 'An innocent alien confused by the weird ways of our world.', emoji: '👽' },
  { title: 'Don of the class', description: 'Respected leader of the batch', emoji: '🕶️' },
  { title: 'The devdas', description: 'Dramatic and emotional about everything', emoji: '😢' },
  { title: 'The chulbul Pandy', description: 'Mix of funny and serious', emoji: '👮‍♂️' },
  { title: 'The basanti', description: 'Energetic and talkative', emoji: '🐴' },
  { title: 'mr/miss khiladi', description: 'Always ready for action', emoji: '🎬' },
  { title: 'atif aslam', description: 'Sings like Atif Aslam', emoji: '🎤' },
  { title: 'Doremon', description: 'Has a solution for every problem', emoji: '🔧' },
  { title: 'Nobita', description: 'Relies on friends for help', emoji: '👨‍🎓' },
  { title: 'Jiyan of the class', description: 'the strongest!', emoji: '💪' },
  { title: 'teacher\'s favourite', description: 'Loved by all teachers', emoji: '🍎' },
];

async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing ${collectionName} collection...`);
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
  await Promise.all(deletePromises);
  console.log(`✅ Cleared ${snapshot.size} documents from ${collectionName}`);
}

// Function to generate deterministic ID from title
function generateCategoryId(title) {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    console.log(`📊 Will update ${students.length} students and ${categories.length} categories`);

    // Add/update students (using roll number as document ID)
    console.log('➕ Adding/updating students to Firestore...');
    for (const student of students) {
      const studentRef = doc(db, 'students', student.id); // Use roll number as document ID
      await setDoc(studentRef, {
        id: student.id,
        rollNumber: student.rollNumber,
        name: student.name
      });
    }
    console.log(`✅ Updated ${students.length} students`);

    // Add/update categories (using deterministic IDs)
    console.log('➕ Adding/updating categories to Firestore...');
    for (const category of categories) {
      const categoryId = generateCategoryId(category.title);
      const categoryRef = doc(db, 'categories', categoryId);
      await setDoc(categoryRef, {
        id: categoryId,
        title: category.title,
        description: category.description,
        emoji: category.emoji
      });
    }
    console.log(`✅ Updated ${categories.length} categories`);

    // Verify final counts
    const finalStudents = await getDocs(collection(db, 'students'));
    const finalCategories = await getDocs(collection(db, 'categories'));

    console.log('\n🎉 DATABASE SEEDING COMPLETED!');
    console.log(`📊 Final student count: ${finalStudents.size}`);
    console.log(`📊 Final category count: ${finalCategories.size}`);
    
    if (finalCategories.size === 50) {
      console.log('✅ Perfect! Exactly 50 categories as required.');
    } else {
      console.log(`⚠️  Expected 50 categories, found ${finalCategories.size}`);
    }

    // Display all categories for verification
    console.log('\n📋 All Categories:');
    finalCategories.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.emoji} ${data.title} - ${data.description}`);
    });

    // Specifically check PK and Jiyan categories
    console.log('\n🔍 Updated Categories Verification:');
    const pkCategory = finalCategories.docs.find(doc => doc.data().title === 'Pk of the class');
    const jiyanCategory = finalCategories.docs.find(doc => doc.data().title === 'Jiyan of the class');
    
    if (pkCategory) {
      const pkData = pkCategory.data();
      console.log(`✅ PK Category: ${pkData.emoji} "${pkData.description}"`);
    }
    
    if (jiyanCategory) {
      const jiyanData = jiyanCategory.data();
      console.log(`✅ Jiyan Category: ${jiyanData.emoji} "${jiyanData.description}"`);
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
