// Serverless Database Connection for Vercel
import mysql from 'mysql2/promise';

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (this.isConnected && this.connection) {
        return this.connection;
      }

      const config = {
        host: process.env.DB_HOST || 'aws.connect.psdb.cloud',
        user: process.env.DB_USER || 'default',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'mbappe_scholarship_db',
        ssl: {
          rejectUnauthorized: true
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      };

      this.connection = await mysql.createConnection(config);
      this.isConnected = true;
      
      console.log('✅ Database connected successfully');
      return this.connection;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const connection = await this.connect();
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error('❌ Query failed:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      this.isConnected = false;
      this.connection = null;
      console.log('🔌 Database connection closed');
    }
  }

  // Initialize database tables
  async initializeTables() {
    try {
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user', 'secretary') DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;

      const createScholarshipsTable = `
        CREATE TABLE IF NOT EXISTS scholarships (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          amount DECIMAL(10,2),
          deadline DATE,
          requirements TEXT,
          status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createApplicationsTable = `
        CREATE TABLE IF NOT EXISTS applications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          scholarship_id INT,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
          documents JSON,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
        )
      `;

      await this.query(createUsersTable);
      await this.query(createScholarshipsTable);
      await this.query(createApplicationsTable);

      console.log('✅ Database tables initialized successfully');
    } catch (error) {
      console.error('❌ Table initialization failed:', error.message);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.query('SELECT 1 as status');
      return { status: 'healthy', message: 'Database connection working' };
    } catch (error) {
      return { status: 'unhealthy', message: error.message };
    }
  }
}

// Create singleton instance
const db = new DatabaseConnection();

export default db;
