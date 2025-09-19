# Backend Messages API Implementation Guide

## Overview
This document provides comprehensive instructions for implementing the Messages API endpoints to support the admin dashboard's messaging system for drivers and businesses.

## Database Schema

### 1. Messages Table
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    audience ENUM('drivers', 'businesses') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    read_count INT DEFAULT 0,
    total_recipients INT DEFAULT 0,
    INDEX idx_audience (audience),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
);
```

### 2. Message Recipients Table (for tracking read status)
```sql
CREATE TABLE message_recipients (
    id SERIAL PRIMARY KEY,
    message_id INT NOT NULL,
    recipient_id VARCHAR(255) NOT NULL,
    recipient_type ENUM('driver', 'business') NOT NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_recipient (message_id, recipient_id),
    INDEX idx_message_id (message_id),
    INDEX idx_recipient (recipient_id, recipient_type)
);
```

## API Endpoints Implementation

### Base URL
```
https://api.charged.autos/admin/messages
```

### 1. GET /admin/messages
**Description**: Get all messages with optional filtering
**Authentication**: Required (Bearer token)

**Query Parameters**:
- `audience` (optional): Filter by audience ('drivers' or 'businesses')
- `status` (optional): Filter by status ('draft', 'published', 'archived')
- `priority` (optional): Filter by priority ('low', 'medium', 'high', 'urgent')
- `search` (optional): Search in title and content
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response Format**:
```json
{
  "status": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "title": "New Safety Guidelines",
        "content": "Please review the updated safety guidelines...",
        "audience": "drivers",
        "priority": "high",
        "status": "published",
        "created_at": "2025-01-19T10:00:00Z",
        "updated_at": "2025-01-19T10:00:00Z",
        "created_by": "admin_user",
        "updated_by": "admin_user",
        "read_count": 45,
        "total_recipients": 120
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

### 2. GET /admin/messages/:id
**Description**: Get a specific message by ID
**Authentication**: Required (Bearer token)

**Response Format**:
```json
{
  "status": true,
  "data": {
    "id": 1,
    "title": "New Safety Guidelines",
    "content": "Please review the updated safety guidelines...",
    "audience": "drivers",
    "priority": "high",
    "status": "published",
    "created_at": "2025-01-19T10:00:00Z",
    "updated_at": "2025-01-19T10:00:00Z",
    "created_by": "admin_user",
    "updated_by": "admin_user",
    "read_count": 45,
    "total_recipients": 120
  }
}
```

### 3. POST /admin/messages
**Description**: Create a new message
**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "title": "New Safety Guidelines",
  "content": "Please review the updated safety guidelines for all drivers...",
  "audience": "drivers",
  "priority": "high",
  "status": "draft"
}
```

**Response Format**:
```json
{
  "status": true,
  "data": {
    "id": 1,
    "title": "New Safety Guidelines",
    "content": "Please review the updated safety guidelines...",
    "audience": "drivers",
    "priority": "high",
    "status": "draft",
    "created_at": "2025-01-19T10:00:00Z",
    "updated_at": "2025-01-19T10:00:00Z",
    "created_by": "admin_user",
    "updated_by": "admin_user",
    "read_count": 0,
    "total_recipients": 0
  }
}
```

### 4. PUT /admin/messages/:id
**Description**: Update an existing message
**Authentication**: Required (Bearer token)

**Request Body** (all fields optional):
```json
{
  "title": "Updated Safety Guidelines",
  "content": "Updated content...",
  "priority": "urgent",
  "status": "published"
}
```

**Response Format**:
```json
{
  "status": true,
  "data": {
    "id": 1,
    "title": "Updated Safety Guidelines",
    "content": "Updated content...",
    "audience": "drivers",
    "priority": "urgent",
    "status": "published",
    "created_at": "2025-01-19T10:00:00Z",
    "updated_at": "2025-01-19T11:00:00Z",
    "created_by": "admin_user",
    "updated_by": "admin_user",
    "read_count": 45,
    "total_recipients": 120
  }
}
```

### 5. DELETE /admin/messages/:id
**Description**: Delete a message
**Authentication**: Required (Bearer token)

**Response Format**:
```json
{
  "status": true,
  "message": "Message deleted successfully"
}
```

### 6. POST /admin/messages/:id/publish
**Description**: Publish a draft message
**Authentication**: Required (Bearer token)

**Response Format**:
```json
{
  "status": true,
  "data": {
    "id": 1,
    "title": "New Safety Guidelines",
    "content": "Please review the updated safety guidelines...",
    "audience": "drivers",
    "priority": "high",
    "status": "published",
    "created_at": "2025-01-19T10:00:00Z",
    "updated_at": "2025-01-19T11:00:00Z",
    "created_by": "admin_user",
    "updated_by": "admin_user",
    "read_count": 0,
    "total_recipients": 120
  }
}
```

### 7. POST /admin/messages/:id/archive
**Description**: Archive a message
**Authentication**: Required (Bearer token)

**Response Format**:
```json
{
  "status": true,
  "data": {
    "id": 1,
    "title": "New Safety Guidelines",
    "content": "Please review the updated safety guidelines...",
    "audience": "drivers",
    "priority": "high",
    "status": "archived",
    "created_at": "2025-01-19T10:00:00Z",
    "updated_at": "2025-01-19T12:00:00Z",
    "created_by": "admin_user",
    "updated_by": "admin_user",
    "read_count": 45,
    "total_recipients": 120
  }
}
```

### 8. GET /admin/messages/stats
**Description**: Get message statistics
**Authentication**: Required (Bearer token)

**Response Format**:
```json
{
  "status": true,
  "data": {
    "total_messages": 150,
    "published_messages": 120,
    "draft_messages": 25,
    "archived_messages": 5,
    "driver_messages": 100,
    "business_messages": 50,
    "recent_activity": [
      {
        "date": "2025-01-19",
        "messages_created": 5,
        "messages_published": 3
      },
      {
        "date": "2025-01-18",
        "messages_created": 8,
        "messages_published": 6
      }
    ]
  }
}
```

### 9. GET /admin/messages/:id/recipients
**Description**: Get message recipients and read status
**Authentication**: Required (Bearer token)

**Response Format**:
```json
{
  "status": true,
  "data": {
    "total_recipients": 120,
    "read_count": 45,
    "unread_count": 75,
    "recipients": [
      {
        "id": "driver_123",
        "name": "John Doe",
        "email": "john@example.com",
        "read_at": "2025-01-19T10:30:00Z",
        "audience": "drivers"
      },
      {
        "id": "driver_456",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "read_at": null,
        "audience": "drivers"
      }
    ]
  }
}
```

## Controller Implementation

### MessagesController.js
```javascript
const Message = require('../models/Message');
const MessageRecipient = require('../models/MessageRecipient');
const { validationResult } = require('express-validator');

class MessagesController {
  // GET /admin/messages
  async getMessages(req, res) {
    try {
      const {
        audience,
        status,
        priority,
        search,
        page = 1,
        limit = 20
      } = req.query;

      const filters = {};
      if (audience) filters.audience = audience;
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      const searchQuery = search ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      } : {};

      const messages = await Message.find({ ...filters, ...searchQuery })
        .sort({ created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Message.countDocuments({ ...filters, ...searchQuery });

      res.json({
        status: true,
        data: {
          messages,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(total / limit),
            total_items: total,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // GET /admin/messages/:id
  async getMessage(req, res) {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) {
        return res.status(404).json({
          status: false,
          message: 'Message not found'
        });
      }

      res.json({
        status: true,
        data: message
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // POST /admin/messages
  async createMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { title, content, audience, priority, status } = req.body;
      const created_by = req.user.id; // Assuming user ID from auth middleware

      const message = new Message({
        title,
        content,
        audience,
        priority: priority || 'medium',
        status: status || 'draft',
        created_by,
        updated_by: created_by
      });

      await message.save();

      res.status(201).json({
        status: true,
        data: message
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // PUT /admin/messages/:id
  async updateMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const message = await Message.findById(req.params.id);
      if (!message) {
        return res.status(404).json({
          status: false,
          message: 'Message not found'
        });
      }

      const updateData = { ...req.body, updated_by: req.user.id };
      const updatedMessage = await Message.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        status: true,
        data: updatedMessage
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // DELETE /admin/messages/:id
  async deleteMessage(req, res) {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) {
        return res.status(404).json({
          status: false,
          message: 'Message not found'
        });
      }

      await Message.findByIdAndDelete(req.params.id);
      // Also delete related recipients
      await MessageRecipient.deleteMany({ message_id: req.params.id });

      res.json({
        status: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // POST /admin/messages/:id/publish
  async publishMessage(req, res) {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) {
        return res.status(404).json({
          status: false,
          message: 'Message not found'
        });
      }

      // Update status to published
      message.status = 'published';
      message.updated_by = req.user.id;
      await message.save();

      // Create recipients for the message
      await this.createRecipients(message);

      res.json({
        status: true,
        data: message
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // POST /admin/messages/:id/archive
  async archiveMessage(req, res) {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) {
        return res.status(404).json({
          status: false,
          message: 'Message not found'
        });
      }

      message.status = 'archived';
      message.updated_by = req.user.id;
      await message.save();

      res.json({
        status: true,
        data: message
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // GET /admin/messages/stats
  async getMessageStats(req, res) {
    try {
      const totalMessages = await Message.countDocuments();
      const publishedMessages = await Message.countDocuments({ status: 'published' });
      const draftMessages = await Message.countDocuments({ status: 'draft' });
      const archivedMessages = await Message.countDocuments({ status: 'archived' });
      const driverMessages = await Message.countDocuments({ audience: 'drivers' });
      const businessMessages = await Message.countDocuments({ audience: 'businesses' });

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivity = await Message.aggregate([
        {
          $match: {
            created_at: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
            },
            messages_created: { $sum: 1 },
            messages_published: {
              $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] }
            }
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $project: {
            date: "$_id",
            messages_created: 1,
            messages_published: 1,
            _id: 0
          }
        }
      ]);

      res.json({
        status: true,
        data: {
          total_messages: totalMessages,
          published_messages: publishedMessages,
          draft_messages: draftMessages,
          archived_messages: archivedMessages,
          driver_messages: driverMessages,
          business_messages: businessMessages,
          recent_activity: recentActivity
        }
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // GET /admin/messages/:id/recipients
  async getMessageRecipients(req, res) {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) {
        return res.status(404).json({
          status: false,
          message: 'Message not found'
        });
      }

      const recipients = await MessageRecipient.find({ message_id: req.params.id });
      const readCount = recipients.filter(r => r.read_at).length;
      const unreadCount = recipients.length - readCount;

      // Get recipient details (you'll need to join with drivers/businesses tables)
      const recipientDetails = await this.getRecipientDetails(recipients, message.audience);

      res.json({
        status: true,
        data: {
          total_recipients: recipients.length,
          read_count: readCount,
          unread_count: unreadCount,
          recipients: recipientDetails
        }
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Helper method to create recipients when publishing a message
  async createRecipients(message) {
    try {
      let recipients = [];
      
      if (message.audience === 'drivers') {
        // Get all active drivers
        const drivers = await Driver.find({ status: 'active' });
        recipients = drivers.map(driver => ({
          message_id: message._id,
          recipient_id: driver._id.toString(),
          recipient_type: 'driver'
        }));
      } else if (message.audience === 'businesses') {
        // Get all active businesses
        const businesses = await Business.find({ status: 'active' });
        recipients = businesses.map(business => ({
          message_id: message._id,
          recipient_id: business._id.toString(),
          recipient_type: 'business'
        }));
      }

      if (recipients.length > 0) {
        await MessageRecipient.insertMany(recipients);
        
        // Update message with total recipients count
        message.total_recipients = recipients.length;
        await message.save();
      }
    } catch (error) {
      console.error('Error creating recipients:', error);
    }
  }

  // Helper method to get recipient details
  async getRecipientDetails(recipients, audience) {
    try {
      const recipientIds = recipients.map(r => r.recipient_id);
      let details = [];

      if (audience === 'drivers') {
        details = await Driver.find(
          { _id: { $in: recipientIds } },
          { _id: 1, name: 1, email: 1 }
        );
      } else if (audience === 'businesses') {
        details = await Business.find(
          { _id: { $in: recipientIds } },
          { _id: 1, name: 1, email: 1 }
        );
      }

      return recipients.map(recipient => {
        const detail = details.find(d => d._id.toString() === recipient.recipient_id);
        return {
          id: recipient.recipient_id,
          name: detail?.name || 'Unknown',
          email: detail?.email || 'Unknown',
          read_at: recipient.read_at,
          audience: audience
        };
      });
    } catch (error) {
      console.error('Error getting recipient details:', error);
      return [];
    }
  }
}

module.exports = new MessagesController();
```

## Model Implementation

### Message.js
```javascript
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  audience: {
    type: String,
    required: true,
    enum: ['drivers', 'businesses']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  created_by: {
    type: String,
    required: true
  },
  updated_by: {
    type: String,
    required: true
  },
  read_count: {
    type: Number,
    default: 0
  },
  total_recipients: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
```

### MessageRecipient.js
```javascript
const mongoose = require('mongoose');

const messageRecipientSchema = new mongoose.Schema({
  message_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  recipient_id: {
    type: String,
    required: true
  },
  recipient_type: {
    type: String,
    required: true,
    enum: ['driver', 'business']
  },
  read_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure unique recipient per message
messageRecipientSchema.index({ message_id: 1, recipient_id: 1 }, { unique: true });

module.exports = mongoose.model('MessageRecipient', messageRecipientSchema);
```

## Routes Implementation

### messages.js
```javascript
const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/MessagesController');
const auth = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Validation rules
const createMessageValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('audience').isIn(['drivers', 'businesses']).withMessage('Invalid audience'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];

const updateMessageValidation = [
  param('id').isMongoId().withMessage('Invalid message ID'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Invalid status')
];

const messageIdValidation = [
  param('id').isMongoId().withMessage('Invalid message ID')
];

// Apply auth middleware to all routes
router.use(auth);

// GET /admin/messages
router.get('/', messagesController.getMessages);

// GET /admin/messages/:id
router.get('/:id', messageIdValidation, messagesController.getMessage);

// POST /admin/messages
router.post('/', createMessageValidation, messagesController.createMessage);

// PUT /admin/messages/:id
router.put('/:id', updateMessageValidation, messagesController.updateMessage);

// DELETE /admin/messages/:id
router.delete('/:id', messageIdValidation, messagesController.deleteMessage);

// POST /admin/messages/:id/publish
router.post('/:id/publish', messageIdValidation, messagesController.publishMessage);

// POST /admin/messages/:id/archive
router.post('/:id/archive', messageIdValidation, messagesController.archiveMessage);

// GET /admin/messages/stats
router.get('/stats', messagesController.getMessageStats);

// GET /admin/messages/:id/recipients
router.get('/:id/recipients', messageIdValidation, messagesController.getMessageRecipients);

module.exports = router;
```

## Main App Integration

### app.js
```javascript
// Add this to your main app.js file
const messagesRoutes = require('./routes/messages');

// Add the routes
app.use('/admin/messages', messagesRoutes);
```

## Testing Instructions

### 1. Test Message Creation
```bash
curl -X POST https://api.charged.autos/admin/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Message",
    "content": "This is a test message",
    "audience": "drivers",
    "priority": "medium",
    "status": "draft"
  }'
```

### 2. Test Message Retrieval
```bash
curl -X GET https://api.charged.autos/admin/messages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Message Publishing
```bash
curl -X POST https://api.charged.autos/admin/messages/1/publish \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

### Common Error Responses
```json
// Validation Error
{
  "status": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}

// Not Found Error
{
  "status": false,
  "message": "Message not found"
}

// Server Error
{
  "status": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid Bearer token
2. **Authorization**: Ensure only admin users can access these endpoints
3. **Input Validation**: Validate all input data using express-validator
4. **SQL Injection**: Use parameterized queries (MongoDB handles this automatically)
5. **Rate Limiting**: Implement rate limiting for message creation
6. **Content Filtering**: Consider implementing content filtering for inappropriate content

## Performance Considerations

1. **Indexing**: Ensure proper database indexes on frequently queried fields
2. **Pagination**: Implement pagination for large message lists
3. **Caching**: Consider caching frequently accessed messages
4. **Background Jobs**: Use background jobs for creating recipients when publishing messages
5. **Database Optimization**: Optimize queries for better performance

## Deployment Checklist

- [ ] Database tables created
- [ ] Models implemented
- [ ] Controllers implemented
- [ ] Routes configured
- [ ] Authentication middleware applied
- [ ] Validation rules implemented
- [ ] Error handling implemented
- [ ] API endpoints tested
- [ ] Documentation updated
- [ ] Frontend integration tested

## Support

For any questions or issues during implementation, please refer to:
- Frontend implementation in `src/pages/Messages.tsx`
- API integration in `src/API/messages.ts`
- This implementation guide

The Messages API is now ready for implementation and integration with the admin dashboard!
