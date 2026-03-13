const { db } = require('../config/firebase');

class Discussion {
  constructor(data) {
    this.id = data.id;
    this.classId = data.classId;
    this.title = data.title;
    this.content = data.content;
    this.createdBy = data.createdBy;
    this.createdByName = data.createdByName;
    this.createdByRole = data.createdByRole;
    this.createdAt = data.createdAt || Date.now();
    this.tags = data.tags || [];
    this.isResolved = data.isResolved || false;
    this.upvotes = data.upvotes || {};
    this.upvoteCount = data.upvoteCount || 0;
    this.views = data.views || 0;
    this.lastActivity = data.lastActivity || Date.now();
  }

  static async create(classId, discussionData) {
    try {
      const ref = db.ref(`discussions/${classId}/threads`).push();
      const id = ref.key;
      
      const discussion = {
        id,
        classId,
        ...discussionData,
        createdAt: Date.now(),
        upvotes: {},
        upvoteCount: 0,
        views: 0,
        lastActivity: Date.now()
      };
      
      await ref.set(discussion);
      
      // Update class metadata
      await db.ref(`discussions/${classId}/metadata`).update({
        lastThread: discussionData.title,
        lastThreadTime: Date.now(),
        threadCount: await this.getThreadCount(classId)
      });
      
      return new Discussion(discussion);
    } catch (error) {
      console.error('Error in Discussion.create:', error);
      throw error;
    }
  }

  static async getThreads(classId, limit = 50) {
    try {
      const snapshot = await db.ref(`discussions/${classId}/threads`)
        .orderByChild('lastActivity')
        .limitToLast(limit)
        .once('value');
      
      const threads = snapshot.val();
      if (!threads) return [];
      
      return Object.keys(threads)
        .map(id => new Discussion({ id, ...threads[id] }))
        .sort((a, b) => b.lastActivity - a.lastActivity); // Most recent first
    } catch (error) {
      console.error('Error in Discussion.getThreads:', error);
      return [];
    }
  }

  static async getThreadById(classId, threadId) {
    try {
      const snapshot = await db.ref(`discussions/${classId}/threads/${threadId}`).once('value');
      const thread = snapshot.val();
      if (!thread) return null;
      
      // Increment view count
      await db.ref(`discussions/${classId}/threads/${threadId}/views`).transaction(current => (current || 0) + 1);
      
      return new Discussion({ id: threadId, ...thread });
    } catch (error) {
      console.error('Error in Discussion.getThreadById:', error);
      return null;
    }
  }

  static async addComment(classId, threadId, commentData) {
    try {
      const ref = db.ref(`discussions/${classId}/threads/${threadId}/comments`).push();
      const id = ref.key;
      
      const comment = {
        id,
        ...commentData,
        createdAt: Date.now(),
        upvotes: {},
        upvoteCount: 0
      };
      
      await ref.set(comment);
      
      // Update thread's last activity
      await db.ref(`discussions/${classId}/threads/${threadId}`).update({
        lastActivity: Date.now()
      });
      
      return comment;
    } catch (error) {
      console.error('Error in Discussion.addComment:', error);
      throw error;
    }
  }

  static async getComments(classId, threadId) {
    try {
      const snapshot = await db.ref(`discussions/${classId}/threads/${threadId}/comments`)
        .orderByChild('createdAt')
        .once('value');
      
      const comments = snapshot.val();
      if (!comments) return [];
      
      return Object.keys(comments)
        .map(id => ({ id, ...comments[id] }))
        .sort((a, b) => a.createdAt - b.createdAt); // Oldest first
    } catch (error) {
      console.error('Error in Discussion.getComments:', error);
      return [];
    }
  }

  static async toggleUpvote(classId, threadId, userId, isComment = false, commentId = null) {
    try {
      let path;
      if (isComment) {
        path = `discussions/${classId}/threads/${threadId}/comments/${commentId}`;
      } else {
        path = `discussions/${classId}/threads/${threadId}`;
      }
      
      const snapshot = await db.ref(path).once('value');
      const item = snapshot.val();
      
      if (!item) return null;
      
      const hasUpvoted = item.upvotes && item.upvotes[userId];
      
      if (hasUpvoted) {
        // Remove upvote
        await db.ref(`${path}/upvotes/${userId}`).remove();
        await db.ref(`${path}/upvoteCount`).transaction(current => Math.max((current || 1) - 1, 0));
      } else {
        // Add upvote
        await db.ref(`${path}/upvotes/${userId}`).set(true);
        await db.ref(`${path}/upvoteCount`).transaction(current => (current || 0) + 1);
      }
      
      return !hasUpvoted; // Returns true if upvoted, false if un-upvoted
    } catch (error) {
      console.error('Error in Discussion.toggleUpvote:', error);
      throw error;
    }
  }

  static async markAsResolved(classId, threadId, userId, isTeacher) {
    try {
      const thread = await this.getThreadById(classId, threadId);
      if (!thread) return false;
      
      // Only the author or teacher can mark as resolved
      if (thread.createdBy !== userId && !isTeacher) {
        return false;
      }
      
      await db.ref(`discussions/${classId}/threads/${threadId}`).update({
        isResolved: true,
        resolvedAt: Date.now(),
        resolvedBy: userId
      });
      
      return true;
    } catch (error) {
      console.error('Error in Discussion.markAsResolved:', error);
      return false;
    }
  }

  static async getThreadCount(classId) {
    try {
      const snapshot = await db.ref(`discussions/${classId}/threads`).once('value');
      return snapshot.numChildren();
    } catch (error) {
      console.error('Error in Discussion.getThreadCount:', error);
      return 0;
    }
  }

  static async searchThreads(classId, searchTerm) {
    try {
      const threads = await this.getThreads(classId, 100);
      const term = searchTerm.toLowerCase();
      
      return threads.filter(thread => 
        thread.title.toLowerCase().includes(term) || 
        thread.content.toLowerCase().includes(term) ||
        (thread.tags && thread.tags.some(tag => tag.toLowerCase().includes(term)))
      );
    } catch (error) {
      console.error('Error in Discussion.searchThreads:', error);
      return [];
    }
  }
}

module.exports = Discussion;