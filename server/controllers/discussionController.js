const Discussion = require('../models/Discussion');
const Class = require('../models/Class');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper function to get all enrolled students in a class
const getClassParticipants = async (classId, excludeUserId = null) => {
  const classData = await Class.findById(classId);
  if (!classData) return [];
  
  const participants = [...(classData.students || [])];
  
  // Add teacher if not excluded
  if (classData.teacherId && (!excludeUserId || classData.teacherId !== excludeUserId)) {
    participants.push(classData.teacherId);
  }
  
  // Remove excluded user
  if (excludeUserId) {
    return participants.filter(id => id !== excludeUserId);
  }
  
  return participants;
};

// Modified createThread function
const createThread = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, content, tags } = req.body;

    // Verify user has access to this class
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const isTeacher = classData.teacherId === req.user.id;
    const isEnrolled = classData.students?.includes(req.user.id);
    
    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ error: 'Not authorized to post in this class' });
    }

    // Validate input
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const thread = await Discussion.create(classId, {
      title: title.trim(),
      content: content.trim(),
      createdBy: req.user.id,
      createdByName: req.user.name,
      createdByRole: req.user.role,
      tags: tags || []
    });

    res.status(201).json(thread);
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Failed to create discussion thread' });
  }
};

const getThreads = async (req, res) => {
  try {
    const { classId } = req.params;
    const { limit = 50, search } = req.query;

    // Verify class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    let threads;
    if (search) {
      threads = await Discussion.searchThreads(classId, search);
    } else {
      threads = await Discussion.getThreads(classId, parseInt(limit));
    }

    res.json(threads);
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Failed to fetch discussion threads' });
  }
};

const getThreadById = async (req, res) => {
  try {
    const { classId, threadId } = req.params;

    const thread = await Discussion.getThreadById(classId, threadId);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Get comments for this thread
    const comments = await Discussion.getComments(classId, threadId);
    
    res.json({ thread, comments });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
};

const addComment = async (req, res) => {
  try {
    const { classId, threadId } = req.params;
    const { content } = req.body;

    // Verify thread exists and user has access
    const thread = await Discussion.getThreadById(classId, threadId);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const classData = await Class.findById(classId);
    const isTeacher = classData.teacherId === req.user.id;
    const isEnrolled = classData.students?.includes(req.user.id);
    
    if (!isTeacher && !isEnrolled) {
      return res.status(403).json({ error: 'Not authorized to comment' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = await Discussion.addComment(classId, threadId, {
      content: content.trim(),
      createdBy: req.user.id,
      createdByName: req.user.name,
      createdByRole: req.user.role,  // ✅ Make sure this is being saved
      createdAt: Date.now()
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

const toggleUpvote = async (req, res) => {
  try {
    const { classId, threadId } = req.params;
    const { isComment, commentId } = req.body;

    const result = await Discussion.toggleUpvote(
      classId, 
      threadId, 
      req.user.id, 
      isComment || false, 
      commentId
    );

    res.json({ upvoted: result });
  } catch (error) {
    console.error('Toggle upvote error:', error);
    res.status(500).json({ error: 'Failed to toggle upvote' });
  }
};

const markAsResolved = async (req, res) => {
  try {
    const { classId, threadId } = req.params;

    const classData = await Class.findById(classId);
    const isTeacher = classData.teacherId === req.user.id;

    const result = await Discussion.markAsResolved(classId, threadId, req.user.id, isTeacher);

    if (!result) {
      return res.status(403).json({ error: 'Not authorized to mark as resolved' });
    }

    res.json({ success: true, message: 'Thread marked as resolved' });
  } catch (error) {
    console.error('Mark as resolved error:', error);
    res.status(500).json({ error: 'Failed to mark thread as resolved' });
  }
};

module.exports = {
  createThread,
  getThreads,
  getThreadById,
  addComment,
  toggleUpvote,
  markAsResolved
};