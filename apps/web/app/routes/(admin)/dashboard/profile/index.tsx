import type { Route } from "./+types/index";
import { data, useNavigation } from "react-router";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useDispatch } from "react-redux";
import { setUser } from "~/store/slices/authSlice";
import { setLoading } from "~/store/slices/uiSlice";
import { useEffect } from "react";
import { requireAuth } from "~/lib/auth.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user, headers } = await requireAuth(request);

  if (!user) {
    return data(null, { status: 302, headers: { Location: "/login" } });
  }

  return data({ user }, { headers });
};

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Profile | Real Estate Toolkit" },
    {
      name: "description",
      content: "Manage your profile and account settings",
    },
  ];
};

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  if (!loaderData) return null;
  const { user } = loaderData;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);
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
