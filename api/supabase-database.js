// Supabase Database Connection for Vercel (FREE TIER)
import { createClient } from '@supabase/supabase-js';

class SupabaseDatabase {
  constructor() {
    this.supabase = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected && this.supabase) {
        return this.supabase;
      }

      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.isConnected = true;
      
      console.log('✅ Supabase connected successfully');
      return this.supabase;
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
      throw error;
    }
  }

  async query(table, operation = 'select', options = {}) {
    try {
      const supabase = await this.connect();
      
      let query = supabase.from(table);
      
      switch (operation) {
        case 'select':
          query = query.select(options.columns || '*');
          if (options.where) {
            Object.keys(options.where).forEach(key => {
              query = query.eq(key, options.where[key]);
            });
          }
          if (options.orderBy) {
            query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
          }
          if (options.limit) {
            query = query.limit(options.limit);
          }
          break;
          
        case 'insert':
          query = query.insert(options.data);
          break;
          
        case 'update':
          query = query.update(options.data);
          if (options.where) {
            Object.keys(options.where).forEach(key => {
              query = query.eq(key, options.where[key]);
            });
          }
          break;
          
        case 'delete':
          if (options.where) {
            Object.keys(options.where).forEach(key => {
              query = query.eq(key, options.where[key]);
            });
          }
          query = query.delete();
          break;
          
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Query failed:', error.message);
      throw error;
    }
  }

  // Initialize database tables
  async initializeTables() {
    try {
      const supabase = await this.connect();
      
      // Create users table
      const { error: usersError } = await supabase.rpc('create_users_table', {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `
      });

      // Create scholarships table
      const { error: scholarshipsError } = await supabase.rpc('create_scholarships_table', {
        sql: `
          CREATE TABLE IF NOT EXISTS scholarships (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            amount DECIMAL(10,2),
            deadline DATE,
            requirements TEXT,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT NOW()
          );
        `
      });

      // Create applications table
      const { error: applicationsError } = await supabase.rpc('create_applications_table', {
        sql: `
          CREATE TABLE IF NOT EXISTS applications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            scholarship_id INTEGER REFERENCES scholarships(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending',
            documents JSONB,
            submitted_at TIMESTAMP DEFAULT NOW()
          );
        `
      });

      if (usersError || scholarshipsError || applicationsError) {
        console.warn('⚠️ Some tables may already exist');
      }

      console.log('✅ Database tables initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Table initialization failed:', error.message);
      // Tables might already exist, which is fine
      return true;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const supabase = await this.connect();
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        return { status: 'unhealthy', message: error.message };
      }
      
      return { status: 'healthy', message: 'Supabase connection working' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }

  // User operations
  async createUser(userData) {
    return await this.query('users', 'insert', { data: userData });
  }

  async getUserById(id) {
    const users = await this.query('users', 'select', { where: { id } });
    return users[0] || null;
  }

  async getUserByEmail(email) {
    const users = await this.query('users', 'select', { where: { email } });
    return users[0] || null;
  }

  // Scholarship operations
  async createScholarship(scholarshipData) {
    return await this.query('scholarships', 'insert', { data: scholarshipData });
  }

  async getScholarships(options = {}) {
    return await this.query('scholarships', 'select', {
      where: { status: 'active' },
      orderBy: { column: 'created_at', ascending: false },
      ...options
    });
  }

  // Application operations
  async createApplication(applicationData) {
    return await this.query('applications', 'insert', { data: applicationData });
  }

  async getApplicationsByUser(userId) {
    return await this.query('applications', 'select', { where: { user_id: userId } });
  }
}

// Create singleton instance
const db = new SupabaseDatabase();

export default db;
