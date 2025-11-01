const { executeQuery } = require('../config/database');

// Check if user is a participant in conversation
const checkParticipant = async (userId, conversationId) => {
  const result = await executeQuery(`
    SELECT conversation_id FROM conversation_participants
    WHERE conversation_id = ? AND user_id = ? AND role IN ('buyer','member','support') AND left_at IS NULL
  `, [conversationId, userId]);
  return result.length > 0;
};

// List buyer conversations (basic inbox)
const getBuyerConversations = async (userId, { page = 1, limit = 20, search = '' } = {}) => {
  try {
    const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const offset = (safePage - 1) * safeLimit;

    // Build base WHERE conditions
    const where = [`cp.user_id = ?`, `cp.role IN ('buyer','member','support')`, `cp.left_at IS NULL`, `c.status = 'active'`];
    const params = [userId];
    
    if (search && search.trim()) {
      where.push(`(c.subject LIKE ? OR c.title LIKE ?)`);
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Build query with unread count and last message
    const query = `
      SELECT 
        c.id,
        COALESCE(c.subject, c.title, 'Conversation') AS subject,
        c.last_message_at,
        COALESCE(c.updated_at, c.created_at) as updated_at,
        c.created_at,
        -- Get last message
        last_msg.id as last_message_id,
        last_msg.content as last_message_content,
        last_msg.sender_id as last_message_sender_id,
        last_msg.created_at as last_message_timestamp,
        last_msg.is_read as last_message_read,
        -- Count unread messages (messages not from buyer)
        COALESCE((
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.conversation_id = c.id 
            AND m.is_read = 0 
            AND m.sender_id != ?
        ), 0) AS unread_count,
        -- Check if buyer has sent any messages in this conversation
        COALESCE((
          SELECT COUNT(*) > 0
          FROM messages m 
          WHERE m.conversation_id = c.id 
            AND m.sender_id = ?
        ), 0) AS has_buyer_messages,
        -- Get dealer/seller info
        dealer_participant.user_id as dealer_id,
        dealer_user.first_name as dealer_first_name,
        dealer_user.last_name as dealer_last_name,
        dealer_user.profile_image as dealer_avatar
      FROM conversation_participants cp
      INNER JOIN conversations c ON cp.conversation_id = c.id
      LEFT JOIN conversation_participants dealer_participant 
        ON c.id = dealer_participant.conversation_id 
        AND dealer_participant.user_id != ?
        AND dealer_participant.role IN ('seller', 'dealer', 'admin', 'member')
        AND dealer_participant.left_at IS NULL
      LEFT JOIN users dealer_user ON dealer_participant.user_id = dealer_user.id
      LEFT JOIN messages last_msg ON c.id = last_msg.conversation_id 
        AND last_msg.created_at = (
          SELECT MAX(created_at) 
          FROM messages 
          WHERE conversation_id = c.id
        )
      WHERE ${where.join(' AND ')}
      ORDER BY COALESCE(c.last_message_at, c.updated_at, c.created_at) DESC
      LIMIT ${safeLimit} OFFSET ${offset}
    `;

    // Parameters: userId for unread subquery, userId for has_buyer_messages check, userId for dealer join, then WHERE params
    const queryParams = [userId, userId, userId, ...params];

    const conversations = await executeQuery(query, queryParams);

    // Count total conversations
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM conversation_participants cp
      INNER JOIN conversations c ON cp.conversation_id = c.id
      WHERE ${where.join(' AND ')}
    `;
    
    const countRows = await executeQuery(countQuery, params);
    const total = parseInt(countRows[0]?.total || 0);

    // Format conversations for frontend
    const formattedConversations = conversations.map(c => ({
      id: c.id,
      subject: c.subject || 'Conversation',
      dealer_id: c.dealer_id || null,
      dealer_name: c.dealer_first_name && c.dealer_last_name 
        ? `${c.dealer_first_name} ${c.dealer_last_name}`.trim() 
        : (c.dealer_first_name || c.dealer_last_name || 'Dealer'),
      dealer_avatar: c.dealer_avatar || null,
      lastMessage: c.last_message_content ? {
        id: c.last_message_id || '',
        content: c.last_message_content || '',
        sender_id: c.last_message_sender_id || '',
        timestamp: c.last_message_timestamp || c.last_message_at,
        read: !!c.last_message_read,
        isFromBuyer: c.last_message_sender_id === userId
      } : null,
      unreadCount: parseInt(c.unread_count || 0),
      timestamp: c.last_message_at || c.updated_at || c.created_at,
      hasBuyerMessages: !!c.has_buyer_messages, // Flag indicating buyer has sent messages
    }));

    return {
      conversations: formattedConversations,
      pagination: { 
        page: safePage, 
        limit: safeLimit, 
        total, 
        totalPages: Math.ceil(total / safeLimit) 
      }
    };
  } catch (err) {
    console.error('Error getting buyer conversations:', err);
    throw err;
  }
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

// Permanently delete conversation for this buyer (leave the conversation; delete if no participants remain)
const deleteConversationForBuyer = async (userId, conversationId) => {
  try {
    // Mark buyer as left
    await executeQuery(`
      UPDATE conversation_participants
      SET left_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ? AND user_id = ? AND role IN ('buyer','member','support') AND left_at IS NULL
    `, [conversationId, userId]);

    // If no active participants remain, delete messages and conversation
    const remaining = await executeQuery(`
      SELECT COUNT(*) as cnt
      FROM conversation_participants
      WHERE conversation_id = ? AND left_at IS NULL
    `, [conversationId]);

    const count = parseInt(remaining[0]?.cnt) || 0;
    if (count === 0) {
      await executeQuery(`DELETE FROM messages WHERE conversation_id = ?`, [conversationId]);
      await executeQuery(`DELETE FROM conversation_participants WHERE conversation_id = ?`, [conversationId]);
      await executeQuery(`DELETE FROM conversations WHERE id = ?`, [conversationId]);
    }

    return { success: true, removed: count === 0 };
  } catch (err) {
    console.error('Error deleting conversation for buyer:', err);
    throw err;
  }
};

module.exports = {
  getBuyerConversations,
  getConversationMessages,
  sendMessage,
  deleteConversationForBuyer,
  checkParticipant,
};


