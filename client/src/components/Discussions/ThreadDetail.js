import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

const ThreadDetail = () => {
  const { classId, threadId } = useParams();
  const { user } = useAuth();

  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const commentsEndRef = useRef(null);

  useEffect(() => {
    fetchThread();
  }, [classId, threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const fetchThread = async () => {
    try {
      const response = await api.get(
        `/discussions/${classId}/threads/${threadId}`
      );

      setThread(response.data.thread);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Failed to fetch thread:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const response = await api.post(
        `/discussions/${classId}/threads/${threadId}/comments`,
        {
          content: newComment.trim(),
        }
      );

      setComments([...comments, response.data]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (isComment = false, commentId = null) => {
    try {
      const response = await api.post(
        `/discussions/${classId}/threads/${threadId}/upvote`,
        { isComment, commentId }
      );

      if (isComment) {
        setComments(
          comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  upvoted: response.data.upvoted,
                  upvoteCount:
                    (c.upvoteCount || 0) +
                    (response.data.upvoted ? 1 : -1),
                }
              : c
          )
        );
      } else {
        setThread({
          ...thread,
          upvoted: response.data.upvoted,
          upvoteCount:
            (thread.upvoteCount || 0) +
            (response.data.upvoted ? 1 : -1),
        });
      }
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  const handleMarkResolved = async () => {
    if (!window.confirm("Mark this discussion as resolved?")) return;

    try {
      await api.post(
        `/discussions/${classId}/threads/${threadId}/resolve`
      );

      setThread({ ...thread, isResolved: true });
    } catch (error) {
      console.error("Failed to mark resolved:", error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    return "Just now";
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        Loading...
      </div>
    );
  }

  if (!thread) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h3>Thread not found</h3>
        <Link to={`/classes/${classId}`}>Back to Class</Link>
      </div>
    );
  }

  return (
    <div className="thread-detail">

      {/* Back Button */}
      <Link to={`/classes/${classId}`} className="btn btn-outline">
        ← Back to Class
      </Link>

      {/* Thread Header */}
      <div className="card" style={{ marginTop: "20px" }}>
        <h2>{thread.title}</h2>

        <div style={{ marginBottom: "10px" }}>
          <span>👤 {thread.createdByName}</span>{" "}
          <span>📅 {formatTimeAgo(thread.createdAt)}</span>{" "}
          <span>👁️ {thread.views || 0} views</span>
        </div>

        {thread.isResolved && (
          <span style={{ color: "green", fontWeight: "bold" }}>
            ✓ Resolved
          </span>
        )}

        <p style={{ marginTop: "15px" }}>{thread.content}</p>

        <button
          className="btn btn-outline"
          onClick={() => handleUpvote()}
        >
          👍 {thread.upvoteCount || 0}
        </button>

        {!thread.isResolved &&
          (thread.createdBy === user?.id ||
            user?.role === "teacher") && (
            <button
              className="btn btn-success"
              onClick={handleMarkResolved}
            >
              ✓ Mark Resolved
            </button>
          )}
      </div>

      {/* Comments */}
      <div className="card" style={{ marginTop: "30px" }}>
        <h3>Comments ({comments.length})</h3>

        {comments.length > 0 ? (
          <div>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "10px 0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>{comment.createdByName}</strong>

                    {comment.createdByRole === "teacher" && (
                      <span
                        style={{
                          marginLeft: "6px",
                          background: "maroon",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "10px",
                          fontSize: "12px",
                        }}
                      >
                        Teacher
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: "12px" }}>
                    {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>

                <p>{comment.content}</p>

                <button
                  className="btn btn-outline"
                  onClick={() =>
                    handleUpvote(true, comment.id)
                  }
                >
                  👍 {comment.upvoteCount || 0}
                </button>
              </div>
            ))}

            <div ref={commentsEndRef}></div>
          </div>
        ) : (
          <p>No comments yet.</p>
        )}

        {/* Add Comment */}
        <form onSubmit={handleAddComment} style={{ marginTop: "20px" }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
            style={{ width: "100%" }}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ThreadDetail;