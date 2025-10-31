# Postman Testing Guide - Seller Messages API

## Base URL
```
http://localhost:3001/api/seller
```

## Authentication
All endpoints require authentication. Add the JWT token in the **Headers**:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 1. Get Conversations List (Inbox/Sent/Archived)

**GET** `/messages`

### Query Parameters:
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `folder` (optional, default: 'inbox') - Filter: `inbox`, `sent`, or `archived`
- `search` (optional) - Search in subject, buyer name, or message content
- `category` (optional, default: 'all') - Filter by category: `inquiry`, `offer`, `complaint`, `support`, `all`

### Example Request:
```
GET http://localhost:3001/api/seller/messages?page=1&limit=10&folder=inbox&category=all
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conversation-uuid",
        "subject": "Interested in Toyota Camry",
        "buyer": {
          "id": "buyer-uuid",
          "name": "John Smith",
          "avatar": "/uploads/users/avatar.jpg"
        },
        "lastMessage": {
          "id": "message-uuid",
          "content": "Hi! I saw your listing...",
          "senderId": "buyer-uuid",
          "isFromSeller": false,
          "timestamp": "2024-01-15T10:30:00Z",
          "read": false
        },
        "unreadCount": 2,
        "category": "inquiry",
        "priority": "high",
        "archived": false,
        "createdAt": "2024-01-15T08:00:00Z",
        "lastMessageAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

## 2. Get Conversation Messages (Thread)

**GET** `/messages/:conversationId`

Automatically marks all messages in the conversation as read when viewed.

### URL Parameters:
- `conversationId` - The conversation UUID

### Example Request:
```
GET http://localhost:3001/api/seller/messages/123e4567-e89b-12d3-a456-426614174000
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conversation-uuid",
      "subject": "Interested in Toyota Camry",
      "buyer": {
        "id": "buyer-uuid"
      }
    },
    "messages": [
      {
        "id": "message-uuid-1",
        "sender": {
          "id": "buyer-uuid",
          "name": "John Smith",
          "avatar": "/uploads/users/avatar.jpg",
          "type": "buyer"
        },
        "content": "Hi! I saw your Toyota Camry listing...",
        "messageType": "text",
        "fileUrl": null,
        "read": true,
        "category": "inquiry",
        "priority": "high",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "id": "message-uuid-2",
        "sender": {
          "id": "seller-user-uuid",
          "name": "You",
          "avatar": "",
          "type": "seller"
        },
        "content": "Yes, it's still available!",
        "messageType": "text",
        "fileUrl": null,
        "read": true,
        "category": "support",
        "priority": "normal",
        "timestamp": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

---

## 3. Send Message (Reply)

**POST** `/messages/:conversationId`

### URL Parameters:
- `conversationId` - The conversation UUID

### Body (JSON):
```json
{
  "content": "Thank you for your interest! The car is still available.",
  "messageType": "text",
  "fileUrl": null,
  "category": "support",
  "priority": "normal"
}
```

### Example Request:
```
POST http://localhost:3001/api/seller/messages/123e4567-e89b-12d3-a456-426614174000
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "id": "new-message-uuid",
    "sender": {
      "id": "seller-user-uuid",
      "name": "You",
      "avatar": "",
      "type": "seller"
    },
    "content": "Thank you for your interest! The car is still available.",
    "messageType": "text",
    "fileUrl": null,
    "category": "support",
    "priority": "normal",
    "timestamp": "2024-01-15T12:00:00Z"
  },
  "message": "Message sent successfully"
}
```

---

## 4. Mark Messages as Read

**PATCH** `/messages/:conversationId/read`

### URL Parameters:
- `conversationId` - The conversation UUID

### Body (JSON - Optional):
```json
{
  "messageIds": ["message-uuid-1", "message-uuid-2"]
}
```
If `messageIds` is not provided, all unread messages in the conversation will be marked as read.

### Example Request:
```
PATCH http://localhost:3001/api/seller/messages/123e4567-e89b-12d3-a456-426614174000/read
```

### Expected Response:
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## 5. Archive/Unarchive Conversation

**PATCH** `/messages/:conversationId/archive`

### URL Parameters:
- `conversationId` - The conversation UUID

### Body (JSON):
```json
{
  "archived": true
}
```
Set `archived: false` to unarchive.

### Example Request:
```
PATCH http://localhost:3001/api/seller/messages/123e4567-e89b-12d3-a456-426614174000/archive
```

### Expected Response:
```json
{
  "success": true,
  "message": "Conversation archived"
}
```

---

## 6. Delete Messages

**DELETE** `/messages/:conversationId`

### URL Parameters:
- `conversationId` - The conversation UUID

### Body (JSON):
```json
{
  "messageIds": ["message-uuid-1", "message-uuid-2"]
}
```

**Note:** Sellers can only delete their own messages (messages they sent).

### Example Request:
```
DELETE http://localhost:3001/api/seller/messages/123e4567-e89b-12d3-a456-426614174000
```

### Expected Response:
```json
{
  "success": true,
  "message": "Messages deleted successfully"
}
```

---

## Testing Checklist

### Before Testing:
1. ✅ Make sure the server is running (`npm run dev` in `server/` directory)
2. ✅ Run the migration SQL file: `server/db/migrations/2025-10-15_seller_updates.sql`
3. ✅ Get a valid JWT token by logging in as a seller:
   ```
   POST http://localhost:3001/api/auth/login
   Body: { "identifier": "seller@example.com", "password": "password123" }
   ```
4. ✅ Add the token to all requests in the `Authorization` header

### Recommended Test Flow:
1. **Get Conversations (Inbox)** - Check if you get empty array or existing conversations
2. **Get Conversation Messages** - If you have conversations, test getting messages
3. **Send Message** - Reply to a conversation (you may need to create a conversation first manually in DB or through buyer flow)
4. **Mark as Read** - Test marking messages as read
5. **Archive Conversation** - Test archiving a conversation
6. **Get Conversations (Archived)** - Verify archived conversations appear
7. **Unarchive Conversation** - Test unarchiving
8. **Delete Messages** - Test deleting seller's own messages

### Error Cases to Test:
- ❌ Invalid conversation ID → Should return 404/400
- ❌ Missing authentication token → Should return 401
- ❌ Empty message content → Should return 400
- ❌ Conversation belongs to different seller → Should return 403/404
- ❌ Invalid folder parameter → Should default to 'inbox'

---

## Common Issues & Solutions

### Issue: "Conversation not found or unauthorized"
- **Cause:** The conversation doesn't exist or belongs to a different seller
- **Solution:** Make sure you're using a valid conversation ID that belongs to your seller account

### Issue: "Seller profile not found"
- **Cause:** The user account doesn't have a seller profile
- **Solution:** Create a seller profile first using `/api/seller/profile` PUT endpoint

### Issue: Empty conversations array
- **Cause:** No conversations exist for this seller
- **Solution:** This is expected if you're starting fresh. You may need to create conversations manually in the database or through the buyer messaging flow.

### Issue: Migration errors
- **Cause:** Conversations table might already exist or syntax issues
- **Solution:** Check if `conversations` table exists using `node scripts/get-tables.js`. If it exists, remove the CREATE TABLE part from the migration or use `ALTER TABLE` instead.

