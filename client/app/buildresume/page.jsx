'use client';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { toast } from 'react-toastify';
import { auth } from '@/components/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '@/context/LanguageContext';
import {
  User, Mail, Phone, ShieldCheck, GraduationCap, Briefcase, Sparkles,
  Download, ArrowRight, Lock, Clock, Loader2, TimerReset, Paperclip, Pencil, X, Save
} from 'lucide-react';

export default function ResumeForm() {
  const { t } = useLanguage();
  const router = useRouter();

  // ---- form state ----
  const [formData, setFormData] = useState({
    name: 'Name',
    email: 'Email',
    phone: '8729849847',
    qualifications: 'M.Tech CS',
    experience: '1 month Web dev',
  });
  const [existingFile, setExistingFile] = useState(null); // optional resume upload

  // ---- ref for the resume card we screenshot on download ----
  const helloBoxRef = useRef(null);

  // ---- Download resume function ----
  const download = async () => {
    if (!helloBoxRef.current) return;

    try {
      setLoading(true);

      const html2canvas = (await import('html2canvas-pro')).default;

      const canvas = await html2canvas(helloBoxRef.current, {
        scale: 10,
        backgroundColor: '#ffffff',
      });

      const imageURL = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = imageURL;
      link.download = 'resume-ai.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ---- auth / subscription / resume state ----
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [subLoading, setSubLoading] = useState(true);
  const [hasResume, setHasResume] = useState(null); // null = unknown yet, true/false once checked
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeData, setResumeData] = useState(null);

  // ---- edit-resume state ----
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', qualifications: '', experience: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // ---- OTP / payment flow state ----
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [otpComplete, setOtpComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [otpActive, setOtpActive] = useState(true); // true while the OTP window is still valid
  const [loading, setLoading] = useState(false);

  // ---- auth listener ----
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user || null);
      setAuthLoading(false);
      if (!user) {
        setSubLoading(false);
        setResumeLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ---- OTP countdown ----
  useEffect(() => {
    if (timeLeft <= 0) {
      setOtpActive(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // ---- fetch existing resume (if any) ----
  const fetchExistingResume = async (email) => {
    setResumeLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/get-resume`, { email });
      if (res.data?.FetchedResume) {
        setResumeData(res.data.FetchedResume);
        setHasResume(true);
      } else {
        setHasResume(false);
      }
    } catch (err) {
      // 404 / "no resume yet" also lands here depending on backend status code
      setHasResume(false);
    } finally {
      setResumeLoading(false);
    }
  };

  // ---- check subscription, then check resume ----
  useEffect(() => {
    if (!authUser) return;

    const checkSubscription = async () => {
      setSubLoading(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/status`, {
          params: { uid: authUser.uid },
        });
        const premium = Boolean(res.data.isPremium);
        setIsPremium(premium);
        if (premium) {
          await fetchExistingResume(authUser.email);
        } else {
          setResumeLoading(false);
        }
      } catch (err) {
        console.error(err);
        setIsPremium(false); // fail closed
        setResumeLoading(false);
      } finally {
        setSubLoading(false);
      }
    };

    checkSubscription();
  }, [authUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    const val = e.target.value;
    setOtp(val);
    setOtpComplete(val.length === 6);
  };

  // ---- Edit-resume handlers ----
  const startEditingResume = () => {
    setEditForm({
      name: resumeData?.name || '',
      phone: resumeData?.phone || '',
      qualifications: resumeData?.qualifications || '',
      experience: resumeData?.experience || '',
    });
    setIsEditingResume(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveResumeEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/resume/update`, {
        email: resumeData?.email || authUser?.email,
        ...editForm,
      });
      setResumeData(res.data?.data || { ...resumeData, ...editForm });
      toast.success(t('resume.updateSuccess') || 'Resume updated successfully!');
      setIsEditingResume(false);
    } catch (err) {
      console.log(err);
      toast.error(t('resume.updateFailed') || 'Failed to update resume.');
    } finally {
      setSavingEdit(false);
    }
  };

  // STEP 1: Request OTP from Express Backend
  const handleRequestOTP = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!authUser) return toast.error(t('resume.mustBeLoggedIn') || 'You must be logged in!');

    toast.success(t('resume.otpSentToast') || 'OTP has been sent');
    setOtp('');
    setOtpComplete(false);
    setOtpActive(true);
    setTimeLeft(120);
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/otp/post`, {
        uid: authUser.uid,
        user: authUser.email,
        Uname: formData.name,
      });
      setStep(2);
    } catch (err) {
      console.log(err);
      toast.error(t('resume.serverBusy') || 'Server is busy, try again shortly');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and trigger Razorpay Gateway
  const handleVerifyAndPay = async () => {
    if (!otp) {
      toast.error(t('resume.fillOtp') || 'Fill OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      if (res.status === 404) {
        toast.error(t('resume.otpExpiredToast') || 'OTP expired');
        return;
      }
      if (res.status === 400) {
        toast.error(t('resume.checkOtpToast') || 'Check your OTP');
        return;
      }
      if (res.status === 500) {
        toast.error(t('resume.tryAfterSometime') || 'Try after sometime');
        return;
      }
      if (res.status === 201) {
        toast.success(t('resume.otpVerifiedToast') || 'OTP verified');
        const payRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/paymentReq`, { amount: 50 });
        InitPayment(payRes.data.data);
      }
    } catch (err) {
      toast.error(t('resume.genericError') || 'Error');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const InitPayment = (order) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_TEST_API_KEY,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      handler: async (response) => {
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify`, {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            uid: authUser.uid,
          });

          if (res.status === 200) {
            toast.success(t('resume.paymentSuccess') || 'Payment Success');
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/airesume`, { formData });
            setTimeout(() => router.push('/'), 1000);
          } else {
            toast.error(t('resume.facingError') || 'Facing error, try again');
          }
        } catch (error) {
          console.log(error);
          toast.error(t('resume.facingError') || 'Facing error, try again');
        }
      },
      theme: { color: '#4f46e5' },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  // ---- initial loading gate ----
  if (authLoading || (authUser && subLoading) || (authUser && isPremium && resumeLoading)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ---- THE THREE POSSIBILITIES ----
  return (
    <>
      {!isPremium ? (
        // 1) Not a premium user -> ask them to subscribe
        <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden font-sans mt-40">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center relative">
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> {t('resume.premiumFeature') || 'Premium Feature'}
            </div>
            <h2 className="text-2xl text-white font-bold tracking-tight">{t('resume.title') || 'AI Resume Builder'}</h2>
            <p className="text-indigo-100 text-sm mt-1">
              {t('resume.tagline') || 'Generate a professional template instantly for'} <strike>₹100</strike> ₹50
            </p>
          </div>
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{t('resume.premiumLocked') || 'Premium Feature Locked'}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {t('resume.subscribePrompt') || 'Subscribe to a plan to unlock the AI Resume Builder.'}
              </p>
            </div>
            <button
              onClick={() => router.push('/membership')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-6 rounded-xl font-medium shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all text-sm"
            >
              {t('resume.subscribeToUnlock') || 'Subscribe to Unlock'}
            </button>
          </div>
        </div>
      ) : hasResume ? (
        // 2) Premium user who already created a resume -> show it (with edit option)
        <div>

          <div ref={helloBoxRef} className="max-w-4xl mx-auto my-12 bg-white shadow-xl border border-gray-100 overflow-hidden font-sans mt-40">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{resumeData?.name}</h1>
                  <div className="text-indigo-100 text-sm mt-2 flex flex-wrap gap-4 items-center">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-indigo-200" /> {resumeData?.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-indigo-200" /> {resumeData?.phone}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-stretch md:self-auto">
                  {!isEditingResume && (
                    <button
                      onClick={startEditingResume}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition"
                    >
                      <Pencil className="w-3.5 h-3.5" /> {t('resume.editResume') || 'Edit'}
                    </button>
                  )}
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 justify-center">
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> {t('resume.aiOptimizedBadge') || 'AI Optimized Template'}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {isEditingResume ? (
                // ── Edit form ──
                <div className="space-y-5">
                  <h2 className="text-sm font-bold text-gray-800">{t('resume.editResumeTitle') || 'Edit Your Resume'}</h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('resume.fullName') || 'Full Name'}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" name="name" value={editForm.name} onChange={handleEditChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('resume.phoneNumber') || 'Phone Number'}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" name="phone" value={editForm.phone} onChange={handleEditChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('resume.qualifications') || 'Qualifications'}</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <textarea
                        name="qualifications" value={editForm.qualifications} onChange={handleEditChange} rows={2}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('resume.experienceDetails') || 'Experience Details'}</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <textarea
                        name="experience" value={editForm.experience} onChange={handleEditChange} rows={3}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveResumeEdit}
                      disabled={savingEdit}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition"
                    >
                      {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {savingEdit ? (t('resume.saving') || 'Saving...') : (t('resume.saveChanges') || 'Save Changes')}
                    </button>
                    <button
                      onClick={() => setIsEditingResume(false)}
                      disabled={savingEdit}
                      className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 px-5 rounded-xl font-medium text-sm transition"
                    >
                      <X className="w-4 h-4" /> {t('resume.cancelEdit') || 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                // ── Read-only view ──
                <>
                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <GraduationCap className="w-4 h-4" /> {t('resume.qualificationsSectionTitle') || 'Educational Qualifications'}
                    </h2>
                    <div className="bg-gray-50/60 p-5 rounded-xl border border-gray-100/80">
                      <p className="text-gray-700 text-sm leading-relaxed font-medium">
                        {resumeData?.qualifications}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Briefcase className="w-4 h-4" /> {t('resume.experienceSectionTitle') || 'Professional Experience'}
                    </h2>
                    <div className="bg-gray-50/60 p-5 rounded-xl border border-gray-100/80">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {resumeData?.experience}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 text-xs text-gray-400">
                    <p className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t('resume.generatedSecurely') || 'Generated securely via Intern Area AI Engine'}
                    </p>
                    <button
                      onClick={download}
                      className="w-full sm:w-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                      <Download className="w-4 h-4" /> {t('resume.downloadPdf') || 'Download PDF'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      ) : (
        // 3) Premium user, no resume yet -> create resume flow
        <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden font-sans mt-40">
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center relative">
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> {t('resume.premiumFeature') || 'Premium Feature'}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{t('resume.title') || 'AI Resume Builder'}</h2>
            <p className="text-indigo-100 text-sm mt-1">
              {t('resume.tagline') || 'Generate a professional template instantly for'} <strike>₹100</strike> ₹50
            </p>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-center mb-8 gap-4">
              <div className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-all duration-300 ${step === 1 ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}>
                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">1</span>
                {t('resume.stepDetails') || 'Details'}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
              <div className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-sm transition-all duration-300 ${step === 2 ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}>
                <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">2</span>
                {t('resume.stepVerification') || 'Verification & Pay'}
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('resume.fullName') || 'Full Name'}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('resume.registeredEmail') || 'Registered Email'}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('resume.phoneNumber') || 'Phone Number'}</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('resume.qualifications') || 'Qualifications'}</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea
                      name="qualifications" value={formData.qualifications} onChange={handleChange} rows={2}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all text-sm resize-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('resume.experienceDetails') || 'Experience Details'}</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <textarea
                      name="experience" value={formData.experience} onChange={handleChange} rows={3}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all text-sm resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Optional: existing resume file, if the user already has one to base this on */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t('resume.existingResumeFile') || 'Existing Resume File'} <span className="font-normal text-gray-400">({t('resume.optional') || 'optional'})</span>
                  </label>
                  <div className="relative">
                    <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setExistingFile(e.target.files?.[0] || null)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-600 transition-all text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-600 file:text-xs"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('resume.fileHelperText') || "Attach a current resume if you'd like the AI to build on top of it, otherwise we'll generate one from scratch."}
                  </p>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('resume.sendingOtp') || 'Sending Verification OTP...'}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      {t('resume.verifyEmail') || 'Verify Email via OTP'}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-2 text-indigo-600">
                  <Mail className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{t('resume.checkInbox') || 'Check Your Inbox'}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('resume.otpSentTo') || 'We sent a verification code to'}{' '}
                    <span className="font-semibold text-gray-700">{formData.email}</span>
                  </p>
                </div>

                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    className="w-full tracking-[1em] text-center text-xl font-bold py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-800 transition-all"
                  />
                  <div className="flex items-center justify-center gap-1.5 mt-4 text-gray-500 text-sm">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <p>{minutes}:{seconds.toString().padStart(2, '0')}</p>
                  </div>
                </div>

                <div className="pt-2">
                  {otpActive ? (
                    <button
                      onClick={handleVerifyAndPay}
                      disabled={loading || !otpComplete}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('resume.processing') || 'Processing'}
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          {otpComplete ? (t('resume.verifyAndPay') || 'Verify & Pay ₹50 Securely') : (t('resume.enterOtp') || 'Enter OTP')}
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleRequestOTP}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-medium shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <TimerReset className="w-4 h-4" />
                      {t('resume.resendOtp') || 'Resend OTP'}
                    </button>
                  )}

                  <button
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors underline decoration-dotted"
                  >
                    {t('resume.goBack') || 'Go back and modify details'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}