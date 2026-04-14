const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ✅ Load ENV variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // use SERVICE ROLE KEY

// ✅ Validate ENV
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase ENV variables");
  throw new Error("Check your .env file (SUPABASE_URL / SUPABASE_KEY)");
}

// ✅ Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Test DB connection
const connectDB = async () => {
  try {
    const { error } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (error) throw error;

    console.log("✅ Supabase Connected Successfully!");
  } catch (err) {
    console.error("❌ Supabase Connection Error:", err.message);

    console.error("\n🔧 Fix Checklist:");
    console.error("1. Check SUPABASE_URL");
    console.error("2. Use SERVICE ROLE KEY (not anon)");
    console.error("3. Ensure table exists");
    console.error("4. Check RLS policies");

    process.exit(1);
  }
};

// ✅ Export BOTH (important for your project)
module.exports = {
  supabase,
  connectDB,
};