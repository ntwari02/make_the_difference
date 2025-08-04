import express from 'express';
import db from '../config/database.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Initialize notifications and conversations tables
async function initializeTables() {
    try {
        // Initialize notifications table
        const [notificationTables] = await db.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'notifications'
        `);
        
        if (notificationTables.length === 0) {
            await db.query(`
                CREATE TABLE notifications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NULL,
                    email VARCHAR(255) NULL,
                    title VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_email (email),
                    INDEX idx_user_id (user_id)
                )
            `);
            console.log('Notifications table created successfully');
        } else {
            // Check if email column exists, if not add it
            const [columns] = await db.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'notifications' 
                AND COLUMN_NAME = 'email'
            `);
            
            if (columns.length === 0) {
                await db.query(`
                    ALTER TABLE notifications 
                    ADD COLUMN email VARCHAR(255) NULL,
                    ADD INDEX idx_email (email)
                `);
                console.log('Added email column to notifications table');
            }
        }

        // Initialize conversations table
        const [conversationTables] = await db.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'conversations'
        `);
        
        if (conversationTables.length === 0) {
            await db.query(`
                CREATE TABLE conversations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    notification_id INT NOT NULL,
                    user_id INT NULL,
                    email VARCHAR(255) NULL,
                    admin_id INT NULL,
                    subject VARCHAR(255) NOT NULL,
                    status ENUM('active', 'closed') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
                    INDEX idx_notification_id (notification_id),
                    INDEX idx_user_id (user_id),
                    INDEX idx_email (email),
                    INDEX idx_status (status)
                )
            `);
            console.log('Conversations table created successfully');
        }

        // Initialize replies table
        const [replyTables] = await db.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'replies'
        `);
        
        if (replyTables.length === 0) {
            await db.query(`
                CREATE TABLE replies (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    conversation_id INT NOT NULL,
                    sender_type ENUM('user', 'admin') NOT NULL,
                    sender_id INT NULL,
                    sender_email VARCHAR(255) NULL,
                    message TEXT NOT NULL,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                    INDEX idx_conversation_id (conversation_id),
                    INDEX idx_sender_type (sender_type),
                    INDEX idx_created_at (created_at)
                )
            `);
            console.log('Replies table created successfully');
        }
    } catch (error) {
        console.error('Error initializing tables:', error);
    }
}

// Initialize tables on startup
initializeTables();

// Create notification (admin only)
router.post('/', adminAuth, async (req, res) => {
  const { email, title, message } = req.body;
  if (!email || !title || !message) {
    return res.status(400).json({ message: 'Email, title and message are required.' });
  }
  try {
    // First, try to find the user by email
    const [users] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    let userId = null;
    if (users.length > 0) {
      userId = users[0].id;
    }
    
    // Create the notification
    const [result] = await db.query(
      'INSERT INTO notifications (user_id, email, title, message) VALUES (?, ?, ?, ?)',
      [userId, email, title, message]
    );
    
    // Create a conversation for this notification
    const [conversationResult] = await db.query(
      'INSERT INTO conversations (notification_id, user_id, email, admin_id, subject) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, userId, email, req.user.id, title]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      conversationId: conversationResult.insertId,
      message: 'Notification sent successfully!',
      userFound: !!userId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating notification.' });
  }
});

// Get notifications for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? OR email = ? ORDER BY created_at DESC',
      [req.user.id, req.user.email]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notifications.' });
  }
});

// Get conversations for logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    const [conversations] = await db.query(`
      SELECT 
        c.*,
        n.title as notification_title,
        n.message as notification_message,
        COUNT(r.id) as reply_count,
        MAX(r.created_at) as last_reply_at
      FROM conversations c
      JOIN notifications n ON c.notification_id = n.id
      LEFT JOIN replies r ON c.id = r.conversation_id
      WHERE c.user_id = ? OR c.email = ?
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `, [req.user.id, req.user.email]);
    
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching conversations.' });
  }
});

// Get conversation details with replies
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Get conversation details
    const [conversations] = await db.query(`
      SELECT 
        c.*,
        n.title as notification_title,
        n.message as notification_message,
        u.full_name as user_name,
        admin.full_name as admin_name
      FROM conversations c
      JOIN notifications n ON c.notification_id = n.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users admin ON c.admin_id = admin.id
      WHERE c.id = ? AND (c.user_id = ? OR c.email = ?)
    `, [conversationId, req.user.id, req.user.email]);
    
    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    
    // Get replies
    const [replies] = await db.query(`
      SELECT 
        r.*,
        u.full_name as sender_name
      FROM replies r
      LEFT JOIN users u ON r.sender_id = u.id
      WHERE r.conversation_id = ?
      ORDER BY r.created_at ASC
    `, [conversationId]);
    
    res.json({
      conversation: conversations[0],
      replies: replies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching conversation.' });
  }
});

// Add reply to conversation
router.post('/conversations/:id/replies', auth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }
    
    // Verify user has access to this conversation
    const [conversations] = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND (user_id = ? OR email = ?)',
      [conversationId, req.user.id, req.user.email]
    );
    
    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    
    // Add reply
    const [result] = await db.query(
      'INSERT INTO replies (conversation_id, sender_type, sender_id, sender_email, message) VALUES (?, ?, ?, ?, ?)',
      [conversationId, 'user', req.user.id, req.user.email, message]
    );
    
    // Update conversation timestamp
    await db.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Reply sent successfully!' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending reply.' });
  }
});

// Admin: Get all conversations
router.get('/admin/conversations', adminAuth, async (req, res) => {
  try {
    const [conversations] = await db.query(`
      SELECT 
        c.*,
        n.title as notification_title,
        n.message as notification_message,
        u.full_name as user_name,
        u.email as user_email,
        admin.full_name as admin_name,
        COUNT(r.id) as reply_count,
        MAX(r.created_at) as last_reply_at
      FROM conversations c
      JOIN notifications n ON c.notification_id = n.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users admin ON c.admin_id = admin.id
      LEFT JOIN replies r ON c.id = r.conversation_id
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `);
    
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching conversations.' });
  }
});

// Admin: Get conversation details
router.get('/admin/conversations/:id', adminAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Get conversation details
    const [conversations] = await db.query(`
      SELECT 
        c.*,
        n.title as notification_title,
        n.message as notification_message,
        u.full_name as user_name,
        u.email as user_email,
        admin.full_name as admin_name
      FROM conversations c
      JOIN notifications n ON c.notification_id = n.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users admin ON c.admin_id = admin.id
      WHERE c.id = ?
    `, [conversationId]);
    
    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    
    // Get replies
    const [replies] = await db.query(`
      SELECT 
        r.*,
        u.full_name as sender_name
      FROM replies r
      LEFT JOIN users u ON r.sender_id = u.id
      WHERE r.conversation_id = ?
      ORDER BY r.created_at ASC
    `, [conversationId]);
    
    res.json({
      conversation: conversations[0],
      replies: replies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching conversation.' });
  }
});

// Admin: Add reply to conversation
router.post('/admin/conversations/:id/replies', adminAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }
    
    // Verify conversation exists
    const [conversations] = await db.query(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );
    
    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    
    // Add reply
    const [result] = await db.query(
      'INSERT INTO replies (conversation_id, sender_type, sender_id, sender_email, message) VALUES (?, ?, ?, ?, ?)',
      [conversationId, 'admin', req.user.id, req.user.email, message]
    );
    
    // Update conversation timestamp
    await db.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Reply sent successfully!' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending reply.' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND (user_id = ? OR email = ?)',
      [req.params.id, req.user.id, req.user.email]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating notification.' });
  }
});

// Get unread notifications count
router.get('/count', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE (user_id = ? OR email = ?) AND is_read = FALSE',
      [req.user.id, req.user.email]
    );
    res.json({ count: result[0].count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notification count.' });
  }
});

export default router; 