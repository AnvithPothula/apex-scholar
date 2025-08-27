// Test script to verify timezone-safe date parsing
const { format } = require('date-fns');

console.log('🔍 Testing Date Parsing Approaches');
console.log('===============================');

const testDateString = '2025-08-25';
console.log(`Target date string: ${testDateString}`);

// Method 1: String parsing (problematic with timezones)
const stringParsed = new Date(testDateString);
console.log(`❌ String parsing: ${stringParsed.toLocaleDateString()} (${stringParsed.toDateString()})`);
console.log(`   Time: ${stringParsed.toLocaleTimeString()}`);
console.log(`   Timezone offset: ${stringParsed.getTimezoneOffset()} minutes`);

// Method 2: Manual construction (timezone-safe)
const [year, month, day] = testDateString.split('-').map(Number);
const manualParsed = new Date(year, month - 1, day); // month is 0-indexed
console.log(`✅ Manual parsing: ${manualParsed.toLocaleDateString()} (${manualParsed.toDateString()})`);
console.log(`   Time: ${manualParsed.toLocaleTimeString()}`);
console.log(`   Timezone offset: ${manualParsed.getTimezoneOffset()} minutes`);

// Method 3: date-fns format test
console.log(`📅 date-fns format (manual): ${format(manualParsed, 'yyyy-MM-dd')}`);
console.log(`📅 date-fns format (string): ${format(stringParsed, 'yyyy-MM-dd')}`);

// Test the specific issue we had
console.log('\n🐛 Specific Issue Test:');
console.log('====================');

// Test what happens with the scheduler date creation
const targetDate = new Date(2025, 7, 25); // August 25, 2025 (month 7 = August)
console.log(`Target date (manual): ${targetDate.toLocaleDateString()}`);

// Test existing schedule item dates
const existingItem = {
  taskName: 'hw2',
  date: '2025-08-25'
};

// Parse existing item date using our new method
const [itemYear, itemMonth, itemDay] = existingItem.date.split('-').map(Number);
const itemDate = new Date(itemYear, itemMonth - 1, itemDay);

console.log(`Existing item date (fixed): ${itemDate.toLocaleDateString()}`);
console.log(`Do dates match? ${targetDate.getTime() === itemDate.getTime()}`);

// Show the old problematic way
const oldWayDate = new Date(existingItem.date);
console.log(`Existing item date (old way): ${oldWayDate.toLocaleDateString()}`);
console.log(`Do dates match (old way)? ${targetDate.getTime() === oldWayDate.getTime()}`);
