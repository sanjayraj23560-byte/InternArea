'use client'
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, Building2, Tag, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

// TypeScript Interfaces for DB Shape Security
interface Internship {
  _id: string
  title: string
  company: string
  location: string
  stipend: string
  duration: string
  category: string
}

interface Job {
  _id: string
  title: string
  company: string
  location: string
  salary: string
  experience: string
  category: string
}

const slider = [
  { title: "Find Your Dream Internship", subtitle: "Explore 1000+ internships across top companies", bg: "from-blue-600 to-indigo-500", emoji: "🚀" },
  { title: "Find Your Dream Job", subtitle: "Explore 1000+ jobs across top companies", bg: "from-emerald-500 to-teal-400", emoji: "🔥" },
  { title: "Learn While You Earn", subtitle: "Paid opportunities with leading companies", bg: "from-violet-600 to-purple-400", emoji: "💸" },
  { title: "Top Companies Are Hiring", subtitle: "Google, Amazon, Adobe & 500+ more", bg: "from-amber-500 to-orange-400", emoji: "💼" },
];

const categories = ["Big Brands", "MBA", "Work from home", "Part time", "Engineering", "Media", "Design", "Data Science"];

export default function Home() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("");
  const [current, setCurrent] = useState(0);

  // ── Database States ──
  const [internships, setInternships] = useState<Internship[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch Live Data ──
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch from both endpoints concurrently
        const [internshipsRes, jobsRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/getintern/getInternhsips`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/getjob`)
        ]);

        if (Array.isArray(internshipsRes.data)) {
          // Limit to 3 items for a clean homepage look
          setInternships(internshipsRes.data.slice(0, 3));
        }
        if (Array.isArray(jobsRes.data)) {
          setJobs(jobsRes.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load homepage resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // ── Client-side filtering logic ──
  const filteredInternships = internships.filter(i => !activeCategory || i.category === activeCategory);
  const filteredJobs = jobs.filter(j => !activeCategory || j.category === activeCategory);

  // Carousel slider effect
  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % slider.length), 3500);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      <main className="max-w-5xl mx-auto px-4 pt-40 max-md:pt-72 pb-16 space-y-14">

        {/* ── Slider ── */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          {slider.map((slide, i) => (
            <div key={i} className={`bg-gradient-to-r ${slide.bg} ${i === current ? "block" : "hidden"}`}>
              <div className="flex flex-col items-center justify-center text-center px-8 py-20 gap-4">
                <span className="text-6xl">{slide.emoji}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{slide.title}</h2>
                <p className="text-white/80 text-base md:text-lg max-w-md">{slide.subtitle}</p>
                <button
                  onClick={() => router.push('/jobs')}
                  className="mt-2 bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-2xl hover:scale-105 transition text-sm">
                  Explore Now →
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

        {/* ── Categories ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Browse by Category</h2>
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
                Clear ✕
              </button>
            )}
          </div>
        </section>

        {/* Global Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <>
            {/* ── Internships Section ── */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Actively Hiring</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-0.5">Internships</h2>
                </div>
                <button onClick={() => router.push('/internship')} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </button>
              </div>

              {filteredInternships.length === 0 ? (
                <p className="text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl p-6 text-center">No internships found for this category right now.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredInternships.map((item) => (
                    <div key={item._id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3">
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
                        View Details <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Jobs Section ── */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Full Time</span>
                  <h2 className="text-xl font-bold text-gray-800 mt-0.5">Jobs</h2>
                </div>
                <button onClick={() => router.push('/jobs')} className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </button>
              </div>

              {filteredJobs.length === 0 ? (
                <p className="text-gray-400 text-sm bg-white border border-gray-100 rounded-2xl p-6 text-center">No full-time roles found for this category right now.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredJobs.map((job) => (
                    <div key={job._id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3">
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
                        View Details <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}