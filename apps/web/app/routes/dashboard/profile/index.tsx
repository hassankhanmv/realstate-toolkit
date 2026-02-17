import type { Route } from "./+types/index";
import { getSupabaseServer } from "@/lib/supabase.server";
import { data } from "react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useDispatch } from "react-redux";
import { setUser } from "~/store/slices/authSlice";
import { useEffect } from "react";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data(null, { status: 302, headers: { Location: "/login" } });
  }

  return data({ user }, { headers });
};

export function meta() {
  return [
    { title: "Profile - UAE Estates" },
    {
      name: "description",
      content: "Manage your profile and account settings",
    },
  ];
}

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return null;
  const { user } = loaderData;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setUser(user));
  }, [dispatch, user]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <ProfileForm />
      </div>
    </DashboardLayout>
  );
}
