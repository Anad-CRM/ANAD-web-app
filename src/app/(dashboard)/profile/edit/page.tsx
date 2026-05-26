"use client";
import ProfileForm from "@/modules/profile/components/ProfileForm";
import { Text } from "@/core/components/ui/Text";
import { BackButton } from "@/core/components/ui/BackButton";
import { COLORS } from "@/core/components/theme/colors";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const router = useRouter();

  return (
    <div className="p-4 sm:p-8 pb-32 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <BackButton onClick={() => router.push('/profile')} />
          <div className="h-6 w-px mx-1" style={{ backgroundColor: COLORS.border }}></div>
          <Text as="h1" size="2xl" weight="bold" className="text-gray-900">Edit Profile</Text>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
