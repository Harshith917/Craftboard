import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  AlignLeft,
  Camera,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AppLoader from "@/components/common/AppLoader";

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
    return <AppLoader message="Loading your settings..." />;
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-1.5">Account</p>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <div className="h-px bg-border mt-5" />
      </div>

      {/* Profile banner card */}
      <div className="surface rounded-2xl overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-br from-slate-900 via-sky-950 to-sky-800 relative overflow-hidden">
          <div className="absolute -top-10 -right-8 w-48 h-48 bg-sky-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl" />
          {/* Avatar overlapping cover */}
          <div className="absolute -bottom-9 left-6 group">
            <div className="w-[4.5rem] h-[4.5rem] rounded-2xl overflow-hidden bg-card border-4 border-card shadow-xl relative">
              {profile.imageUrl ? (
                <img src={profile.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">{initials}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all cursor-pointer rounded-2xl">
                <Camera size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 pt-12 pb-6 space-y-5">
          <div>
            <p className="text-lg font-bold text-foreground">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-xs text-muted-foreground">Avatar is managed by your account provider</p>
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
              className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent bg-card resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1">{bio.length}/500</p>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile || !canSave}
              className="bg-primary text-white hover:bg-primary/90 shadow-[0_4px_16px_-6px_rgba(14,165,233,0.5)] disabled:opacity-50"
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
