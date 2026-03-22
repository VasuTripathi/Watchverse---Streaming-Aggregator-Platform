let supabase;

const initSupabase = async () => {
  if (!supabase) {
    const connectDB = require('../config/db');
    supabase = await connectDB();
  }
  return supabase;
};

const User = {
  // Find user by email
  findOne: async (query) => {
    try {
      const db = await initSupabase();
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('email', query.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('User.findOne error:', error);
      throw error;
    }
  },

  // Create new user
  create: async (userData) => {
    try {
      const db = await initSupabase();
      const { data, error } = await db
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('User.create error:', error);
      throw error;
    }
  },

  // Find user by ID
  findById: async (id) => {
    try {
      const db = await initSupabase();
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('User.findById error:', error);
      throw error;
    }
  },

  // Find user by ID and update
  findByIdAndUpdate: async (id, updateData, options = {}) => {
    try {
      const db = await initSupabase();
      const { data, error } = await db
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('User.findByIdAndUpdate error:', error);
      throw error;
    }
  }
};

module.exports = User;