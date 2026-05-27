"use client";

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { ProgressBar } from "@/components/ui/progress-bar";
import { FeedbackForm } from "@/components/ui/feedback-form";
import { NotificationSettings } from "@/components/ui/notification-settings";
import { SupportCard } from "@/components/ui/support-card";
import {
  LogOut,
  Pencil,
  Camera,
  X,
  Check,
  Upload,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { logout } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PWAInstallGuide } from "@/components/ui/pwa-install-guide";
import Image from "next/image";

// XP required per level (100 XP per level) - same as header
const XP_PER_LEVEL = 100;

function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function calculateLevelProgress(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export default function ProfilePage() {
  const utils = trpc.useUtils();
  const { data: user } = trpc.user.getById.useQuery();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.getById.invalidate();
      setIsEditingName(false);
      setIsEditingAvatar(false);
      setPreviewUrl(null);
    },
  });

  const deleteAccount = trpc.user.deleteAccount.useMutation({
    onSuccess: () => {
      window.location.href = "/auth/signin";
    },
  });

  // Calculate level from XP to ensure consistency with header
  const currentXp = user?.xp ?? 0;
  const currentLevel = calculateLevel(currentXp);
  const xpProgress = calculateLevelProgress(currentXp);

  const handleEditName = () => {
    setEditedName(user?.name || "");
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateProfile.mutate({ name: editedName.trim() });
    }
  };

  const handleEditAvatar = () => {
    setPreviewUrl(user?.avatar?.imageUrl || null);
    setUploadError(null);
    setIsEditingAvatar(true);
  };

  // Resize image to max 256x256 before upload
  const resizeImage = (file: File, maxSize: number = 256): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to resize image"));
              }
            },
            "image/jpeg",
            0.85,
          );
        } else {
          reject(new Error("Canvas context not available"));
        }
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadError(null);
    setIsUploading(true);

    try {
      // Resize image before upload
      const resizedBlob = await resizeImage(file);
      const resizedFile = new File(
        [resizedBlob],
        file.name.replace(/\.[^.]+$/, ".jpg"),
        {
          type: "image/jpeg",
        },
      );

      const formData = new FormData();
      formData.append("file", resizedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Update profile with new avatar URL
      updateProfile.mutate({ avatarUrl: data.url });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
      setPreviewUrl(user?.avatar?.imageUrl || null);
    } finally {
      setIsUploading(false);
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleRemoveAvatar = () => {
    updateProfile.mutate({ avatarUrl: null });
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-surface rounded-xl p-6 border border-border text-center">
        {/* Editable Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative inline-block">
            <div
              className="w-28 h-28 rounded-full bg-linear-to-br from-purple-500 to-blue-500
                flex items-center justify-center text-white font-bold text-2xl
                ring-2 ring-white dark:ring-gray-800 shadow-lg relative overflow-hidden"
            >
              {user?.avatar?.imageUrl ? (
                <Image
                  src={user.avatar.imageUrl}
                  alt={user?.name || "Avatar"}
                  fill
                  sizes="112px"
                  className="rounded-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            {/* Level badge */}
            <div
              className="absolute -bottom-1 -right-1 w-10 h-10
                rounded-full bg-yellow-400 
                flex items-center justify-center 
                font-bold text-yellow-900 text-base
                ring-2 ring-white dark:ring-gray-800"
            >
              {currentLevel}
            </div>
            {/* Edit avatar button */}
            <button
              onClick={handleEditAvatar}
              className="absolute top-0 right-0 w-8 h-8 rounded-full bg-primary text-white
                flex items-center justify-center shadow-md hover:bg-primary-hover transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editable Name */}
        <div className="flex items-center justify-center gap-2 mb-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                className="text-2xl font-bold text-text-primary bg-transparent border-b-2 border-primary outline-none text-center w-48"
                placeholder="Your name"
              />
              <button
                onClick={handleSaveName}
                disabled={updateProfile.isPending}
                className="p-1.5 rounded-full bg-success text-white hover:bg-success/80"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="p-1.5 rounded-full bg-surface-secondary text-text-muted hover:bg-surface-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-text-primary">
                {user?.name || "Adventurer"}
              </h2>
              <button
                onClick={handleEditName}
                className="p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <p className="text-text-muted mb-4">{user?.email}</p>

        {/* Level Progress */}
        <div className="max-w-xs mx-auto">
          <ProgressBar
            value={xpProgress}
            max={100}
            label={`Level ${currentLevel}`}
            size="md"
            color="purple"
          />
          <p className="text-sm text-text-muted mt-2">
            {100 - xpProgress} XP to Level {currentLevel + 1}
          </p>
        </div>
      </div>

      {/* Avatar Upload Dialog */}
      {isEditingAvatar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-4 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary">
                Edit Profile Picture
              </h3>
              <button
                onClick={() => {
                  setIsEditingAvatar(false);
                  setPreviewUrl(null);
                  setUploadError(null);
                }}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-secondary flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-text-muted">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            {uploadError && (
              <p className="text-sm text-error text-center">{uploadError}</p>
            )}

            {/* Upload Button */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border text-text-secondary hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                <span>{isUploading ? "Uploading..." : "Choose Image"}</span>
              </button>
              <p className="text-xs text-text-muted text-center">
                JPEG, PNG, GIF, or WebP. Max 5MB.
              </p>
            </div>

            {/* Remove Avatar Button */}
            {user?.avatar?.imageUrl && (
              <button
                onClick={handleRemoveAvatar}
                disabled={updateProfile.isPending}
                className="w-full px-4 py-2 rounded-lg text-error hover:bg-error/10 transition-colors disabled:opacity-50"
              >
                Remove Profile Picture
              </button>
            )}

            <button
              onClick={() => {
                setIsEditingAvatar(false);
                setPreviewUrl(null);
                setUploadError(null);
              }}
              className="w-full px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover"
            >
              Close
            </button>
          </div>
        </div>
      )}


      {/* Support Card */}
      <SupportCard buyMeCoffeeUrl="https://buymeacoffee.com/lifequestpro" />

      {/* Settings */}
      <div className="bg-surface rounded-xl border border-border divide-y divide-border">
        <ThemeToggle />
        <NotificationSettings />
        <PWAInstallGuide />
        <button
          onClick={() => setShowFeedbackForm(true)}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-hover transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-text-muted" />
          <div className="flex-1">
            <span className="text-text-primary">Send Feedback</span>
            <p className="text-xs text-text-muted">Help us improve LifeQuest</p>
          </div>
        </button>
        <form action={logout} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-hover transition-colors text-error"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-surface rounded-xl border border-error/20 overflow-hidden">
        <div className="p-4 border-b border-error/20 bg-error/5">
          <h3 className="font-semibold text-error">Danger Zone</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-text-muted mb-4">
            Once you delete your account, there is no going back. All your
            quests, progress, and achievements will be permanently deleted.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg border border-error text-error hover:bg-error hover:text-white transition-colors text-sm font-medium"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-text-primary text-lg">
              Delete Account
            </h3>
            <p className="text-sm text-text-muted">
              This action cannot be undone. Type{" "}
              <span className="font-mono font-semibold text-error">DELETE</span>{" "}
              to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmText === "DELETE") {
                    deleteAccount.mutate();
                  }
                }}
                disabled={
                  deleteConfirmText !== "DELETE" || deleteAccount.isPending
                }
                className="flex-1 px-4 py-2 rounded-lg bg-error text-white hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteAccount.isPending ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
      />
    </div>
  );
}
