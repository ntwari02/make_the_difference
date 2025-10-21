const messagingService = require('../services/messaging.service');

class MessagingController {
  // Get seller's conversations with pagination and folder filtering
  async getSellerConversations(req, res) {
    try {
      const { sellerId } = req.params;
      const { page = 1, limit = 20, folder = 'inbox' } = req.query;

      console.log(`📧 Getting conversations for seller ${sellerId}, folder: ${folder}`);

      const result = await messagingService.getSellerConversations(
        sellerId,
        parseInt(page),
        parseInt(limit),
        folder
      );

      res.json({
        success: true,
        data: {
          conversations: result.conversations,
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error('❌ Error in getSellerConversations:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get messages in a specific conversation
  async getConversationMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { sellerId } = req.query;
      const { page = 1, limit = 50 } = req.query;

      console.log(`💬 Getting messages for conversation ${conversationId}`);

      const result = await messagingService.getConversationMessages(
        conversationId,
        // Prefer authenticated user id; fallback to query param for compatibility
        (req.user && req.user.id) ? req.user.id : sellerId,
        parseInt(page),
        parseInt(limit)
      );

      res.json({
        success: true,
        data: {
          messages: result.messages,
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error('❌ Error in getConversationMessages:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Send a message in a conversation
  async sendMessage(req, res) {
    try {
      const { conversationId } = req.params;
      const { content, messageType = 'text', fileUrl } = req.body;
      const senderId = req.user.id;

      console.log(`📤 Sending message in conversation ${conversationId}`);

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      const messageId = await messagingService.sendMessage(
        conversationId,
        senderId,
        content.trim(),
        messageType,
        fileUrl
      );

      res.json({
        success: true,
        data: {
          messageId,
          message: 'Message sent successfully'
        }
      });
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
      const status = /not a participant/i.test(error.message) ? 403 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create a new conversation between seller and buyer
  async createConversation(req, res) {
    try {
      const { buyerId, subject } = req.body;
      const sellerId = req.user.id;

      console.log(`📧 Creating conversation between seller ${sellerId} and buyer ${buyerId}`);

      if (!buyerId) {
        return res.status(400).json({
          success: false,
          message: 'Buyer ID is required'
        });
      }

      const conversationId = await messagingService.createConversation(
        sellerId,
        buyerId,
        subject
      );

      res.json({
        success: true,
        data: {
          conversationId,
          message: 'Conversation created successfully'
        }
      });
    } catch (error) {
      console.error('❌ Error in createConversation:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark conversation as read
  async markConversationAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      console.log(`✅ Marking conversation ${conversationId} as read`);

      await messagingService.markConversationAsRead(conversationId, userId);

      res.json({
        success: true,
        message: 'Conversation marked as read'
      });
    } catch (error) {
      console.error('❌ Error in markConversationAsRead:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Archive/unarchive conversation
  async archiveConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const { archive = true } = req.body;
      const userId = req.user.id;

      console.log(`${archive ? '📁 Archiving' : '📂 Unarchiving'} conversation ${conversationId}`);

      await messagingService.archiveConversation(conversationId, userId, archive);

      res.json({
        success: true,
        message: `Conversation ${archive ? 'archived' : 'unarchived'} successfully`
      });
    } catch (error) {
      console.error('❌ Error in archiveConversation:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete conversation
  async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      console.log(`🗑️ Deleting conversation ${conversationId}`);

      await messagingService.deleteConversation(conversationId, userId);

      res.json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error in deleteConversation:', error);
      const status = /not a participant/i.test(error.message) ? 403 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get seller message statistics
  async getSellerMessageStats(req, res) {
    try {
      const { sellerId } = req.params;

      console.log(`📊 Getting message stats for seller ${sellerId}`);

      const stats = await messagingService.getSellerMessageStats(sellerId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error in getSellerMessageStats:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Bulk operations on conversations
  async bulkConversationAction(req, res) {
    try {
      const { conversationIds, action } = req.body;
      const userId = req.user.id;

      console.log(`🔄 Bulk ${action} on ${conversationIds.length} conversations`);

      if (!conversationIds || !Array.isArray(conversationIds) || conversationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Conversation IDs array is required'
        });
      }

      const results = [];
      for (const conversationId of conversationIds) {
        try {
          switch (action) {
            case 'mark_read':
              await messagingService.markConversationAsRead(conversationId, userId);
              break;
            case 'archive':
              await messagingService.archiveConversation(conversationId, userId, true);
              break;
            case 'unarchive':
              await messagingService.archiveConversation(conversationId, userId, false);
              break;
            case 'delete':
              await messagingService.deleteConversation(conversationId, userId);
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }
          results.push({ conversationId, success: true });
        } catch (error) {
          results.push({ conversationId, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      res.json({
        success: true,
        data: {
          action,
          totalProcessed: conversationIds.length,
          successCount,
          failCount,
          results
        }
      });
    } catch (error) {
      console.error('❌ Error in bulkConversationAction:', error);
      const status = /not a participant/i.test(error.message) ? 403 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new MessagingController();
