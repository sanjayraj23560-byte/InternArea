'use client';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ConnectionButton from '@/components/ConnectionButton';
import { toast } from 'react-toastify';
import { ArrowRight, MessageSquare, ThumbsUp, Share2, Loader2 } from 'lucide-react';
import { auth } from '@/components/Firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface Comment {
  user: string;
  username: string;
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  createdAt: string;
  authorName?: string;
  author: {
    _id: string;
    name: string;
    email?: string;
    profilePicture?: string;
  } | null;
  likes: string[];
  comments: Comment[];
  shares: number;
}

function Community_Feed() {
  const { t } = useLanguage();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string | null; displayName: string | null } | null>(null);

  // 🌍 1. Synchronize Auth Session Loop
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({ uid: user.uid, email: user.email, displayName: user.displayName });
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, []);

  // 🌍 2. Safe, Isolated Data Fetching Layer inside useEffect
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/communitypost`);
        if (res.data && Array.isArray(res.data.posts)) {
          setPosts(res.data.posts);
        } else if (Array.isArray(res.data)) {
          setPosts(res.data);
        }
      } catch (error) {
        console.error("Failed to load community feed:", error);
        toast.error("Error connecting to feed database.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 🚀 3. Separated like handler logic safely
  const handleLike = async (postId: string) => {
    if (!currentUser) {
      toast.info(t('home.loginToLike') || "Please log in to like posts");
      return;
    }

    const userId = currentUser.uid;

    setPosts(prev => prev.map(p => {
      if (p._id !== postId) return p;
      const liked = p.likes.includes(userId);
      return { ...p, likes: liked ? p.likes.filter(id => id !== userId) : [...p.likes, userId] };
    }));

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/postres/like/${postId}`, { userId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update like");
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const liked = p.likes.includes(userId);
        return { ...p, likes: liked ? p.likes.filter(id => id !== userId) : [...p.likes, userId] };
      }));
    }
  };

  // 🚀 4. Lifted and isolated out of handleLike cleanly!
  const handleComment = (postId: string) => {
    setActiveCommentPostId(prev => {
      const next = prev === postId ? null : postId;
      setComment('');
      return next;
    });
  };

  const addComment = async (postId: string) => {
    if (!comment.trim()) return;
    if (!currentUser) {
      toast.info(t('home.loginToComment') || "Please log in to comment");
      return;
    }
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/postres/comment/${postId}`, {
        userId: currentUser.uid,
        username: currentUser.displayName || "Anonymous",
        text: comment,
      });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: res.data.comments } : p));
      toast.success(t('home.commentAdded') || "Comment added");
      setComment('');
    } catch (error) {
      console.error(error);
      toast.error(t('home.commentFailed') || "Comment failed");
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/postres/share/${postId}`);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, shares: res.data.sharesCount } : p));
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${window.location.origin}/community/post/${postId}`);
        toast.success(t('home.linkCopied') || "Link copied to clipboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(t('home.failedShare') || "Failed to share post");
    }
  };
  return (
    <div className='mt-30 max-w-5xl mx-auto px-4 mb-20'>
      <section className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">{t('home.publicSpace') || "Public Space"}</span>
            <h2 className="text-xl font-bold text-gray-800 mt-0.5">{t('home.studentEmployerUpdates') || "Student & Employer Updates"}</h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
            {t('home.noPosts') || "No community posts yet. Connect with peers to begin!"}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map(post => {
              const authorName = post.author?.name || post.authorName || "Community Member";
              const isLiked = !!currentUser && post.likes.includes(currentUser.uid);
              return (
                <div key={post._id} className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 flex flex-col gap-4 relative">
                  <div className="absolute right-5 top-5">
                    <ConnectionButton
                      currentUserId={currentUser?.uid}
                      targetUserId={post.author?._id || ''}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm uppercase">
                      {authorName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 capitalize">{authorName}</h4>
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 whitespace-pre-wrap">{post.caption}</p>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex justify-center items-center h-48 w-full mt-auto">
                    {post.mediaType === "video"
                      ? <video src={post.mediaUrl} controls className="h-full w-full object-cover" />
                      : <img src={post.mediaUrl} alt="post" className="h-full w-full object-cover" loading="lazy" />
                    }
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-semibold text-gray-400">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-1.5 transition ${isLiked ? "text-blue-600" : "hover:text-blue-600"}`}
                    >
                      <ThumbsUp size={14} fill={isLiked ? "currentColor" : "none"} /> {post.likes.length}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => handleComment(post._id)}
                        className="flex items-center gap-1.5 hover:text-blue-600 transition">
                        <MessageSquare size={14} /> {post.comments.length}
                      </button>

                      {activeCommentPostId === post._id && (
                        <div className="absolute bg-white border border-gray-200 shadow-xl rounded-2xl top-10 right-0 p-4 w-72 z-50 text-gray-800">
                          <h3 className="font-bold border-b pb-1 mb-2">{t('home.comments') || "Comments"} ({post.comments.length})</h3>

                          <div className="max-h-32 overflow-y-auto space-y-2 mb-2">
                            {post.comments.length === 0 ? (
                              <p className="text-xs text-gray-400">{t('home.noComments') || "No comments yet."}</p>
                            ) : (
                              post.comments.map((c, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className="font-semibold text-gray-700">{c.username}: </span>
                                  <span className="text-gray-500">{c.text}</span>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") addComment(post._id); }}
                              className="flex-1 border border-gray-200 rounded-xl px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                              placeholder={t('home.writeComment') || "Write a comment..."}
                            />
                            <button
                              onClick={() => addComment(post._id)}
                              disabled={!comment.trim()}
                              className={`px-3 py-1 rounded-xl text-xs font-medium transition ${comment.trim()
                                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                              {t('home.add') || "Add"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button onClick={() => handleShare(post._id)} className="flex items-center gap-1.5 hover:text-blue-600 transition">
                      <Share2 size={14} /> {post.shares}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Community_Feed;