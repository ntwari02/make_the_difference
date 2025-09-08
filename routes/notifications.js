import express from 'express';
import db from '../config/database.js';
import { auth, bypassAuth } from '../middleware/auth.js';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Search users endpoint for admin
router.get('/admin/users/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    console.log('User search query:', q, 'User:', req.user);
    
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const searchTerm = `%${q}%`;
    const [users] = await db.query(`
      SELECT id, full_name as name, email, created_at 
      FROM users 
      WHERE (full_name LIKE ? OR email LIKE ?) 
      AND id != ?
      ORDER BY full_name ASC 
      LIMIT 20
    `, [searchTerm, searchTerm, req.user?.id || 0]);

    console.log('Found users:', users.length);
    res.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

// Create new conversation with user
router.post('/admin/conversations/new', auth, async (req, res) => {
  try {
    const { userId, userEmail, userName } = req.body;
    console.log('Creating conversation with:', { userId, userEmail, userName });
    
    if (!userId && !userEmail) {
      return res.status(400).json({ message: 'User ID or email required' });
    }

    // Check if conversation already exists
    let existingConversation;
    if (userId) {
      [existingConversation] = await db.query(
        'SELECT id FROM conversations WHERE user_id = ? LIMIT 1',
        [userId]
      );
    } else {
      [existingConversation] = await db.query(
        'SELECT id FROM conversations WHERE email = ? LIMIT 1',
        [userEmail]
      );
    }

    if (existingConversation.length > 0) {
      console.log('Found existing conversation:', existingConversation[0].id);
      return res.json({ 
        success: true, 
        conversationId: existingConversation[0].id,
        isNew: false 
      });
    }

    // Create new conversation (requires a notification first)
    console.log('Creating new conversation...');
    
    // First create a notification for this direct chat
    const [notifResult] = await db.query(`
      INSERT INTO notifications (user_id, email, title, message, is_read, created_at)
      VALUES (?, ?, ?, 'Direct chat initiated by admin', 0, CURRENT_TIMESTAMP)
    `, [userId || null, userEmail || null, `Chat with ${userName || userEmail}`]);
    
    // Then create the conversation that references this notification
    const [result] = await db.query(`
      INSERT INTO conversations (notification_id, user_id, email, admin_id, subject, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [notifResult.insertId, userId || null, userEmail || null, req.user.id, `Chat with ${userName || userEmail}`]);

    console.log('New conversation created with ID:', result.insertId);
    res.json({ 
      success: true, 
      conversationId: result.insertId,
      isNew: true 
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Failed to create conversation' });
  }
});

// Multer setup for chat attachments
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(process.cwd(), 'public', 'uploads', 'chat'));
  },
  filename: function (_req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ts = Date.now();
    const unique = `${ts}_${safe}`;
    cb(null, unique);
  }
});
const upload = multer({
  storage,
  // Increase per-file limit to 30MB and keep total files at 6
  limits: { fileSize: 30 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    try {
      // Only allow image files
      const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'image/webp',
        'image/bmp',
        'image/tiff',
        'image/svg+xml'
      ];
      
      // Check MIME type first
      if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true);
      }
      
      // Fallback: check file extension
      const ext = (file.originalname.split('.').pop() || '').toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'];
      
      if (allowedExtensions.includes(ext)) {
        return cb(null, true);
      }
      
      // Reject all other files (including PDFs, documents, etc.)
      return cb(new Error('Only image files are allowed in chat. Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF, SVG'), false);
    } catch (error) {
      return cb(new Error('File validation error'), false);
    }
  }
});



function getMailer() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    return transporter;
}

// DDL moved to migrations; no table creation at request time

// User: create a new notification and conversation to contact admin
router.post('/create-from-user', auth, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    // Create the notification bound to the user
    const [notifResult] = await db.query(
      'INSERT INTO notifications (user_id, email, title, message) VALUES (?, ?, ?, ?)',
      [req.user.id, req.user.email, title, message]
    );

    // Create conversation without admin assignment
    const [convResult] = await db.query(
      'INSERT INTO conversations (notification_id, user_id, email, admin_id, subject) VALUES (?, ?, ?, ?, ?)',
      [notifResult.insertId, req.user.id, req.user.email, null, title]
    );

    return res.status(201).json({
      success: true,
      notificationId: notifResult.insertId,
      conversationId: convResult.insertId,
      message: 'Your message has been sent to admin.'
    });
  } catch (error) {
    console.error('Error creating user conversation:', error);
    return res.status(500).json({ message: 'Failed to send message.' });
  }
});

// Create notification (admin only)
router.post('/', bypassAuth, async (req, res) => {
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
    
    // Attempt email send if SMTP configured
    try {
      const transporter = getMailer();
      if (!transporter) {
        console.warn('Email not sent: SMTP not configured');
      } else {
        const isHtml = /<([a-z][\s\S]*?)>/i.test(message);
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: title,
          html: isHtml ? message : undefined,
          text: isHtml ? undefined : message
        });
      }
    } catch (mailErr) {
      console.warn('Failed to send message email:', mailErr?.message || mailErr);
    }

    res.status(201).json({
      id: result.insertId,
      conversationId: conversationResult.insertId,
      message: 'Notification created and email attempted.',
      userFound: !!userId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating notification.' });
  }
});

// Get notifications for logged-in user with pagination and optimization
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, unread_only = false } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('[API] GET /api/notifications user:', { 
      id: req.user?.id, 
      email: req.user?.email,
      page: parseInt(page),
      limit: parseInt(limit),
      unread_only: unread_only === 'true'
    });

    // Build optimized query with proper indexing
    let query = `
      SELECT 
        id, 
        title, 
        message, 
        is_read, 
        created_at,
        user_id,
        email
      FROM notifications 
      WHERE (user_id = ? OR email = ?)
    `;
    
    const params = [req.user.id, req.user.email];
    
    if (unread_only === 'true') {
      query += ' AND is_read = 0';
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(query, params);
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM notifications 
      WHERE (user_id = ? OR email = ?)
      ${unread_only === 'true' ? 'AND is_read = 0' : ''}
    `;
    const [countResult] = await db.query(countQuery, [req.user.id, req.user.email]);
    const total = countResult[0].total;

    console.log('[API] /api/notifications rows:', rows?.length || 0, 'total:', total);
    
    res.json({
      notifications: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[API] Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications.' });
  }
});

// Get conversations for logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    console.log('[API] GET /api/notifications/conversations user:', { id: req.user?.id, email: req.user?.email });
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
    console.log('[API] /api/notifications/conversations count:', conversations?.length || 0);
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
    console.log('[API] GET /api/notifications/conversations/:id user:', { id: req.user?.id, email: req.user?.email }, 'id:', conversationId);
    
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
      console.warn('[API] conversation not found or not authorized for user:', conversationId);
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
    
    console.log('[API] /api/notifications/conversations/:id replies:', replies?.length || 0);
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

// Upload chat attachments
router.post('/conversations/:id/attachments', auth, upload.array('files', 6), async (req, res) => {
  try {
    const conversationId = req.params.id;
    // Basic access check
    const [conversations] = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND (user_id = ? OR email = ?)',
      [conversationId, req.user.id, req.user.email]
    );
    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const files = (req.files || []).map(f => ({
      originalName: f.originalname,
      filename: f.filename,
      path: f.filename, // Store just filename, reconstruct full path in frontend
      size: f.size,
      mimetype: f.mimetype
    }));

    // Store each as a reply with attachment metadata (simple approach)
    for (const file of files) {
      await db.query(
        'INSERT INTO replies (conversation_id, sender_type, sender_id, sender_email, message, attachment_url, attachment_type, attachment_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [conversationId, 'user', req.user.id, req.user.email, '', file.path, file.mimetype, file.size]
      );
    }

    // Update updated_at
    await db.query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId]);

    res.status(201).json({ success: true, files });
  } catch (error) {
    console.error('Error uploading attachments:', error);
    res.status(500).json({ message: 'Failed to upload attachments.' });
  }
});

// Admin upload chat attachments (for DM), mark as admin sender
router.post('/admin/conversations/:id/attachments', bypassAuth, upload.array('files', 6), async (req, res) => {
  try {
    const conversationId = req.params.id;
    // Ensure conversation exists
    const [conversations] = await db.query('SELECT id FROM conversations WHERE id = ? LIMIT 1', [conversationId]);
    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const files = (req.files || []).map(f => ({
      originalName: f.originalname,
      filename: f.filename,
      path: f.filename, // Store just filename, reconstruct full path in frontend
      size: f.size,
      mimetype: f.mimetype
    }));

    const inserted = [];
    for (const file of files) {
      const [ins] = await db.query(
        'INSERT INTO replies (conversation_id, sender_type, sender_id, sender_email, message, attachment_url, attachment_type, attachment_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [conversationId, 'admin', req.user?.id || null, req.user?.email || null, '', file.path, file.mimetype, file.size]
      );
      inserted.push({ id: ins.insertId, ...file });
    }

    await db.query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId]);

    // Emit socket event to conversation room for attachments
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`conv:${conversationId}`).emit('message', {
          conversationId,
          attachments: inserted.map(f => ({ id: f.id, conversation_id: Number(conversationId), attachment_url: f.path, attachment_type: f.mimetype, attachment_size: f.size, sender_type: 'admin', created_at: new Date() })),
          at: Date.now()
        });
      }
    } catch {}

    res.status(201).json({ success: true, files, inserted });
  } catch (error) {
    console.error('Error uploading admin attachments:', error);
    res.status(500).json({ message: 'Failed to upload attachments.' });
  }
});

// ===== Groups (basic schema assumed: groups(id,name,created_by,created_at), group_members(group_id,user_id,email,role), group_messages(id,group_id,sender_id,sender_email,message,attachment_url,created_at)) =====

// Create a new group (admin only)
router.post('/admin/groups', bypassAuth, async (req, res) => {
  try {
    const { name, userIds = [], emails = [] } = req.body || {};
    if (!name) return res.status(400).json({ message: 'Group name is required' });
    const creatorId = req.user?.id || null;

    const [gRes] = await db.query('INSERT INTO `groups` (name, created_by) VALUES (?, ?)', [name, creatorId]);
    const groupId = gRes.insertId;

    // Add members by userIds
    for (const uid of (userIds || [])) {
      await db.query('INSERT INTO `group_members` (group_id, user_id) VALUES (?, ?)', [groupId, uid]);
    }
    // Add members by emails (for users without id yet)
    for (const em of (emails || [])) {
      if (!em) continue;
      await db.query('INSERT INTO `group_members` (group_id, email) VALUES (?, ?)', [groupId, em]);
    }

    res.status(201).json({ success: true, groupId });
  } catch (e) {
    console.error('Error creating group:', e);
    res.status(500).json({ message: 'Failed to create group' });
  }
});

// List groups (admin view)
router.get('/admin/groups', bypassAuth, async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT g.*, (SELECT COUNT(*) FROM \`group_members\` gm WHERE gm.group_id=g.id) as member_count
      FROM \`groups\` g ORDER BY g.created_at DESC
    `);
    res.json({ success: true, groups: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to list groups' });
  }
});

// Post a group message
router.post('/groups/:id/messages', auth, async (req, res) => {
  try {
    const groupId = req.params.id;
    const { message = '' } = req.body || {};
    if (!message) return res.status(400).json({ message: 'Message required' });
    // Validate membership by user id or email
    const [m] = await db.query('SELECT 1 FROM `group_members` WHERE group_id=? AND (user_id=? OR email=?) LIMIT 1', [groupId, req.user.id, req.user.email]);
    if (m.length === 0) return res.status(403).json({ message: 'Not a member' });
    const [ins] = await db.query('INSERT INTO `group_messages` (group_id, sender_id, sender_email, message) VALUES (?, ?, ?, ?)', [groupId, req.user.id, req.user.email, message]);
    res.status(201).json({ success: true, id: ins.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to post message' });
  }
});

// Upload group attachments
router.post('/groups/:id/attachments', auth, upload.array('files', 6), async (req, res) => {
  try {
    const groupId = req.params.id;
    const [m] = await db.query('SELECT 1 FROM `group_members` WHERE group_id=? AND (user_id=? OR email=?) LIMIT 1', [groupId, req.user.id, req.user.email]);
    if (m.length === 0) return res.status(403).json({ message: 'Not a member' });
    const files = (req.files || []).map(f => ({
      path: f.filename, // Store just filename, reconstruct full path in frontend
      type: f.mimetype,
      size: f.size
    }));
    for (const f of files) {
      await db.query('INSERT INTO `group_messages` (group_id, sender_id, sender_email, message, attachment_url, attachment_type, attachment_size) VALUES (?, ?, ?, ?, ?, ?, ?)', [groupId, req.user.id, req.user.email, '', f.path, f.type, f.size]);
    }
    res.status(201).json({ success: true, files });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to upload attachments' });
  }
});

// View chat file endpoint - Enhanced for better PDF support
router.get('/view/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid filename' 
      });
    }
    
    // Construct file path
   
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }
    
    // Get original filename from database if possible
    let originalName = filename;
    try {
      const [rows] = await db.query(
        'SELECT attachment_url FROM replies WHERE attachment_url = ? LIMIT 1',
        [filename]
      );
      if (rows.length > 0) {
        // Extract original name from timestamped filename
        const parts = filename.split('_');
        if (parts.length > 1) {
          originalName = parts.slice(1).join('_');
        }
      }
    } catch (dbError) {
      // If database query fails, use the filename as is
      console.warn('Could not get original filename from database:', dbError.message);
    }
    
    // Determine content type based on file extension
    const ext = path.extname(originalName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.zip':
        contentType = 'application/zip';
        break;
    }
    
    // Enhanced headers for better PDF viewing support
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // For PDFs, add additional headers to help browsers display them properly
    if (ext === '.pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);
    }
    
    // Send file directly
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Error in view endpoint:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }
});

// Download chat file endpoint - Alternative to view for better compatibility
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid filename' 
      });
    }
    
    // Construct file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'chat', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }
    
    // Get original filename from database if possible
    let originalName = filename;
    try {
      const [rows] = await db.query(
        'SELECT attachment_url FROM replies WHERE attachment_url = ? LIMIT 1',
        [filename]
      );
      if (rows.length > 0) {
        // Extract original name from timestamped filename
        const parts = filename.split('_');
        if (parts.length > 1) {
          originalName = parts.slice(1).join('_');
        }
      }
    } catch (dbError) {
      // If database query fails, use the filename as is
      console.warn('Could not get original filename from database:', dbError.message);
    }
    
    // Determine content type based on file extension
    const ext = path.extname(originalName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.xls':
        contentType = 'application/vnd.ms-excel';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.zip':
        contentType = 'application/zip';
        break;
    }
    
    // Set headers for downloading
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Send file directly
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Error in download endpoint:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }
});

// Fetch group messages (paginated)
router.get('/groups/:id/messages', auth, async (req, res) => {
  try {
    const groupId = req.params.id;
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const pageSize = Math.max(1, Math.min(200, parseInt(String(limit), 10) || 50));
    const offset = (pageNum - 1) * pageSize;

    const [m] = await db.query('SELECT 1 FROM `group_members` WHERE group_id=? AND (user_id=? OR email=?) LIMIT 1', [groupId, req.user.id, req.user.email]);
    if (m.length === 0) return res.status(403).json({ message: 'Not a member' });

    const [rows] = await db.query(`
      SELECT id, group_id, sender_id, sender_email, message, attachment_url, attachment_type, attachment_size, created_at
      FROM \`group_messages\`
      WHERE group_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [groupId, pageSize, offset]);

    res.json({ success: true, messages: rows, pagination: { page: pageNum, limit: pageSize } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});


// Admin: Get all conversations
router.get('/admin/conversations', bypassAuth, async (req, res) => {
  try {
    const {
      q = '',
      from = '',
      to = '',
      replies = 'any', // 'any' | '0' | '>0'
      sort = 'updated_desc', // updated_desc|updated_asc|created_desc|created_asc
      page = '1',
      limit = '20'
    } = req.query || {};

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 20));
    const offset = (pageNum - 1) * pageSize;

    const conditions = [];
    const params = [];

    if (q) {
      conditions.push(`(n.title LIKE ? OR n.message LIKE ? OR u.email LIKE ? OR c.email LIKE ?)`);
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    if (from) {
      conditions.push(`c.created_at >= ?`);
      params.push(from);
    }
    if (to) {
      conditions.push(`c.created_at <= DATE_ADD(?, INTERVAL 1 DAY)`);
      params.push(to);
    }
    if (replies === '0') {
      conditions.push(`(SELECT COUNT(*) FROM replies rr WHERE rr.conversation_id = c.id) = 0`);
    } else if (replies === '>0') {
      conditions.push(`(SELECT COUNT(*) FROM replies rr WHERE rr.conversation_id = c.id) > 0`);
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderSql = 'ORDER BY c.updated_at DESC';
    switch (sort) {
      case 'updated_asc': orderSql = 'ORDER BY c.updated_at ASC'; break;
      case 'created_desc': orderSql = 'ORDER BY c.created_at DESC'; break;
      case 'created_asc': orderSql = 'ORDER BY c.created_at ASC'; break;
      default: orderSql = 'ORDER BY c.updated_at DESC';
    }

    // Count total distinct conversations matching filters
    const countSql = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM conversations c
      JOIN notifications n ON c.notification_id = n.id
      LEFT JOIN users u ON c.user_id = u.id
      ${whereSql}
    `;
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    const dataSql = `
      SELECT 
        c.*,
        n.title as notification_title,
        n.message as notification_message,
        u.full_name as user_name,
        u.email as user_email,
        admin.full_name as admin_name,
        COUNT(r.id) as reply_count,
        MAX(r.created_at) as last_reply_at,
        CASE WHEN COALESCE(c.is_read, 0) = 0 THEN 1 ELSE 0 END as unread_count
      FROM conversations c
      JOIN notifications n ON c.notification_id = n.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users admin ON c.admin_id = admin.id
      LEFT JOIN replies r ON c.id = r.conversation_id
      ${whereSql}
      GROUP BY c.id
      ${orderSql}
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, pageSize, offset];
    const [rows] = await db.query(dataSql, dataParams);

    res.json({
      success: true,
      conversations: rows,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        pages: Math.max(1, Math.ceil(total / pageSize))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching conversations.' });
  }
});

// Export filtered conversations as CSV
router.get('/admin/conversations/export', bypassAuth, async (req, res) => {
  try {
    const {
      q = '', from = '', to = '', replies = 'any', sort = 'updated_desc'
    } = req.query || {};

    const conditions = [];
    const params = [];
    if (q) {
      conditions.push(`(n.title LIKE ? OR n.message LIKE ? OR u.email LIKE ? OR c.email LIKE ?)`);
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    if (from) { conditions.push(`c.created_at >= ?`); params.push(from); }
    if (to) { conditions.push(`c.created_at <= DATE_ADD(?, INTERVAL 1 DAY)`); params.push(to); }
    if (replies === '0') { conditions.push(`(SELECT COUNT(*) FROM replies rr WHERE rr.conversation_id = c.id) = 0`); }
    else if (replies === '>0') { conditions.push(`(SELECT COUNT(*) FROM replies rr WHERE rr.conversation_id = c.id) > 0`); }
    const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderSql = 'ORDER BY c.updated_at DESC';
    switch (sort) {
      case 'updated_asc': orderSql = 'ORDER BY c.updated_at ASC'; break;
      case 'created_desc': orderSql = 'ORDER BY c.created_at DESC'; break;
      case 'created_asc': orderSql = 'ORDER BY c.created_at ASC'; break;
      default: orderSql = 'ORDER BY c.updated_at DESC';
    }

    const sql = `
      SELECT 
        c.id,
        c.created_at,
        c.updated_at,
        n.title,
        n.message,
        COALESCE(u.email, c.email) AS user_email,
        (SELECT COUNT(*) FROM replies rr WHERE rr.conversation_id = c.id) AS reply_count
      FROM conversations c
      JOIN notifications n ON c.notification_id = n.id
      LEFT JOIN users u ON c.user_id = u.id
      ${whereSql}
      ${orderSql}
      LIMIT 5000
    `;
    const [rows] = await db.query(sql, params);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="conversations.csv"');
    res.write('id,created_at,updated_at,title,message,user_email,reply_count\n');
    for (const r of rows) {
      const line = [
        r.id,
        new Date(r.created_at).toISOString(),
        new Date(r.updated_at || r.created_at).toISOString(),
        JSON.stringify(r.title||'').replace(/^"|"$/g,'')
          .replace(/\\n/g,' '),
        JSON.stringify((r.message||'').toString()).replace(/^"|"$/g,'')
          .replace(/\\n/g,' '),
        r.user_email || '',
        r.reply_count || 0
      ].map(v => typeof v === 'string' && v.includes(',') ? `"${v.replace(/"/g,'""')}"` : v).join(',');
      res.write(line + '\n');
    }
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error exporting conversations.' });
  }
});

// Admin: Get conversation details
router.get('/admin/conversations/:id', bypassAuth, async (req, res) => {
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

// Mark conversation as read (user)
router.put('/conversations/:id/read', auth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Verify user has access to this conversation
    const [conversations] = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND (user_id = ? OR email = ?)',
      [conversationId, req.user.id, req.user.email]
    );
    
    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found or access denied.' });
    }
    
    // Mark as read and set last_read_at if column exists; fall back gracefully
    try {
      await db.query(
        'UPDATE conversations SET is_read = 1, last_read_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [conversationId]
      );
    } catch (columnError) {
      // If is_read column doesn't exist, just update updated_at
      if (columnError.code === 'ER_BAD_FIELD_ERROR') {
        await db.query(
          'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [conversationId]
        );
      } else {
        throw columnError;
      }
    }
    
    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ message: 'Error marking conversation as read.' });
  }
});

// Admin: Delete conversation
router.delete('/admin/conversations/:id', bypassAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Check if conversation exists
    const [conversations] = await db.query(
      'SELECT * FROM conversations WHERE id = ?',
      [conversationId]
    );
    
    if (conversations.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    
    // Delete all replies first (due to foreign key constraint)
    await db.query('DELETE FROM replies WHERE conversation_id = ?', [conversationId]);
    
    // Delete the conversation
    await db.query('DELETE FROM conversations WHERE id = ?', [conversationId]);
    
    res.json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Error deleting conversation.' });
  }
});

// Admin: Mark conversation as read
router.put('/admin/conversations/:id/read', bypassAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    
    // Mark as read and set last_read_at if column exists; fall back gracefully
    try {
      await db.query(
        'UPDATE conversations SET is_read = 1, last_read_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [conversationId]
      );
    } catch (columnError) {
      // If is_read column doesn't exist, just update updated_at
      if (columnError.code === 'ER_BAD_FIELD_ERROR') {
        await db.query(
          'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [conversationId]
        );
      } else {
        throw columnError;
      }
    }
    
    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ message: 'Error marking conversation as read.' });
  }
});

// Admin: Add reply to conversation
router.post('/admin/conversations/:id/replies', bypassAuth, async (req, res) => {
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
    
    // Update conversation timestamp and mark as unread for admin
    try {
      await db.query(
        'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP, is_read = 0 WHERE id = ?',
        [conversationId]
      );
    } catch (columnError) {
      // If is_read column doesn't exist, just update updated_at
      if (columnError.code === 'ER_BAD_FIELD_ERROR') {
        await db.query(
          'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [conversationId]
        );
      } else {
        throw columnError;
      }
    }
    
    // Emit socket event to conversation room for real-time user updates
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`conv:${conversationId}`).emit('message', {
          conversationId,
          message: { id: result.insertId, conversation_id: Number(conversationId), sender_type: 'admin', sender_id: req.user?.id || null, sender_email: req.user?.email || null, message, created_at: new Date() },
          at: Date.now()
        });
      }
    } catch {}
    
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

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Check if notification exists and user has access
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE id = ? AND (user_id = ? OR email = ?)',
      [notificationId, req.user.id, req.user.email]
    );
    
    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notification not found or access denied.' });
    }
    
    // Delete the notification
    await db.query('DELETE FROM notifications WHERE id = ?', [notificationId]);
    
    res.json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification.' });
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

// Get unified unread count (notifications + chat messages)
router.get('/unified-count', auth, async (req, res) => {
  try {
    // Count unread notifications
    const [notifResult] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE (user_id = ? OR email = ?) AND is_read = FALSE',
      [req.user.id, req.user.email]
    );
    
    // Count unread conversations; prefer last_read_at if present, otherwise fallback to is_read
    let convResult;
    try {
      [convResult] = await db.query(`
        SELECT COUNT(DISTINCT c.id) as count 
        FROM conversations c
        JOIN notifications n ON c.notification_id = n.id
        LEFT JOIN replies r ON c.id = r.conversation_id
        WHERE (c.user_id = ? OR c.email = ?) 
        AND (
          COALESCE(c.is_read, 0) = 0
          OR EXISTS (
            SELECT 1 FROM replies r2 
            WHERE r2.conversation_id = c.id 
            AND r2.sender_type = 'admin' 
            AND r2.created_at > COALESCE(c.last_read_at, c.created_at)
          )
        )
      `, [req.user.id, req.user.email]);
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        // Fallback when last_read_at column is missing
        [convResult] = await db.query(`
          SELECT COUNT(DISTINCT c.id) as count 
          FROM conversations c
          JOIN notifications n ON c.notification_id = n.id
          LEFT JOIN replies r ON c.id = r.conversation_id
          WHERE (c.user_id = ? OR c.email = ?) 
          AND (c.is_read = 0 OR c.is_read IS NULL)
        `, [req.user.id, req.user.email]);
      } else {
        throw err;
      }
    }
    
    const notificationCount = notifResult[0].count || 0;
    const conversationCount = convResult[0].count || 0;
    const totalCount = notificationCount + conversationCount;
    
    res.json({ 
      success: true,
      totalCount,
      notificationCount,
      conversationCount,
      breakdown: {
        notifications: notificationCount,
        conversations: conversationCount
      }
    });
  } catch (error) {
    console.error('Error fetching unified unread count:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching unread count.' 
    });
  }
});

// Delete a reply message (admin only)
router.delete('/admin/replies/:id', bypassAuth, async (req, res) => {
  try {
    const replyId = req.params.id;
    
    // Check if reply exists and get conversation info
    const [replies] = await db.query(`
      SELECT r.*, c.id as conversation_id
      FROM replies r
      JOIN conversations c ON r.conversation_id = c.id
      WHERE r.id = ?
    `, [replyId]);
    
    if (replies.length === 0) {
      return res.status(404).json({ message: 'Reply not found.' });
    }
    
    const reply = replies[0];
    
    // Only allow admin to delete their own messages or any message if they're admin
    if (reply.sender_type !== 'admin') {
      return res.status(403).json({ message: 'Only admin messages can be deleted.' });
    }
    
    // Delete the reply
    await db.query('DELETE FROM replies WHERE id = ?', [replyId]);
    
    // Update conversation timestamp
    await db.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [reply.conversation_id]
    );
    
    res.json({ success: true, message: 'Reply deleted successfully.' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Error deleting reply.' });
  }
});

// Delete a reply message (user)
router.delete('/replies/:id', auth, async (req, res) => {
  try {
    const replyId = req.params.id;
    const userId = req.user.id;
    
    console.log(`[DELETE] Attempting to delete reply ${replyId} by user ${userId}`);
    
    // Check if reply exists and get conversation info
    const [replies] = await db.query(`
      SELECT r.*, c.id as conversation_id, c.user_id
      FROM replies r
      JOIN conversations c ON r.conversation_id = c.id
      WHERE r.id = ?
    `, [replyId]);
    
    if (replies.length === 0) {
      console.log(`[DELETE] Reply ${replyId} not found`);
      return res.status(404).json({ message: 'Reply not found.' });
    }
    
    const reply = replies[0];
    console.log(`[DELETE] Reply found:`, {
      id: reply.id,
      sender_type: reply.sender_type,
      sender_id: reply.sender_id,
      user_id: reply.user_id,
      requesting_user: userId
    });
    
    // Only allow user to delete their own messages from their conversations
    if (reply.sender_type !== 'user' || reply.sender_id !== userId) {
      console.log(`[DELETE] Permission denied: sender_type=${reply.sender_type}, sender_id=${reply.sender_id}, user_id=${userId}`);
      return res.status(403).json({ message: 'You can only delete your own messages.' });
    }
    
    // Delete the reply
    await db.query('DELETE FROM replies WHERE id = ?', [replyId]);
    
    // Update conversation timestamp
    await db.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [reply.conversation_id]
    );
    
    console.log(`[DELETE] Reply ${replyId} deleted successfully by user ${userId}`);
    res.json({ success: true, message: 'Reply deleted successfully.' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Error deleting reply.' });
  }
});

// Delete a group message (admin only)
router.delete('/groups/messages/:id', bypassAuth, async (req, res) => {
  try {
    const messageId = req.params.id;
    
    // Check if message exists and get group info
    const [messages] = await db.query(`
      SELECT gm.*, g.id as group_id
      FROM group_messages gm
      JOIN \`groups\` g ON gm.group_id = g.id
      WHERE gm.id = ?
    `, [messageId]);
    
    if (messages.length === 0) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    
    const message = messages[0];
    
    // Only allow admin to delete their own messages or any message if they're admin
    if (String(message.sender_id) !== String(req.user?.id || 'admin')) {
      return res.status(403).json({ message: 'Only admin messages can be deleted.' });
    }
    
    // Delete the message
    await db.query('DELETE FROM group_messages WHERE id = ?', [messageId]);
    
    res.json({ success: true, message: 'Group message deleted successfully.' });
  } catch (error) {
    console.error('Error deleting group message:', error);
    res.status(500).json({ message: 'Error deleting group message.' });
  }
});

export default router; 
