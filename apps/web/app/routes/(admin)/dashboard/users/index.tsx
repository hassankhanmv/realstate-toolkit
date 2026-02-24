import { useState, useMemo, useCallback, useEffect } from "react";
import type { Route } from "./+types/index";
import { data, useNavigate, useNavigation, useRevalidator } from "react-router";
import { useTranslation } from "react-i18next";
import { getSupabaseServer } from "@/lib/supabase.server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import {
  GlobalDataTable,
  type HeaderConfig,
} from "~/components/global/table/GlobalDataTable";
import type { ContextMenuOption } from "~/components/global/table/ContextMenu";
import {
  Plus,
  Users,
  Shield,
  UserX,
  Pencil,
  Trash2,
  Maximize2,
  Minimize2,
  ExternalLink,
  RefreshCw,
  LockKeyhole,
  Loader2,
} from "lucide-react";
import { UserForm } from "@/components/dashboard/users/UserForm";
import { toast } from "sonner";
import { DashboardLayout } from "~/components/layouts/DashboardLayout";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatTimeAgo } from "@/lib/utils";
import type { Profile } from "@repo/supabase";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "~/store/slices/authSlice";
import { setLoading, setTableLoading } from "~/store/slices/uiSlice";
import StatCard from "~/components/global/StatCard";
import type { RootState } from "~/store/store";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data(
      { error: "Unauthorized", users: [] as Profile[], currentUser: null },
      { status: 401, headers },
    );
  }

  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { createClient } = await import("@supabase/supabase-js");
    const adminAuthClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );

    const { data: authUsers } = await adminAuthClient.auth.admin.listUsers();
    const emailMap = new Map(
      authUsers?.users.map((u) => [u.id, u.email]) || [],
    );

    const usersWithEmail =
      (profiles as any[])?.map((p) => ({
        ...p,
        email: emailMap.get(p.id) || null,
      })) ?? [];

    return data(
      { users: usersWithEmail, error: null, currentUser: user },
      { headers },
    );
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return data(
      { users: [] as Profile[], error: "Failed to fetch", currentUser: user },
      { status: 500, headers },
    );
  }
};

export const action = async (_args: Route.ActionArgs) => null;

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Users Management | Real Estate Toolkit" },
    { name: "description", content: "Manage team members and user roles." },
  ];
};

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  const { users, error, currentUser } = loaderData;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    (Profile & { email?: string }) | undefined
  >();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [userActionTarget, setUserActionTarget] = useState<
    (Profile & { email?: string }) | null
  >(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disableNote, setDisableNote] = useState("");

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u: any) => !u.is_disabled).length;
    const restricted = total - active;
    return { total, active, restricted };
  }, [users]);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Set user in redux store (in useEffect to avoid setting state during render)
  useEffect(() => {
    if (currentUser) {
      dispatch(setUser(currentUser));
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (revalidator.state === "loading" || navigation.state === "loading") {
      dispatch(setTableLoading(true));
    } else {
      dispatch(setTableLoading(false));
    }
  }, [revalidator.state, navigation.state, dispatch]);

  // Headers configuration
  const headers: HeaderConfig<any>[] = [
    {
      accessorKey: "full_name",
      text: "users.headers.name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              {row.full_name}
              {row.role === "admin" && (
                <Shield className="h-3 w-3 text-amber-500" />
              )}
            </span>
            {row.company_name && (
              <span className="text-xs text-muted-foreground">
                {row.company_name}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      type: "action",
      text: "",
      align: "end",
      menuSide: "bottom",
      menuAlign: "end",
    },
    {
      accessorKey: "email",
      text: "users.headers.email",
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.email || "—"}
        </span>
      ),
    },
    {
      accessorKey: "role",
      text: "users.headers.role",
      sortable: true,
      cell: (row) => (
        <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">
          {row.role
            ? t(`users.roles.${row.role}`, { defaultValue: row.role })
            : t("users.roles.agent")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      text: "users.headers.status",
      cell: (row) => (
        <Badge
          variant={row.is_disabled ? "destructive" : "secondary"}
          className="font-medium text-[10px] uppercase"
        >
          {row.is_disabled
            ? t("users.status.disabled")
            : t("users.status.active")}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      text: "users.headers.created",
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
          {row.created_at ? formatTimeAgo(row.created_at) : "—"}
        </span>
      ),
    },
  ];

  const handleEdit = (userReq: Profile & { email?: string }) => {
    setSelectedUser(userReq);
    setModalOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelectedUser(undefined);
      revalidator.revalidate();
    }
  };

  const resetDialogStates = () => {
    setNewPassword("");
    setConfirmPassword("");
    setDisableNote("");
  };

  const handleDisablePrompt = (userReq: Profile & { email?: string }) => {
    setUserActionTarget(userReq);
    setShowConfirmDialog(true);
  };

  const confirmDisable = async () => {
    if (!userActionTarget) return;
    dispatch(setLoading(true));
    try {
      const res = await fetch(`/api/users/${userActionTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: disableNote,
          data: JSON.stringify({
            full_name: userActionTarget.full_name,
            role: userActionTarget.role,
            email: userActionTarget.email,
            is_disabled: !userActionTarget.is_disabled,
            permissions: userActionTarget.permissions,
            notifications: userActionTarget.notifications,
          }),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(
        t(
          userActionTarget.is_disabled
            ? "users.success.activated"
            : "users.success.restricted",
          {
            name: userActionTarget.full_name,
            defaultValue: "User status updated.",
          },
        ),
      );
      revalidator.revalidate();
    } catch (e: any) {
      toast.error(e.message || "Failed to update user status");
    } finally {
      dispatch(setLoading(false));
      setShowConfirmDialog(false);
      setUserActionTarget(null);
      resetDialogStates();
    }
  };

  const handleDeletePrompt = (userReq: Profile & { email?: string }) => {
    setUserActionTarget(userReq);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userActionTarget) return;
    dispatch(setLoading(true));
    try {
      const res = await fetch(`/api/users/${userActionTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(
        `User ${userActionTarget.full_name} was deleted successfully.`,
      );
      revalidator.revalidate();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete user");
    } finally {
      dispatch(setLoading(false));
      setShowDeleteDialog(false);
      setUserActionTarget(null);
      resetDialogStates();
    }
  };

  const handleResetPasswordPrompt = (userReq: Profile & { email?: string }) => {
    setUserActionTarget(userReq);
    setShowResetDialog(true);
  };

  const confirmResetPassword = async () => {
    if (!userActionTarget) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    dispatch(setLoading(true));
    try {
      const res = await fetch(`/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userActionTarget.id,
          email: userActionTarget.email,
          newPassword,
          websiteUrl: window.location.origin,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(
        `Password reset successfully and email sent to ${userActionTarget.email}`,
      );
    } catch (e: any) {
      toast.error(e.message || "Failed to initiate password reset");
    } finally {
      dispatch(setLoading(false));
      setShowResetDialog(false);
      setUserActionTarget(null);
      resetDialogStates();
    }
  };

  // Row mapper
  const tableData = users.map((userObj: any) => ({
    ...userObj,
    id: userObj.id,
    original: userObj,
  }));

  const contextMenuOptions = useCallback(
    (rowOriginal: any): ContextMenuOption[] => [
      {
        id: 1,
        title: "users.actions.edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: () => handleEdit(rowOriginal),
      },
      {
        id: 2,
        title: "users.actions.view_details",
        icon: <ExternalLink className="h-4 w-4" />,
        onClick: () => navigate(`/dashboard/users/${rowOriginal.id}`),
      },
      {
        id: 3,
        title: "users.actions.disable",
        icon: <UserX className="h-4 w-4" />,
        onClick: () => handleDisablePrompt(rowOriginal),
      },
      {
        id: 4,
        title: "Reset Password",
        icon: <LockKeyhole className="h-4 w-4" />,
        onClick: () => handleResetPasswordPrompt(rowOriginal),
      },
      {
        id: 5,
        title: "leads.actions.delete",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: () => handleDeletePrompt(rowOriginal),
        destructive: true,
      },
    ],
    [navigate],
  );

  const massActions: ContextMenuOption[] = [
    {
      id: 1,
      title: "users.actions.add_new",
      icon: <Plus className="h-4 w-4" />,
      onClick: () => {
        setSelectedUser(undefined);
        setModalOpen(true);
      },
    },
    {
      id: 2,
      title: "Refresh Data", // Hardcoded fallback for missing translation text
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: () => {
        revalidator.revalidate();
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="w-full flex-1 flex flex-col mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title={t("users.stats.total")}
            value={stats.total}
            icon={Users}
            description={t("users.stats.total_desc")}
          />
          <StatCard
            title={t("users.stats.active")}
            value={stats.active}
            icon={Shield}
            description={t("users.stats.active_desc")}
          />
          <StatCard
            title={t("users.stats.disabled")}
            value={stats.restricted}
            icon={UserX}
            description={t("users.stats.disabled_desc")}
          />
        </div>

        {/* Global Data Table */}
        <GlobalDataTable
          data={tableData}
          headers={headers}
          title={"dashboard.nav.users"}
          description={"users.description"}
          contextMenuOptions={contextMenuOptions}
          massContextMenu={massActions}
        />
      </div>

      <UserForm
        open={modalOpen}
        onOpenChange={handleDialogChange}
        user={selectedUser}
      />

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          resetDialogStates();
        }}
        onConfirm={confirmDisable}
        title={t("users.dialog.restrict_title")}
        description={t("users.dialog.restrict_desc", {
          name: userActionTarget?.full_name,
        })}
        confirmText={
          userActionTarget?.is_disabled
            ? "Activate User"
            : t("users.dialog.restrict_confirm")
        }
        variant={userActionTarget?.is_disabled ? "default" : "destructive"}
      >
        {!userActionTarget?.is_disabled && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Reason for Disabling (Optional)
            </label>
            <textarea
              className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Employee left the company"
              value={disableNote}
              onChange={(e) => setDisableNote(e.target.value)}
            />
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          resetDialogStates();
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        description={`Are you sure you want to permanently delete ${userActionTarget?.full_name}? This action cannot be undone.`}
        confirmText="Delete User"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => {
          setShowResetDialog(false);
          resetDialogStates();
        }}
        onConfirm={confirmResetPassword}
        title="Reset Password"
        description={`The password for ${userActionTarget?.email} will be reset. The user will be notified via email with their new password.`}
        confirmText="Update Password"
        variant="default"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </ConfirmDialog>
    </DashboardLayout>
  );
}
