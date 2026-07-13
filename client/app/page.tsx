'use client'
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, Building2, Tag, Calendar, ArrowRight, Loader2, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { auth } from "../components/Firebase";
import { useLanguage } from "@/context/LanguageContext";
import { onAuthStateChanged } from "firebase/auth";
import ConnectionButton from "../components/ConnectionButton";
import PendingRequests from "../components/pendingRequests";
import { toast } from "react-toastify";

interface Internship {
  _id: string;
  title: string;
  company: string;
  location: string;
  stipend: string;
  duration: string;
  category: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  category: string;
}

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

const categories = ["Big Brands", "MBA", "Work from home", "Part time", "Engineering", "Media", "Design", "Data Science"];

export default function Home() {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("");
  const [current, setCurrent] = useState(0);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [currentUser, setCurrentUser] = useState<{ uid: string; email: string | null; displayName: string | null } | null>(null);

  // 🌍 Dynamic Multi-Language Localized Slider Array
  const slider = [
    { title: t('home.slide1Title') || "Find Your Dream Internship", subtitle: t('home.slide1Subtitle') || "Explore 1000+ internships across top companies", bg: "from-blue-600 to-indigo-500", emoji: "🚀" },
    { title: t('home.slide2Title') || "Find Your Dream Job", subtitle: t('home.slide2Subtitle') || "Explore 1000+ jobs across top companies", bg: "from-emerald-500 to-teal-400", emoji: "🔥" },
    { title: t('home.slide3Title') || "Learn While You Earn", subtitle: t('home.slide3Subtitle') || "Paid opportunities with leading companies", bg: "from-violet-600 to-purple-400", emoji: "💸" },
    { title: t('home.slide4Title') || "Top Companies Are Hiring", subtitle: t('home.slide4Subtitle') || "Google, Amazon, Adobe & 500+ more", bg: "from-amber-500 to-orange-400", emoji: "💼" },
  ];

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setCurrentUser({ uid: u.uid, email: u.email, displayName: u.displayName });
      else setCurrentUser(null);
    });
    return () => unsub();
  }, []);

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

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [internshipsRes, jobsRes, postsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/getintern/getInternhsips`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/getjob`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/communitypost`)
        ]);
        if (Array.isArray(internshipsRes.data)) setInternships(internshipsRes.data.slice(0, 3));
        if (Array.isArray(jobsRes.data)) setJobs(jobsRes.data.slice(0, 3));
        if (postsRes.data && Array.isArray(postsRes.data.posts)) {
          const normalized: Post[] = postsRes.data.posts.slice(0, 2).map((p: any) => ({
            ...p,
            likes: Array.isArray(p.likes) ? p.likes : [],
            comments: Array.isArray(p.comments) ? p.comments : [],
            shares: typeof p.shares === "number" ? p.shares : 0,
          }));
          setPosts(normalized);
        }
      } catch (error) {
        console.error("Failed to load homepage resources:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const filteredInternships = internships.filter(i => !activeCategory || i.category === activeCategory);
  const filteredJobs = jobs.filter(j => !activeCategory || j.category === activeCategory);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % slider.length), 3500);
    return () => clearInterval(timer);
  }, [slider.length]);

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 pt-30 max-md:pt-35 pb-16 space-y-14">
        {/* Slider Carousel Header Block */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          {slider.map((slide, i) => (
            <div key={i} className={`bg-gradient-to-r ${slide.bg} ${i === current ? "block" : "hidden"}`}>
              <div className="flex flex-col items-center justify-center text-center px-8 py-20 gap-4">
                <span className="text-6xl">{slide.emoji}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{slide.title}</h2>
                <p className="text-white/80 text-base md:text-lg max-w-md">{slide.subtitle}</p>
                <button
                  onClick={() => router.push('/jobs')}
                  className="mt-2 bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-2xl hover:scale-105 transition text-sm"
                >
                  {t('home.exploreNow') || "Explore Now"} →
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => setCurrent(p => (p - 1 + slider.length) % slider.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrent(p => (p + 1) % slider.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slider.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? "bg-white w-6" : "bg-white/50 w-2"}`} />
            ))}
          </div>
        </div>

        <PendingRequests currentUserId={currentUser?.uid} />

        {/* Categories Selection Bar */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('home.browseCategory') || "Browse by Category"}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${activeCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 bg-white"
                  }`}>
                {cat}
              </button>
            ))}
            {activeCategory && (
              <button onClick={() => setActiveCategory("")}
                className="px-4 py-1.5 rounded-full text-sm font-medium border border-red-400 text-red-500 hover:bg-red-50 transition">
                {t('home.clear') || "Clear"} ✕
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <>
            {/* Internships Deck Block */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{t('home.activelyHiring') || "Actively Hiring"}</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-0.5">{t('nav.internships') || "Internships"}</h2>
                </div>
                <button onClick={() => router.push('/internship')} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                  {t('home.viewAll') || "View all"} <ArrowRight size={14} />
                </button>
              </div>
              {filteredInternships.length === 0 ? (
                <p className="text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl p-6 text-center">
                  {t('home.noInternships') || "No internships found for this category."}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredInternships.map(item => (
                    <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1">{item.title}</h3>
                        <p className="text-blue-600 font-medium text-sm mt-0.5">{item.stipend}</p>
                      </div>
                      <div className="space-y-1.5 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><Building2 size={14} className="text-gray-400 shrink-0" />{item.company}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500 shrink-0" />{item.location}</div>
                        <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400 shrink-0" />{item.duration}</div>
                        <div className="flex items-center gap-2"><Tag size={14} className="text-gray-400 shrink-0" />{item.category}</div>
                      </div>
                      <button onClick={() => router.push(`/intern/${item._id}`)}
                        className="mt-auto w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-medium text-sm py-2 rounded-xl transition">
                        {t('home.viewDetails') || "View Details"} <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Jobs Deck Block */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">{t('home.fullTime') || "Full Time"}</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-0.5">{t('nav.jobs') || "Jobs"}</h2>
                </div>
                <button onClick={() => router.push('/jobs')} className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1">
                  {t('home.viewAll') || "View all"} <ArrowRight size={14} />
                </button>
              </div>
              {filteredJobs.length === 0 ? (
                <p className="text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl p-6 text-center">
                  {t('home.noJobs') || "No jobs found for this category."}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredJobs.map(job => (
                    <div key={job._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-1">{job.title}</h3>
                        <p className="text-emerald-600 font-medium text-sm mt-0.5">{job.salary}</p>
                      </div>
                      <div className="space-y-1.5 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><Building2 size={14} className="text-gray-400 shrink-0" />{job.company}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-500 shrink-0" />{job.location}</div>
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400 shrink-0" />{job.experience}</div>
                        <div className="flex items-center gap-2"><Tag size={14} className="text-gray-400 shrink-0" />{job.category}</div>
                      </div>
                      <button onClick={() => router.push(`/job/${job._id}`)}
                        className="mt-auto w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 font-medium text-sm py-2 rounded-xl transition">
                        {t('home.viewDetails') || "View Details"} <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Community Social Updates Feed */}
            <section className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">{t('home.publicSpace') || "Public Space"}</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-0.5">{t('home.studentEmployerUpdates') || "Student & Employer Updates"}</h2>
                </div>
                <button onClick={() => router.push('/community')} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                  {t('home.goToFeed') || "Go to Community Feed"} <ArrowRight size={14} />
                </button>
              </div>

              {posts.length === 0 ? (
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

                        {/* Social Interaction Toolbar Footer Panel Actions */}
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
          </>
        )}
      </main>
    </>
  );
} 