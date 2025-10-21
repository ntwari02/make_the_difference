const { executeQuery } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class MessagingService {
  // Create a new conversation between seller and buyer
  async createConversation(sellerId, buyerId, subject = null) {
    try {
      console.log(`🔍 Creating conversation between seller ${sellerId} and buyer ${buyerId}`);
      
      // Check if conversation already exists
      const existingConversation = await executeQuery(
        `SELECT c.id FROM conversations c
         JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
         JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
         WHERE cp1.user_id = ? AND cp2.user_id = ? AND c.type = 'direct'`,
        [sellerId, buyerId]
      );

      if (existingConversation && existingConversation.length > 0) {
        console.log(`📧 Conversation already exists: ${existingConversation[0].id}`);
        return existingConversation[0].id;
      }

      // Create new conversation
      const conversationId = uuidv4();
      await executeQuery(
        'INSERT INTO conversations (id, type, title, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [conversationId, 'direct', subject || `Conversation between seller and buyer`]
      );

      // Add participants
      await executeQuery(
        'INSERT INTO conversation_participants (id, conversation_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, NOW())',
        [uuidv4(), conversationId, sellerId, 'member']
      );

      await executeQuery(
        'INSERT INTO conversation_participants (id, conversation_id, user_id, role, joined_at) VALUES (?, ?, ?, ?, NOW())',
        [uuidv4(), conversationId, buyerId, 'member']
      );

      console.log(`✅ Created new conversation: ${conversationId}`);
      return conversationId;
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
  }

  // Send a message in a conversation
  async sendMessage(conversationId, senderId, content, messageType = 'text', fileUrl = null) {
    try {
      console.log(`📤 Sending message in conversation ${conversationId} from ${senderId}`);
      
      // Verify sender is participant
      const participantCheck = await executeQuery(
        'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
        [conversationId, senderId]
      );

      if (!participantCheck || participantCheck.length === 0) {
        throw new Error('User is not a participant in this conversation');
      }

      // Create message
      const messageId = uuidv4();
      await executeQuery(
        'INSERT INTO messages (id, conversation_id, sender_id, content, message_type, file_url, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())',
        [messageId, conversationId, senderId, content, messageType, fileUrl]
      );

      // Update conversation last_message_at
      await executeQuery(
        'UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = ?',
        [conversationId]
      );

      console.log(`✅ Message sent: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Get seller's conversations with pagination
  async getSellerConversations(sellerId, page = 1, limit = 20, folder = 'inbox') {
    try {
      console.log(`📧 Getting conversations for seller ${sellerId}, page ${page}, folder: ${folder}`);
      
      // Build folder filter
      let folderFilter = `(c.status IS NULL OR c.status != 'archived')`;
      if (folder === 'archived') {
        folderFilter = `c.status = 'archived'`;
      }

      // Use SQL-level pagination and joins to avoid large sorts and correlated subqueries
      const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
      const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
      const offset = (safePage - 1) * safeLimit;

      // Count total
      const countRows = await executeQuery(
        `SELECT COUNT(DISTINCT c.id) as total
         FROM conversations c
         JOIN conversation_participants cp ON c.id = cp.conversation_id
         WHERE cp.user_id = ? AND cp.left_at IS NULL AND ${folderFilter}`,
        [sellerId]
      );
      const total = countRows[0]?.total || 0;

      // Fetch paginated conversations with last message via left join on derived table
      const conversations = await executeQuery(
        `SELECT 
           c.id,
           c.title,
           c.type,
           c.last_message_at,
           c.created_at,
           c.status,
           ou.id AS other_user_id,
           ou.first_name,
           ou.last_name,
           ou.profile_image,
           ou.role AS other_user_role,
           lm.content AS last_message_content,
           lm.sender_id AS last_message_sender_id,
           lm.created_at AS last_message_created_at,
           lm.is_read AS is_read,
           uc.unread_count
         FROM conversations c
         JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ? AND cp.left_at IS NULL
         LEFT JOIN (
           SELECT m1.* FROM messages m1
           JOIN (
             SELECT conversation_id, MAX(created_at) AS max_created
             FROM messages
             GROUP BY conversation_id
           ) mm ON mm.conversation_id = m1.conversation_id AND mm.max_created = m1.created_at
         ) lm ON lm.conversation_id = c.id
         LEFT JOIN (
           SELECT 
             ocp.conversation_id,
             MAX(u.id) AS id,
             MAX(u.first_name) AS first_name,
             MAX(u.last_name) AS last_name,
             MAX(u.profile_image) AS profile_image,
             MAX(u.role) AS role
           FROM conversation_participants ocp
           JOIN users u ON u.id = ocp.user_id
           WHERE ocp.user_id <> ?
           GROUP BY ocp.conversation_id
         ) ou ON ou.conversation_id = c.id
         LEFT JOIN (
           SELECT conversation_id, COUNT(*) AS unread_count
           FROM messages
           WHERE is_read = FALSE AND sender_id <> ?
           GROUP BY conversation_id
         ) uc ON uc.conversation_id = c.id
         WHERE ${folderFilter}
         ORDER BY c.last_message_at DESC
         LIMIT ${safeLimit} OFFSET ${offset}`,
        [sellerId, sellerId, sellerId]
      );

      console.log(`📊 Found ${conversations.length} conversations, total: ${total}`);

      return {
        conversations,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit)
        }
      };
    } catch (error) {
      console.error('❌ Error getting conversations:', error);
      throw new Error(`Failed to get conversations: ${error.message}`);
    }
  }

  // Get messages in a conversation
  async getConversationMessages(conversationId, sellerId, page = 1, limit = 50) {
    try {
      console.log(`💬 Getting messages for conversation ${conversationId}`);
      console.log('🔎 Debug getConversationMessages sellerId:', sellerId, 'type:', typeof sellerId);
      
      // Verify seller is participant (only if sellerId provided)
      if (sellerId) {
        const participantCheck = await executeQuery(
          'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
          [conversationId, sellerId]
        );
        if (!participantCheck || participantCheck.length === 0) {
          throw new Error('User is not a participant in this conversation');
        }
      }

      const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
      const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 50;
      const offset = (safePage - 1) * safeLimit;
      
      const limitNum = Math.max(1, parseInt(safeLimit, 10));
      const offsetNum = Math.max(0, parseInt(offset, 10));

      // MySQL does not allow binding parameters for LIMIT/OFFSET in some contexts
      const messages = await executeQuery(
        `SELECT 
          m.id,
          m.content,
          m.message_type,
          m.file_url,
          m.is_read,
          m.created_at,
          m.sender_id,
          u.first_name,
          u.last_name,
          u.profile_image,
          u.role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC
        LIMIT ${limitNum} OFFSET ${offsetNum}`,
        [conversationId]
      );

      // Mark messages as read (except sender's own messages)
      if (sellerId) {
        await executeQuery(
          'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE',
          [conversationId, sellerId]
        );
      }

      // Get total count
      const countResult = await executeQuery(
        'SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?',
        [conversationId]
      );

      const total = countResult[0]?.total || 0;

      console.log(`📊 Found ${messages.length} messages, total: ${total}`);
      
      return {
        messages: messages || [],
        pagination: {
          page: safePage,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      };
    } catch (error) {
      console.error('❌ Error getting messages:', error);
      throw new Error(`Failed to get messages: ${error.message}`);
    }
  }

  // Mark conversation as read
  async markConversationAsRead(conversationId, userId) {
    try {
      await executeQuery(
        'UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?',
        [conversationId, userId]
      );
      
      console.log(`✅ Marked conversation ${conversationId} as read for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error);
      throw new Error(`Failed to mark conversation as read: ${error.message}`);
    }
  }

  // Archive/unarchive conversation
  async archiveConversation(conversationId, userId, archive = true) {
    try {
      // Verify user is participant
      const participantCheck = await executeQuery(
        'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
        [conversationId, userId]
      );

      if (!participantCheck || participantCheck.length === 0) {
        throw new Error('User is not a participant in this conversation');
      }

      const status = archive ? 'archived' : null;
      await executeQuery(
        'UPDATE conversations SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, conversationId]
      );

      console.log(`✅ ${archive ? 'Archived' : 'Unarchived'} conversation ${conversationId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error archiving conversation:', error);
      throw new Error(`Failed to archive conversation: ${error.message}`);
    }
  }

  // Delete conversation
  async deleteConversation(conversationId, userId) {
    try {
      // Verify user is participant
      const participantCheck = await executeQuery(
        'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
        [conversationId, userId]
      );

      if (!participantCheck || participantCheck.length === 0) {
        throw new Error('User is not a participant in this conversation');
      }

      // Soft delete by marking user as left
      await executeQuery(
        'UPDATE conversation_participants SET left_at = NOW() WHERE conversation_id = ? AND user_id = ?',
        [conversationId, userId]
      );

      console.log(`✅ Deleted conversation ${conversationId} for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  // Get conversation statistics for seller
  async getSellerMessageStats(sellerId) {
    try {
      console.log(`📊 Getting message stats for seller ${sellerId}`);
      
      const stats = await executeQuery(
        `SELECT 
           COUNT(DISTINCT c.id) as total_conversations,
           COUNT(DISTINCT CASE WHEN c.last_message_at >= DATE_SUB(NOW(), INTERVAL 7 DAYS) THEN c.id END) as active_conversations,
           COUNT(DISTINCT CASE WHEN c.status = 'archived' THEN c.id END) as archived_conversations,
           COUNT(DISTINCT CASE WHEN m.sender_id != ? AND m.is_read = FALSE THEN c.id END) as unread_conversations,
           COUNT(DISTINCT CASE WHEN m.sender_id = ? AND m.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOURS) THEN m.id END) as messages_sent_today,
           AVG(CASE WHEN m.sender_id != ? THEN 
             TIMESTAMPDIFF(HOUR, m.created_at, 
               (SELECT MIN(m2.created_at) FROM messages m2 
                WHERE m2.conversation_id = m.conversation_id 
                AND m2.sender_id = ? 
                AND m2.created_at > m.created_at)
             )
           END) as avg_response_time_hours
         FROM conversations c
         JOIN conversation_participants cp ON c.id = cp.conversation_id
         LEFT JOIN messages m ON c.id = m.conversation_id
         WHERE cp.user_id = ? AND cp.left_at IS NULL`,
        [sellerId, sellerId, sellerId, sellerId, sellerId]
      );

      const result = stats[0] || {};
      
      console.log(`📊 Message stats:`, result);
      
      return {
        totalConversations: result.total_conversations || 0,
        activeConversations: result.active_conversations || 0,
        archivedConversations: result.archived_conversations || 0,
        unreadConversations: result.unread_conversations || 0,
        messagesSentToday: result.messages_sent_today || 0,
        avgResponseTimeHours: result.avg_response_time_hours ? Math.round(result.avg_response_time_hours) : null
      };
    } catch (error) {
      console.error('❌ Error getting message stats:', error);
      throw new Error(`Failed to get message stats: ${error.message}`);
    }
  }
}

module.exports = new MessagingService();
