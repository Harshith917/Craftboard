import AppLoader from "@/components/common/AppLoader";

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
}

export default function LoadingOverlay({ isLoading, text }: LoadingOverlayProps) {
  if (!isLoading) return null;
  return <AppLoader fullscreen message={text} />;
}
