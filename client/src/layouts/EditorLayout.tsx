import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { NotificationProvider } from "@/components/notifications/notification-context";
import { MobileBlocker } from "@/components/common/MobileBlocker";

export default function EditorLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;

  return (
    <MobileBlocker>
      <NotificationProvider>
        <Outlet />
      </NotificationProvider>
    </MobileBlocker>
  );
}
