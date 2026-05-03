const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration - replace with your production config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearVotesAndUserVotes() {
  console.log('🧹 Starting database sanitization...');
  
  try {
    // Clear votes collection
    const votesSnapshot = await getDocs(collection(db, 'votes'));
    const votesToDelete = votesSnapshot.docs.length;
    
    for (const voteDoc of votesSnapshot.docs) {
      await deleteDoc(doc(db, 'votes', voteDoc.id));
    }
    
    console.log(`✅ Deleted ${votesToDelete} documents from votes collection`);
    
    // Clear userVotes collection
    const userVotesSnapshot = await getDocs(collection(db, 'userVotes'));
    const userVotesToDelete = userVotesSnapshot.docs.length;
    
    for (const userVoteDoc of userVotesSnapshot.docs) {
      await deleteDoc(doc(db, 'userVotes', userVoteDoc.id));
    }
    
    console.log(`✅ Deleted ${userVotesToDelete} documents from userVotes collection`);
    
    // Verify students and categories are intact
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    console.log(`📊 Preserved ${studentsSnapshot.docs.length} student records`);
    console.log(`📊 Preserved ${categoriesSnapshot.docs.length} category records`);
    
    console.log('🎉 Database sanitization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during sanitization:', error);
    process.exit(1);
  }
}

// Run the sanitization
clearVotesAndUserVotes();
