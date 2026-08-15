import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { NotificationProvider } from "@/components/notifications/notification-context";

export default function EditorLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;

  return (
    <NotificationProvider>
      <Outlet />
    </NotificationProvider>
  );
}
