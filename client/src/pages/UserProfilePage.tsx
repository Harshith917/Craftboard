import { useParams } from "react-router-dom";
import { ProfileView } from "@/components/profile/ProfileView";

export default function UserProfilePage() {
  const { userId } = useParams();
  return <ProfileView userId={userId as string} />;
}
