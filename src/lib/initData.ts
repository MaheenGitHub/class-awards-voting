import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore'
import { Student, Category } from '@/types'

// This script can be run once to initialize the database with sample data
export const initializeDatabase = async () => {
  // Initialize Firebase (make sure config is set)
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  // Sample students (50 students for the class)
  const students: Omit<Student, 'id'>[] = [
    { name: 'Ali Ahmed', rollNumber: 'BITF22M001' },
    { name: 'Sara Khan', rollNumber: 'BITF22M002' },
    { name: 'Muhammad Usman', rollNumber: 'BITF22M003' },
    { name: 'Fatima Sheikh', rollNumber: 'BITF22M004' },
    { name: 'Ahmed Raza', rollNumber: 'BITF22M005' },
    { name: 'Ayesha Malik', rollNumber: 'BITF22M006' },
    { name: 'Bilal Khan', rollNumber: 'BITF22M007' },
    { name: 'Hira Saeed', rollNumber: 'BITF22M008' },
    { name: 'Daniyal Yousaf', rollNumber: 'BITF22M009' },
    { name: 'Mariam Ahmed', rollNumber: 'BITF22M010' },
    { name: 'Zain Abbas', rollNumber: 'BITF22M011' },
    { name: 'Khadija Rehman', rollNumber: 'BITF22M012' },
    { name: 'Fahad Ali', rollNumber: 'BITF22M013' },
    { name: 'Zainab Nawaz', rollNumber: 'BITF22M014' },
    { name: 'Saad Ahmed', rollNumber: 'BITF22M015' },
    { name: 'Aisha Khan', rollNumber: 'BITF22M016' },
    { name: 'Umar Farooq', rollNumber: 'BITF22M017' },
    { name: 'Sana Rasheed', rollNumber: 'BITF22M018' },
    { name: 'Hamza Khan', rollNumber: 'BITF22M019' },
    { name: 'Nadia Ali', rollNumber: 'BITF22M020' },
    { name: 'Abdullah Shah', rollNumber: 'BITF22M021' },
    { name: 'Amina Yousaf', rollNumber: 'BITF22M022' },
    { name: 'Tariq Mehmood', rollNumber: 'BITF22M023' },
    { name: 'Safia Ahmed', rollNumber: 'BITF22M024' },
    { name: 'Junaid Khan', rollNumber: 'BITF22M025' },
    { name: 'Fatima Zahra', rollNumber: 'BITF22M026' },
    { name: 'Zeeshan Ali', rollNumber: 'BITF22M027' },
    { name: 'Hajra Bibi', rollNumber: 'BITF22M028' },
    { name: 'Rizwan Ahmed', rollNumber: 'BITF22M029' },
    { name: 'Ayesha Siddiqui', rollNumber: 'BITF22M030' },
    { name: 'Kamran Khan', rollNumber: 'BITF22M031' },
    { name: 'Saba Karim', rollNumber: 'BITF22M032' },
    { name: 'Naveed Ahmed', rollNumber: 'BITF22M033' },
    { name: 'Mariam Yaqoob', rollNumber: 'BITF22M034' },
    { name: 'Shahid Khan', rollNumber: 'BITF22M035' },
    { name: 'Zeenat Bibi', rollNumber: 'BITF22M036' },
    { name: 'Waqas Ahmed', rollNumber: 'BITF22M037' },
    { name: 'Hina Malik', rollNumber: 'BITF22M038' },
    { name: 'Adnan Khan', rollNumber: 'BITF22M039' },
    { name: 'Ruqayya Ahmed', rollNumber: 'BITF22M040' },
    { name: 'Imran Ali', rollNumber: 'BITF22M041' },
    { name: 'Saima Khan', rollNumber: 'BITF22M042' },
    { name: 'Fawad Ahmed', rollNumber: 'BITF22M043' },
    { name: 'Kiran Yousaf', rollNumber: 'BITF22M044' },
    { name: 'Bilal Raza', rollNumber: 'BITF22M045' },
    { name: 'Nayab Ahmed', rollNumber: 'BITF22M046' },
    { name: 'Taha Khan', rollNumber: 'BITF22M047' },
    { name: 'Uzma Ali', rollNumber: 'BITF22M048' },
    { name: 'Saad Ahmed', rollNumber: 'BITF22M049' },
    { name: 'Ayesha Khan', rollNumber: 'BITF22M050' },
  ]

  // Award categories (40-50 categories)
  const categories: Omit<Category, 'id'>[] = [
    { title: 'Most Funny', description: 'The person who always makes everyone laugh', emoji: '😂' },
    { title: 'Most Late', description: 'Always fashionably late to class', emoji: '⏰' },
    { title: 'Theeta', description: 'The academic genius of the class', emoji: '🎓' },
    { title: 'Most Helpful', description: 'Always ready to help classmates', emoji: '🤝' },
    { title: 'Best Dressed', description: 'Fashion icon of the class', emoji: '👔' },
    { title: 'Most Energetic', description: 'Full of energy and enthusiasm', emoji: '⚡' },
    { title: 'Quiet Genius', description: 'Silent but brilliant', emoji: '🧠' },
    { title: 'Class Clown', description: 'The entertainer of the class', emoji: '🃏' },
    { title: 'Most Organized', description: 'Always has everything planned', emoji: '📋' },
    { title: 'Tech Wizard', description: 'Master of all things tech', emoji: '💻' },
    { title: 'Most Creative', description: 'Thinks outside the box', emoji: '🎨' },
    { title: 'Best Team Player', description: 'Works well with everyone', emoji: '👥' },
    { title: 'Most Determined', description: 'Never gives up on challenges', emoji: '💪' },
    { title: 'Class Photographer', description: 'Always capturing memories', emoji: '📸' },
    { title: 'Most Positive', description: 'Spreads positivity everywhere', emoji: '😊' },
    { title: 'Night Owl', description: 'Most active during late hours', emoji: '🦉' },
    { title: 'Early Bird', description: 'Always arrives early and fresh', emoji: '🐦' },
    { title: 'Most Curious', description: 'Always asking questions', emoji: '🤔' },
    { title: 'Best Storyteller', description: 'Tells the most interesting stories', emoji: '📖' },
    { title: 'Most Reliable', description: 'Can always count on them', emoji: '🌟' },
    { title: 'Class Musician', description: 'The musical talent of the class', emoji: '🎵' },
    { title: 'Most Adventurous', description: 'Always ready for new experiences', emoji: '🗺️' },
    { title: 'Best Problem Solver', description: 'Solves problems like a pro', emoji: '🧩' },
    { title: 'Most Friendly', description: 'Friends with everyone', emoji: '🫂' },
    { title: 'Class Chef', description: 'Knows all the best food spots', emoji: '🍳' },
    { title: 'Most Fashionable', description: 'Trendsetter of the class', emoji: '👗' },
    { title: 'Best Listener', description: 'Always there to listen', emoji: '👂' },
    { title: 'Most Ambitious', description: 'Has big dreams and goals', emoji: '🚀' },
    { title: 'Class Comedian', description: 'The stand-up comedian of the class', emoji: '🎤' },
    { title: 'Most Patient', description: 'Never loses their cool', emoji: '🧘' },
    { title: 'Best Multitasker', description: 'Juggles multiple tasks easily', emoji: '🔄' },
    { title: 'Most Innovative', description: 'Comes up with brilliant ideas', emoji: '💡' },
    { title: 'Class Motivator', description: 'Inspires everyone to do better', emoji: '📢' },
    { title: 'Most Artistic', description: 'The artist of the class', emoji: '🖼️' },
    { title: 'Best Leader', description: 'Natural leadership qualities', emoji: '👑' },
    { title: 'Most Punctual', description: 'Always on time, every time', emoji: '⌚' },
    { title: 'Class Athlete', description: 'Sports champion of the class', emoji: '⚽' },
    { title: 'Most Resourceful', description: 'Finds solutions for everything', emoji: '🔧' },
    { title: 'Best Mentor', description: 'Guides and helps others learn', emoji: '🎯' },
    { title: 'Most Optimistic', description: 'Always sees the bright side', emoji: '☀️' },
    { title: 'Class Diplomat', description: 'Resolves conflicts peacefully', emoji: '🕊️' },
    { title: 'Most Dedicated', description: 'Committed to excellence', emoji: '🎖️' },
  ]

  try {
    // Add students to Firestore
    console.log('Adding students...')
    for (const student of students) {
      const studentRef = doc(collection(db, 'students'))
      await setDoc(studentRef, student)
    }

    // Add categories to Firestore
    console.log('Adding categories...')
    for (const category of categories) {
      const categoryRef = doc(collection(db, 'categories'))
      await setDoc(categoryRef, category)
    }

    console.log('Database initialized successfully!')
    console.log(`Added ${students.length} students and ${categories.length} categories`)
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// Export for use in other components
// Note: The actual arrays are defined inside the function to avoid scope issues
