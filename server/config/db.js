const { createClient } = require('@supabase/supabase-js');
require("dotenv").config();

// ✅ Use correct environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // ✅ FIXED

// 🔴 Validate ENV
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase ENV variables");
  console.log("SUPABASE_URL:", supabaseUrl);
  console.log("SUPABASE_KEY:", supabaseKey);
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// ✅ Create client
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Test connection
const connectDB = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Supabase Connected Successfully!');
    return supabase;

  } catch (error) {
    console.error('❌ Supabase Connection Error:', error.message);

    console.error('\n🔧 Fix Checklist:');
    console.error('1. Check SUPABASE_URL in .env');
    console.error('2. Use SERVICE ROLE KEY (not anon)');
    console.error('3. Ensure users table exists');
    console.error('4. Disable RLS or add policy');

    process.exit(1);
  }
};

module.exports = connectDB;