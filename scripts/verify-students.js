// Simple verification script to count students
const fs = require('fs');
const path = require('path');

// Read the initData.ts file
const initDataPath = path.join(__dirname, '../src/lib/initData.ts');
const content = fs.readFileSync(initDataPath, 'utf8');

// Extract students using regex
const studentMatch = content.match(/const students: Student\[\] = \[([\s\S]*?)\]/);
if (!studentMatch) {
  console.error('❌ Could not find students array');
  process.exit(1);
}

const studentsText = studentMatch[1];
const studentObjects = studentsText.match(/\{[^}]*id: '[^']+'[^}]*\}/g);

if (!studentObjects) {
  console.error('❌ Could not parse student objects');
  process.exit(1);
}

const studentCount = studentObjects.length;
console.log(`📊 Found ${studentCount} students in initData.ts`);

// Display all students for verification
console.log('\n📋 All Students (sorted by roll number):');
studentObjects.forEach((obj, index) => {
  const idMatch = obj.match(/id: '([^']+)'/);
  const rollMatch = obj.match(/rollNumber: '([^']+)'/);
  const nameMatch = obj.match(/name: '([^']+)'/);
  
  if (idMatch && rollMatch && nameMatch) {
    console.log(`${index + 1}. ${rollMatch[1]} - ${nameMatch[1]}`);
  }
});

// Verify sorting
const rollNumbers = studentObjects.map(obj => {
  const match = obj.match(/rollNumber: '([^']+)'/);
  return match ? match[1] : '';
}).filter(Boolean);

const isSorted = rollNumbers.every((roll, i) => {
  if (i === 0) return true;
  return roll > rollNumbers[i - 1];
});

console.log(`\n✅ Students are ${isSorted ? 'correctly' : 'NOT'} sorted by roll number`);

// Check for required fields
const hasAllFields = studentObjects.every(obj => {
  return obj.includes('id:') && obj.includes('rollNumber:') && obj.includes('name:');
});

console.log(`✅ All students have ${hasAllFields ? 'required' : 'MISSING'} fields`);

console.log('\n🚀 To seed the database:');
console.log('1. Ensure .env.local has Firebase configuration');
console.log('2. Run: npm run seed');
console.log('3. This will clear old data and add the new BITF22 students and categories');
