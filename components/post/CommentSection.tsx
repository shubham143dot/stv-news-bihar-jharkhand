// components/post/CommentSection.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Send, Trash2, MessageCircle } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  subscribeToComments,
  addComment,
  deleteComment,
  Comment,
} from "@/lib/firebase/comments";
import { timeAgo } from "@/lib/utils/formatDate";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { user, isAdmin, signIn } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Threaded comments logic
  const threadedComments = useMemo(() => {
    const mainComments = comments.filter(c => !c.parentId);
    const replies = comments.filter(c => c.parentId);
    
    const result: Comment[] = [];
    mainComments.forEach(main => {
      result.push(main);
      const childReplies = replies.filter(r => r.parentId === main.id);
      result.push(...childReplies);
    });
    return result;
  }, [comments]);

  // Real-time listener
  useEffect(() => {
    const unsubscribe = subscribeToComments(postId, setComments);
    return unsubscribe;
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text.trim()) return;

    setSubmitting(true);
    try {
      await addComment(
        postId,
        user.uid,
        user.displayName || "Anonymous",
        user.photoURL || "",
        text.trim(),
        replyTo?.id,
        isAdmin,
        replyTo?.displayName
      );
      setText("");
      setReplyTo(null);
    } catch (err) {
      console.error("Comment failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("इस कमेंट को डिलीट करें?")) return;
    try {
      await deleteComment(commentId, postId);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-red-600" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Input */}
      <div ref={formRef} className="mb-8 scroll-mt-20">
        {user ? (
          <div>
            {replyTo && (
              <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-t-xl border-x border-t border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-red-600 rounded-full" />
                  <span className="text-xs font-bold text-red-600">
                    Replying to {replyTo.displayName}
                  </span>
                </div>
                <button 
                  onClick={() => setReplyTo(null)}
                  className="text-xs text-gray-400 hover:text-red-600 font-bold p-1"
                >
                  Cancel
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className={`${replyTo ? 'rounded-b-xl border-x border-b border-red-100 dark:border-red-900/30' : 'rounded-xl shadow-sm border border-gray-100 dark:border-gray-800'} bg-white dark:bg-gray-900 p-3 transition-all duration-300`}>
              <div className="flex gap-3">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "You"}
                    width={40}
                    height={40}
                    className="rounded-full flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white text-sm font-bold">
                      {user.displayName?.[0] || "U"}
                    </span>
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={replyTo ? "अपना जवाब लिखें..." : "अपना कमेंट लिखें..."}
                    rows={2}
                    maxLength={500}
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim() || submitting}
                    className="flex-shrink-0 w-10 h-10 mt-auto bg-red-600 hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                    aria-label="Submit comment"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 text-center backdrop-blur-sm">
            <p className="text-sm text-gray-800 dark:text-gray-300 mb-4 font-bold">
              कमेंट करने के लिए लॉगिन करें
            </p>
            <button
              onClick={signIn}
              className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-red-600/20 active:scale-95"
            >
              Google से Login करें
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {threadedComments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 font-medium font-hindi">पहले कमेंट करने वाले बनें!</p>
          </div>
        ) : (
          threadedComments.map((comment) => (
            <div
              key={comment.id}
              className={`flex gap-3 p-4 rounded-xl border transition-all duration-300 group ${
                comment.isAdmin 
                  ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 ring-1 ring-red-50 dark:ring-red-900/20 shadow-sm' 
                  : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-md'
              } ${comment.parentId ? 'ml-8 sm:ml-12 scale-[0.98]' : ''}`}
            >
              {comment.photoURL ? (
                <Image
                  src={comment.photoURL}
                  alt={comment.displayName}
                  width={comment.parentId ? 32 : 40}
                  height={comment.parentId ? 32 : 40}
                  className="rounded-full flex-shrink-0 shadow-sm border border-gray-100 dark:border-gray-800"
                />
              ) : (
                <div className={`${comment.parentId ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <span className="text-white text-xs font-bold">
                    {comment.displayName[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {comment.displayName}
                    </span>
                    {comment.isAdmin && (
                      <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        Publisher
                      </span>
                    )}
                    {comment.replyToName && (
                      <span className="text-[11px] text-gray-400 font-medium">
                        replied to <span className="text-red-600 font-bold">@{comment.replyToName}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 font-medium">
                      {timeAgo(comment.timestamp)}
                    </span>
                    {(user?.uid === comment.userId || isAdmin) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100 break-words leading-relaxed font-medium">
                  {comment.comment}
                </p>
                {isAdmin && !comment.parentId && (
                  <button
                    onClick={() => handleReply(comment)}
                    className="mt-2 text-xs font-black text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 uppercase tracking-tighter"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
