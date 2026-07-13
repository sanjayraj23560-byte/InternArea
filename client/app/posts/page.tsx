'use client';

import React, { useState, ChangeEvent, useEffect } from "react";
import { Camera, X, Loader2, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/components/Firebase";
import { useLanguage } from "@/context/LanguageContext"; // 🌍 1. Import translation core

export default function Posts() {
  const { t } = useLanguage(); // 🌍 2. Initialize localized string context lookup

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingLimit, setCheckingLimit] = useState<boolean>(true);
  const [canPost, setCanPost] = useState<boolean>(true);
  const [limitMessage, setLimitMessage] = useState<string>("");

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setCurrentUser(u);
      } else {
        setCurrentUser(null);
        setCheckingLimit(false);
      }
    });

    return () => unsub();
  }, []);

  // Check connection counts and post counts when the user is verified
  useEffect(() => {
    const checkPostLimits = async () => {
      if (!currentUser) return;

      try {
        setCheckingLimit(true);

        // Fetch active connections count
        const networkRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/engagerequest/my-network`,
          { params: { userId: currentUser.uid } }
        );
        const connectionCount = Array.isArray(networkRes.data) ? networkRes.data.length : 0;

        // Determine maximum allowed posts based on tier rules
        let maxAllowedPosts = 0;
        if (connectionCount >= 10) {
          maxAllowedPosts = Infinity;
        } else if (connectionCount > 0) {
          maxAllowedPosts = connectionCount;
        }

        // 0 connections means no publishing access
        if (maxAllowedPosts === 0) {
          setCanPost(false);
          setLimitMessage(
            t('createPost.noConnectionsLimit') ||
            "You need at least 1 connection to upload a post. Connect with peers to unlock posting!"
          );
          setCheckingLimit(false);
          return;
        }

        // Fetch how many posts the user made today
        const statsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/communitypost/today-count`,
          { params: { userId: currentUser.uid } }
        );
        const postsToday = statsRes.data.count || 0;

        if (maxAllowedPosts !== Infinity && postsToday >= maxAllowedPosts) {
          setCanPost(false);

          // Interpolate template parameters dynamically if localized string exists
          const rawMessage = t('createPost.dailyLimitReached');
          if (rawMessage) {
            setLimitMessage(
              rawMessage
                .replace("{count}", String(connectionCount))
                .replace("{max}", String(maxAllowedPosts))
            );
          } else {
            setLimitMessage(
              `Daily limit reached! With ${connectionCount} connections, you can post ${maxAllowedPosts} times per day. Grow your network to 10+ connections for unlimited access!`
            );
          }
        } else {
          setCanPost(true);
        }
      } catch (err) {
        console.error("Error validating upload tier structures:", err);
      } finally {
        setCheckingLimit(false);
      }
    };

    if (currentUser) {
      checkPostLimits();
    }
  }, [currentUser, t]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const RemoveFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    toast.success(t('createPost.fileRemoved') || "File removed");
  };

  const Upload_Post = async () => {
    if (!file) {
      toast.error(t('createPost.selectMediaError') || "Please select an image or video first!");
      return;
    }

    if (!currentUser || !canPost) {
      toast.error(t('createPost.actionRestricted') || "Action restricted by content thresholds.");
      return;
    }

    // FIX: this was previously `if (!description.trim() && "")`, which is
    // always false (anything && "" is falsy), so the actual upload code —
    // which lived inside this if-block — never ran. Every submit fell
    // through to the else and showed "Fill the description" regardless of
    // whether a description was typed. Now it's a proper required-field
    // check that runs before the upload, and the upload itself always runs
    // once validation passes.
    if (!description.trim()) {
      toast.error(t('createPost.descriptionRequired') || "Please add a description before posting");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("postFile", file);
    formData.append("caption", description);
    formData.append("authorId", currentUser.uid);
    formData.append("authorName", currentUser.displayName || "Community Member");
    formData.append("authorEmail", currentUser.email || "");
    formData.append("authorPhoto", currentUser.photoURL || "");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/communitypost`,
        formData
      );

      toast.success(t('createPost.uploadSuccess') || "Post uploaded successfully!");
      setFile(null);
      setPreview(null);
      setDescription("");
      router.push("/");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || t('createPost.uploadFailed') || "Failed to upload post");
    } finally {
      setLoading(false);
    }
  };

  if (checkingLimit) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
        <p className="text-sm font-medium text-gray-500">
          {t('createPost.checkingMilestones') || "Checking your network milestones..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex mt-30 items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {t('createPost.createPostTitle') || "Create Post"}
        </h1>

        {!canPost ? (
          <div className="border border-amber-100 bg-amber-50/50 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-full">
              <Lock size={24} />
            </div>
            <h3 className="font-bold text-gray-800">
              {t('createPost.thresholdRestricted') || "Posting Threshold Restricted"}
            </h3>
            <p className="text-sm text-gray-600 max-w-md leading-relaxed">{limitMessage}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-2 bg-white border font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 text-xs transition text-gray-800"
            >
              {t('createPost.backToHome') || "Back to Home"}
            </button>
          </div>
        ) : (
          <>
            <label className="border-2 border-dashed border-gray-300 rounded-xl min-h-62.5 flex flex-col justify-center items-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition relative overflow-hidden group">
              {preview && file ? (
                file.type.startsWith("video/") ? (
                  <video
                    src={preview}
                    controls
                    className="max-h-72 w-full rounded-lg object-contain"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-72 w-full rounded-lg object-contain"
                  />
                )
              ) : (
                <div className="flex flex-col items-center p-6 text-center">
                  <Camera size={32} className="text-gray-400" />
                  <p className="text-lg font-semibold text-gray-700 mt-4">
                    {t('createPost.dragDropText') || "Drag & drop image or video"}
                  </p>
                  <p className="text-gray-400 mt-1 text-sm">
                    {t('createPost.browseText') || "or click to browse files"}
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <textarea
              className="mt-5 border border-gray-300 rounded-xl p-3 w-full h-24 outline-none resize-none text-gray-700 text-sm focus:border-blue-400 transition"
              placeholder={t('createPost.placeholderText') || "Share an update..."}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            {file && (
              <div className="mt-4 p-3 bg-gray-50 border rounded-xl flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>

                <button type="button" onClick={RemoveFile} className="text-gray-500 hover:text-red-500 transition">
                  <X size={18} />
                </button>
              </div>
            )}

            <button
              disabled={!file || !description.trim() || loading}
              onClick={Upload_Post}
              className="w-full mt-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:text-gray-400 transition"
            >
              {loading ? (t('createPost.actionUploading') || "Uploading Post...") : (t('createPost.actionUpload') || "Upload Post")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}