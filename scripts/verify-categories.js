// Simple verification script to count categories
const fs = require('fs');
const path = require('path');

// Read the initData.ts file
const initDataPath = path.join(__dirname, '../src/lib/initData.ts');
const content = fs.readFileSync(initDataPath, 'utf8');

// Extract categories using regex - look for the categories array
const categoryMatch = content.match(/const categories: Omit<Category, 'id'>\[\] = \[([\s\S]*?)\]/);
if (!categoryMatch) {
  console.error('❌ Could not find categories array');
  process.exit(1);
}

const categoriesText = categoryMatch[1];
// Match each category object
const categoryObjects = categoriesText.match(/\{[^}]*title: '[^']+'[^}]*\}/g);

if (!categoryObjects) {
  console.error('❌ Could not parse category objects');
  process.exit(1);
}

const categoryCount = categoryObjects.length;
console.log(`📊 Found ${categoryCount} categories in initData.ts`);

if (categoryCount === 50) {
  console.log('✅ Perfect! Exactly 50 categories as required.');
} else {
  console.log(`⚠️  Expected 50 categories, found ${categoryCount}`);
}

// Display first few categories for verification
console.log('\n📋 Sample categories:');
categoryObjects.slice(0, 10).forEach((obj, index) => {
  const titleMatch = obj.match(/title: '([^']+)'/);
  const emojiMatch = obj.match(/emoji: '([^']+)'/);
  if (titleMatch && emojiMatch) {
    console.log(`${index + 1}. ${emojiMatch[1]} ${titleMatch[1]}`);
  }
});

if (categoryCount > 10) {
  console.log(`... and ${categoryCount - 10} more`);
}
