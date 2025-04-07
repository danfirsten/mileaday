// Simple script to check if Supabase environment variables are properly set
const fs = require('fs');
const path = require('path');

// Check if .env.local file exists
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found. Please create one with your Supabase credentials.');
  process.exit(1);
}

// Read .env.local file
const envContent = fs.readFileSync(envPath, 'utf8');

// Check for required environment variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missingVars = requiredVars.filter(varName => !envContent.includes(`${varName}=`));

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please add them to your .env.local file.');
  process.exit(1);
}

// Check if the values are not empty
const envLines = envContent.split('\n');
const emptyVars = [];

for (const line of envLines) {
  for (const varName of requiredVars) {
    if (line.startsWith(`${varName}=`) && line.trim() === `${varName}=`) {
      emptyVars.push(varName);
    }
  }
}

if (emptyVars.length > 0) {
  console.error(`❌ Empty values for environment variables: ${emptyVars.join(', ')}`);
  console.error('Please set values for these variables in your .env.local file.');
  process.exit(1);
}

console.log('✅ Supabase environment variables are properly set.');
console.log('You can now run your application with `npm run dev`.'); 