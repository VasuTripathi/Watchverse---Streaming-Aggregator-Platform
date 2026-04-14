let supabase;

const initSupabase = async () => {
  if (!supabase) {
    const { supabase: client } = require('../config/db');
    supabase = client;
  }
  return supabase;
};

const Activity = {
  // Create new activity
  create: async (activityData) => {
    try {
      const db = await initSupabase();
      const { data, error } = await db
        .from('activities')
        .insert([activityData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Activity.create error:', error);
      throw error;
    }
  },

  // Find activities by user_id
  findByUserId: async (userId) => {
    try {
      const db = await initSupabase();
      const { data, error } = await db
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Activity.findByUserId error:', error);
      throw error;
    }
  }
};

module.exports = Activity;