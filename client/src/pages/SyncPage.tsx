import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/lib/api";
import LoadingOverlay from "@/components/LoadingOverlay";
import { toast } from "sonner";

export default function SyncPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const createUser = async () => {
      try {
        await api.post("users/sync", {});
      } catch (err) {
        console.error(err);
        toast.error("Failed to sync account.");
      } finally {
        navigate("/dashboard", { replace: true });
      }
    };

    createUser();
  }, [isLoaded, isSignedIn]);

  return <LoadingOverlay isLoading={true} text="Syncing your account..." />;
}
