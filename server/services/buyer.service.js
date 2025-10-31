const { executeQuery } = require('../config/database');

// List buyer conversations (basic inbox)
const getBuyerConversations = async (userId, { page = 1, limit = 20, search = '' } = {}) => {
  const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const where = [`cp.user_id = ?`, `cp.role IN ('buyer','member','support')`, `cp.left_at IS NULL`, `c.status = 'active'`];
  const params = [userId];
  if (search) {
    where.push(`(c.subject LIKE ? OR c.title LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`);
  }

  const conversations = await executeQuery(`
    SELECT 
      c.id,
      COALESCE(c.subject, c.title, 'Conversation') AS subject,
      c.last_message_at,
      (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = 0 AND m.sender_id != ?) AS unread_count
    FROM conversation_participants cp
    INNER JOIN conversations c ON cp.conversation_id = c.id
    WHERE ${where.join(' AND ')}
    ORDER BY c.last_message_at DESC, c.updated_at DESC
    LIMIT ${safeLimit} OFFSET ${offset}
  `, [userId, ...params]);

  const countRows = await executeQuery(`
    SELECT COUNT(*) as total
    FROM conversation_participants cp
    INNER JOIN conversations c ON cp.conversation_id = c.id
    WHERE ${where.join(' AND ')}
  `, params);

  const total = countRows[0]?.total || 0;

  return {
    conversations: conversations.map(c => ({
      id: c.id,
      subject: c.subject,
      lastMessage: null,
      unreadCount: Number(c.unread_count || 0),
      timestamp: c.last_message_at,
    })),
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) }
  };
};

// Get messages in a conversation for buyer
const getConversationMessages = async (userId, conversationId) => {
  const participantCheck = await executeQuery(`
    SELECT cp.conversation_id, c.subject, c.title
    FROM conversation_participants cp
    INNER JOIN conversations c ON cp.conversation_id = c.id
    WHERE cp.conversation_id = ? 
      AND cp.user_id = ?
      AND cp.role IN ('buyer','member','support')
      AND cp.left_at IS NULL
      AND c.status = 'active'
  `, [conversationId, userId]);
  if (participantCheck.length === 0) {
    throw new Error('Conversation not found or unauthorized');
  }

  const messages = await executeQuery(`
    SELECT m.id, m.sender_id, m.content, m.message_type, m.file_url, m.is_read, m.category, m.priority, m.created_at,
           u.first_name, u.last_name, u.profile_image AS sender_avatar
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `, [conversationId]);

  // Mark as read (buyer side)
  await executeQuery(`
    UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND is_read = 0 AND sender_id != ?
  `, [conversationId, userId]);

  return {
    conversation: {
      id: conversationId,
      subject: participantCheck[0].subject || participantCheck[0].title || 'Conversation'
    },
    messages: messages.map(m => ({
      id: m.id,
      sender: {
        id: m.sender_id,
        name: m.sender_id === userId ? 'You' : `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Anonymous',
        avatar: m.sender_avatar || '',
        type: m.sender_id === userId ? 'buyer' : 'seller'
      },
      content: m.content || '',
      messageType: m.message_type || 'text',
      fileUrl: m.file_url || null,
      read: !!m.is_read,
      category: m.category || 'inquiry',
      priority: m.priority || 'normal',
      timestamp: m.created_at
    }))
  };
};

// Send message as buyer
const sendMessage = async (userId, conversationId, content, options = {}) => {
  const participantCheck = await executeQuery(`
    SELECT conversation_id FROM conversation_participants
    WHERE conversation_id = ? AND user_id = ? AND role IN ('buyer','member','support') AND left_at IS NULL
  `, [conversationId, userId]);
  if (participantCheck.length === 0) {
    throw new Error('Conversation not found or unauthorized');
  }

  const messageId = require('crypto').randomUUID();
  await executeQuery(`
    INSERT INTO messages (id, conversation_id, sender_id, content, message_type, file_url, category, priority, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
  `, [
    messageId,
    conversationId,
    userId,
    String(content || '').trim(),
    options.messageType || 'text',
    options.fileUrl || null,
    options.category || 'inquiry',
    options.priority || 'normal'
  ]);

  await executeQuery(`UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [conversationId]);

  const created = await executeQuery(`
    SELECT m.id, m.sender_id, m.content, m.message_type, m.file_url, m.category, m.priority, m.created_at,
           u.profile_image AS sender_avatar
    FROM messages m
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE m.id = ?
  `, [messageId]);
  const m = created[0];
  return {
    id: m.id,
    sender: { id: m.sender_id, name: 'You', avatar: m.sender_avatar || '', type: 'buyer' },
    content: m.content,
    messageType: m.message_type || 'text',
    fileUrl: m.file_url || null,
    category: m.category || 'inquiry',
    priority: m.priority || 'normal',
    timestamp: m.created_at
  };
};

module.exports = {
  getBuyerConversations,
  getConversationMessages,
  sendMessage,
};


