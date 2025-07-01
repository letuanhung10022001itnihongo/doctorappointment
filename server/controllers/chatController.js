/**
 * Chat Controller
 * 
 * Handles all chat-related operations between doctors and patients
 * including creating chat sessions, retrieving chat history, and
 * managing individual messages.
 */
const { User, Appointment, Chat, Message } = require("../models");
const { Op } = require('sequelize');
const sequelize = require('../db/conn');

/**
 * Get all chats for the authenticated user
 * 
 * @param {Object} req - Express request object with authenticated user ID
 * @param {Object} res - Express response object
 * @returns {Array} List of chat sessions with basic participant info
 */
const getUserChats = async (req, res) => {
  try {
    const userId = req.locals; // From auth middleware
    
    // Find user to determine role
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Find all chats where the user is a participant
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { patientId: userId },
          { doctorId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'firstname', 'lastname', 'email', 'pic']
        },
        {
          model: User, 
          as: 'doctor',
          attributes: ['id', 'firstname', 'lastname', 'email', 'pic'] 
        },
        {
          model: Message,
          limit: 1,
          order: [['createdAt', 'DESC']],
          attributes: ['content', 'createdAt']
        }
      ],
      order: [
        [sequelize.literal('(SELECT MAX(createdAt) FROM Messages WHERE Messages.chatId = Chat.id)'), 'DESC']
      ]
    });
    
    return res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return res.status(500).json({ 
      message: "Unable to retrieve chats", 
      error: error.message
    });
  }
};

/**
 * Get chat messages for a specific chat
 * 
 * @param {Object} req - Express request object with chat ID
 * @param {Object} res - Express response object
 * @returns {Array} List of messages in the chat
 */
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.locals;
    
    // Verify the chat exists and user is a participant
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Check if user is a participant in this chat
    if (chat.patientId !== userId && chat.doctorId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this chat" });
    }
    
    // Get messages with pagination support
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const messages = await Message.findAndCountAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstname', 'lastname', 'pic']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Mark unread messages as read
    await Message.update(
      { isRead: true },
      { 
        where: { 
          chatId,
          senderId: { [Op.ne]: userId },
          isRead: false
        } 
      }
    );
    
    return res.status(200).json({
      messages: messages.rows,
      totalMessages: messages.count,
      totalPages: Math.ceil(messages.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({ 
      message: "Unable to retrieve messages", 
      error: error.message
    });
  }
};

/**
 * Create a new chat session between a doctor and patient
 * based on their appointment
 * 
 * @param {Object} req - Express request object with doctor and patient IDs
 * @param {Object} res - Express response object
 * @returns {Object} The created chat session
 */
const createChat = async (req, res) => {
  try {
    const userId = req.locals;
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
    
    // Find the appointment to get doctor and patient IDs
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Verify user is either the doctor or patient in this appointment
    if (appointment.doctorId !== userId && appointment.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to create this chat" });
    }
    
    // Check if chat already exists for this appointment
    let chat = await Chat.findOne({
      where: { appointmentId }
    });
    
    if (chat) {
      return res.status(200).json({ 
        message: "Chat already exists", 
        chat 
      });
    }
    
    // Create a new chat
    chat = await Chat.create({
      doctorId: appointment.doctorId,
      patientId: appointment.userId,
      appointmentId,
      lastActivity: new Date()
    });
    
    // Create initial system message
    await Message.create({
      chatId: chat.id,
      senderId: null, // System message
      content: "Chat started for your appointment. You can now communicate securely.",
      isRead: false
    });
    
    // Get full chat data with participants
    const fullChat = await Chat.findByPk(chat.id, {
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'firstname', 'lastname', 'email', 'pic']
        },
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'firstname', 'lastname', 'email', 'pic']
        },
        {
          model: Message,
          limit: 1,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    
    return res.status(201).json(fullChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ 
      message: "Unable to create chat", 
      error: error.message
    });
  }
};

/**
 * Send a new message in a chat
 * 
 * @param {Object} req - Express request with message content and chat ID
 * @param {Object} res - Express response object
 * @returns {Object} The created message
 */
const sendMessage = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.locals;
    const { chatId, content } = req.body;
    
    if (!chatId || !content || content.trim() === '') {
      return res.status(400).json({ message: "Chat ID and message content are required" });
    }
    
    // Verify chat exists and user is a participant
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Check if user is a participant
    if (chat.patientId !== userId && chat.doctorId !== userId) {
      return res.status(403).json({ message: "Unauthorized to send message in this chat" });
    }
    
    // Create the message
    const message = await Message.create({
      chatId,
      senderId: userId,
      content,
      isRead: false
    }, { transaction });
    
    // Update chat's last activity timestamp
    await chat.update({ 
      lastActivity: new Date()
    }, { transaction });
    
    await transaction.commit();
    
    // Get message with sender info
    const messageWithSender = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'firstname', 'lastname', 'pic']
      }]
    });
    
    return res.status(201).json(messageWithSender);
  } catch (error) {
    await transaction.rollback();
    console.error("Error sending message:", error);
    return res.status(500).json({ 
      message: "Unable to send message", 
      error: error.message
    });
  }
};

/**
 * Mark messages as read
 * 
 * @param {Object} req - Express request with chat ID
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.locals;
    const { chatId } = req.params;
    
    // Verify chat exists and user is a participant
    const chat = await Chat.findByPk(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    
    // Check if user is a participant
    if (chat.patientId !== userId && chat.doctorId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this chat" });
    }
    
    // Mark messages sent by other user as read
    const [updatedRows] = await Message.update(
      { isRead: true },
      { 
        where: {
          chatId,
          senderId: { [Op.ne]: userId },
          isRead: false
        }
      }
    );
    
    return res.status(200).json({ 
      message: "Messages marked as read",
      count: updatedRows
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({ 
      message: "Unable to mark messages as read", 
      error: error.message
    });
  }
};

/**
 * Get unread message count for authenticated user
 * 
 * @param {Object} req - Express request object with authenticated user ID
 * @param {Object} res - Express response object  
 * @returns {Object} Count of unread messages
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.locals;
    
    // Find all chats where user is a participant
    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { patientId: userId },
          { doctorId: userId }
        ]
      },
      attributes: ['id']
    });
    
    const chatIds = chats.map(chat => chat.id);
    
    // Count unread messages in these chats
    const count = await Message.count({
      where: {
        chatId: { [Op.in]: chatIds },
        senderId: { [Op.ne]: userId },
        isRead: false
      }
    });
    
    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    return res.status(500).json({ 
      message: "Unable to get unread message count", 
      error: error.message
    });
  }
};

module.exports = {
  getUserChats,
  getChatMessages,
  createChat,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount
};