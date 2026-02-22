import type { Route } from "./+types/index";
import { getSupabaseServer } from "@/lib/supabase.server";
import { data, useNavigation } from "react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useDispatch } from "react-redux";
import { setLoading, setUser } from "~/store/slices/authSlice";
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
  const navigation = useNavigation();

  useEffect(() => {
    dispatch(setUser(user));
  }, [dispatch, user]);

  const isLoading = navigation.state === "loading";
  // Set user in redux store (in useEffect to avoid setting state during render)
  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl">
        <ProfileForm />
      </div>
    </DashboardLayout>
  );
}
