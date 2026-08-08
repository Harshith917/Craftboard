"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  User,
  AlignLeft,
  Camera,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function getInitials(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).map((s) => (s as string)[0]).join("").toUpperCase().slice(0, 2);
}

export default function SettingsPage() {
  const { profile, loading, updateProfile } = useProfile();
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({ bio: bio || undefined });
      toast.success("Profile updated");
      setDirty(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-sm text-muted-foreground">Could not load profile.</p>
      </div>
    );
  }

  const initials = getInitials(profile.firstName, profile.lastName);
  const canSave = dirty;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your profile</p>
      </div>

      {/* Profile section */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden mb-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <User size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted border border-border">
                {profile.imageUrl ? (
                  <img src={profile.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground">{initials}</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-2xl flex items-center justify-center transition-all cursor-pointer">
                <Camera size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-xs text-muted-foreground">Avatar is managed by your account provider</p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <AlignLeft size={12} />
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => { setBio(e.target.value); setDirty(true); }}
              placeholder="Tell us about yourself..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent bg-white resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">{bio.length}/500</p>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile || !canSave}
              className="bg-[linear-gradient(110deg,#6d5bf5,#a855f7)] text-white hover:opacity-90 shadow-[0_4px_16px_-6px_rgba(109,91,245,0.6)] disabled:opacity-50"
            >
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {savingProfile ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>


    </div>
  );
}
