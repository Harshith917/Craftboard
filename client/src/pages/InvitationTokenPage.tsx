import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Loader2, CheckCircle2, XCircle, LogIn, User, X, Clock, Shield, Users } from "lucide-react";
import AppLoader from "@/components/common/AppLoader";
import { Button } from "@/components/ui/button";
import { useInvitations, ProjectInvitation } from "@/hooks/useInvitations";

export default function InvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { getByToken, accept, decline } = useInvitations();

  const [invitation, setInvitation] = useState<ProjectInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [successProject, setSuccessProject] = useState<string | null>(null);

  const fetchInvitation = useCallback(async () => {
    try {
      const data = await getByToken(token as string);
      setInvitation(data);
      setError(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid or expired invitation link";
      if (msg.toLowerCase().includes("already")) {
        setAccepted(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [token, getByToken]);

  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const result = await accept(token as string);
      setAccepted(true);
      setSuccessProject(result.projectName);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      await decline(token as string);
      setDeclined(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to decline invitation");
    } finally {
      setDeclining(false);
    }
  };

  const status = invitation?.status;

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <AppLoader message="Loading invitation..." />
      </div>
    );
  }

  if (declined) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <X size={24} className="text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-1">Invitation declined</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You have declined the invitation to join <span className="font-medium text-foreground">{invitation?.project?.name}</span>.
            The project owner has been notified.
          </p>
          <Button variant="default" className="bg-primary text-white hover:bg-primary/90" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-1">
            {successProject ? "You're in!" : "Already a member"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {successProject
              ? `You have joined ${successProject}`
              : "You are already a member of this project."}
          </p>
          <Button variant="default" className="bg-primary text-white hover:bg-primary/90" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <XCircle size={24} className="text-rose-400" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-1">Invitation invalid</h1>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <Button variant="default" className="bg-primary text-white hover:bg-primary/90" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <LogIn size={24} className="text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-1">Sign in to accept</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You need to sign in before accepting this invitation.
          </p>
          <Button variant="default" className="bg-primary text-white hover:bg-primary/90" onClick={() => navigate(`/sign-in?redirect_url=${encodeURIComponent(`/invitations/${token}`)}`)}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  const isExpired = status === "expired";
  const isCancelled = status === "cancelled";

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full overflow-hidden">
        {/* Project header */}
        <div className="relative h-32 bg-gradient-to-br from-slate-900 via-sky-950 to-sky-800 flex items-end p-6 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-sky-500/20 blur-2xl" />
          <div className="absolute -bottom-16 left-1/4 w-40 h-40 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-300 mb-1">Invitation</p>
            <h1 className="text-xl font-bold text-white relative">{invitation?.project?.name}</h1>
          </div>
        </div>

        <div className="p-6">
          {/* Invited by */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
              {invitation?.invitedBy?.imageUrl ? (
                <img src={invitation.invitedBy.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User size={18} className="text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {invitation?.invitedBy
                  ? [invitation.invitedBy.firstName, invitation.invitedBy.lastName].filter(Boolean).join(" ") ||
                    invitation.invitedBy.email
                  : "Someone"}
              </p>
              <p className="text-xs text-muted-foreground">invited you to join</p>
            </div>
          </div>

          {/* Project description */}
          {invitation?.project?.description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{invitation.project.description}</p>
          )}

          {/* Project stats */}
          {invitation?.project && "memberCount" in invitation.project && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {(invitation.project as any).memberCount || "—"} members
              </span>
            </div>
          )}

          {/* Message */}
          {invitation?.message && (
            <div className="bg-muted/60 rounded-xl px-3 py-2.5 mb-4">
              <p className="text-xs text-muted-foreground italic">
                &ldquo;{invitation.message}&rdquo;
              </p>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <span className="capitalize bg-primary/5 text-primary px-2 py-0.5 rounded-md flex items-center gap-1">
              <Shield size={10} />
              {invitation?.role}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {invitation?.expiresAt
                ? isExpired
                  ? "Expired"
                  : `Expires ${new Date(invitation.expiresAt).toLocaleDateString()}`
                : ""}
            </span>
          </div>

          {/* Terminal error */}
          {error && (
            <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-xs text-rose-600">{error}</p>
            </div>
          )}

          {/* Expired / Cancelled state */}
          {isExpired && (
            <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs text-amber-600">This invitation has expired. Ask the project owner to send a new one.</p>
            </div>
          )}
          {isCancelled && (
            <div className="mb-4 px-3 py-2 bg-muted border border-border rounded-xl">
              <p className="text-xs text-muted-foreground">This invitation was cancelled.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDecline}
              disabled={accepting || declining || !!isExpired || !!isCancelled}
            >
              {declining ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              {declining ? "Declining..." : "Decline"}
            </Button>
            <Button
              variant="default"
              className="flex-1 bg-primary text-white hover:bg-primary/90"
              onClick={handleAccept}
              disabled={accepting || declining || !!isExpired || !!isCancelled}
            >
              {accepting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {accepting ? "Accepting..." : "Accept invitation"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
