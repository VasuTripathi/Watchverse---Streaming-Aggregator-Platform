const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const connectDB = async () => {
  try {
    // Test the connection by making a simple query
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
      throw error;
    }

    console.log('✅ Supabase Connected Successfully!');
    return supabase;
  } catch (error) {
    console.error('❌ Supabase Connection Error:', error.message);
    console.error('\n🔧 Troubleshooting Steps:');
    console.error('1. Check your SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
    console.error('2. Ensure your Supabase project is active');
    console.error('3. Verify your table permissions in Supabase');
    process.exit(1);
  }
};

module.exports = connectDB;