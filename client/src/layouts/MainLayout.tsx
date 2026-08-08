import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Sidebar from "@/components/common/Navbar";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { MobileBlocker } from "@/components/common/MobileBlocker";
import { useCollaboratorUpdates } from "@/hooks/useCollaboratorUpdates";
import { NotificationProvider } from "@/components/notifications/notification-context";

export default function MainLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useCollaboratorUpdates();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;

  return (
    <MobileBlocker>
      <NotificationProvider>
        <div className="flex h-screen overflow-hidden bg-app">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-6 py-8">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </NotificationProvider>
    </MobileBlocker>
  );
}
