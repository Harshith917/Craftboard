
import { useState } from "react";
import { Link2, Copy, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useInvitations } from "@/hooks/useInvitations";
import { toast } from "sonner";

interface InviteLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function InviteLinkDialog({ open, onOpenChange, projectId }: InviteLinkDialogProps) {
  const { generateLink } = useInvitations();
  const [role, setRole] = useState("editor");
  const [oneTime, setOneTime] = useState(false);
  const [expiresIn, setExpiresIn] = useState(48);
  const [generating, setGenerating] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const inv = await generateLink(projectId, role, oneTime, expiresIn);
      const baseUrl = window.location.origin;
      setLink(`${baseUrl}/invitations/${inv.token}`);
      toast.success("Invite link created");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to generate link");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create invite link</DialogTitle>
          <DialogDescription>Generate a shareable link to invite people to this project.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-card"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Expires in</label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-card"
              >
                <option value={1}>1 hour</option>
                <option value={24}>24 hours</option>
                <option value={48}>2 days</option>
                <option value={168}>7 days</option>
                <option value={720}>30 days</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={oneTime}
              onChange={(e) => setOneTime(e.target.checked)}
              className="h-4 w-4 rounded border-border text-foreground focus:ring-ring"
            />
            <div>
              <span className="text-sm font-medium text-foreground">One-time use</span>
              <p className="text-xs text-muted-foreground">Link expires after the first person accepts</p>
            </div>
          </label>

          {link && (
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 border border-border">
              <Link2 size={14} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                readOnly
                value={link}
                className="flex-1 text-xs bg-transparent border-none focus:outline-none text-foreground truncate"
              />
              <button
                onClick={handleCopy}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors shrink-0"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!link && (
            <Button variant="default" className="flex-1" onClick={handleGenerate} disabled={generating}>
              {generating ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
              {generating ? "Generating..." : "Generate link"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
