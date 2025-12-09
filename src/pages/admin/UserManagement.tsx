import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  Search,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Globe,
  MapPin,
  X
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type User = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  banned_at: string | null;
  ban_reason: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  organization: {
    id: string;
    name: string;
  } | null;
};

type UserSession = {
  id: string;
  ip_address: string;
  user_agent: string;
  country: string | null;
  city: string | null;
  login_at: string;
  logout_at: string | null;
  is_active: boolean;
};

export default function UserManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          organization:organizations(id, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserSessions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("login_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setUserSessions(data || []);
    } catch (error: any) {
      console.error("Error loading sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load user sessions",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    loadUserSessions(user.id);
  };

  const handleToggleActive = async (user: User) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: !user.is_active })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!user.is_active ? "activated" : "deactivated"} successfully`,
      });

      loadUsers();
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;

    if (!banReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for banning this user",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_banned: true,
          banned_at: new Date().toISOString(),
          ban_reason: banReason,
          banned_by: profile?.id,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User banned successfully",
      });

      setShowBanDialog(false);
      setBanReason("");
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error("Error banning user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const handleUnbanUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_banned: false,
          banned_at: null,
          ban_reason: null,
          banned_by: null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User unbanned successfully",
      });

      loadUsers();
    } catch (error: any) {
      console.error("Error unbanning user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to unban user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.organization?.name.toLowerCase().includes(searchLower)
    );
  });

  const stats = [
    { label: "Total Users", value: users.length, color: "text-blue-600" },
    { label: "Active", value: users.filter(u => u.is_active && !u.is_banned).length, color: "text-green-600" },
    { label: "Inactive", value: users.filter(u => !u.is_active).length, color: "text-gray-600" },
    { label: "Banned", value: users.filter(u => u.is_banned).length, color: "text-red-600" },
  ];

  if (profile?.role !== "admin" && profile?.role !== "super_admin") {
    return (
      <Layout>
        <div className="container-responsive py-8">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-600">Access denied. Admin privileges required.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage users, view activity, and control access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search users by name, email, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </CardContent>
            </Card>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-gray-600">No users found</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.email}
                        </h3>
                        <Badge variant={user.is_active && !user.is_banned ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                        {user.is_banned && (
                          <Badge variant="destructive">Banned</Badge>
                        )}
                        {!user.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.organization && (
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {user.organization.name}
                          </div>
                        )}
                        {user.last_login_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Last login: {format(new Date(user.last_login_at), "MMM dd, yyyy HH:mm")}
                          </div>
                        )}
                        {user.last_login_ip && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            IP: {user.last_login_ip}
                          </div>
                        )}
                      </div>

                      {user.is_banned && user.ban_reason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Ban Reason:</strong> {user.ban_reason}
                          </p>
                          {user.banned_at && (
                            <p className="text-xs text-red-600 mt-1">
                              Banned on {format(new Date(user.banned_at), "MMM dd, yyyy")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(user)}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>
                      {user.is_banned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnbanUser(user)}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowBanDialog(true);
                          }}
                        >
                          Ban User
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={!!selectedUser && !showBanDialog} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details & Activity</DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">User Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Email</Label>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label>Role</Label>
                      <p className="text-gray-900">{selectedUser.role}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <p className="text-gray-900">
                        {selectedUser.is_banned ? "Banned" : selectedUser.is_active ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div>
                      <Label>Joined</Label>
                      <p className="text-gray-900">
                        {format(new Date(selectedUser.created_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Recent Login Sessions</h3>
                  {userSessions.length === 0 ? (
                    <p className="text-gray-600 text-sm">No login sessions recorded</p>
                  ) : (
                    <div className="space-y-3">
                      {userSessions.map((session) => (
                        <Card key={session.id}>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <span>{session.ip_address}</span>
                              </div>
                              {session.city && session.country && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>{session.city}, {session.country}</span>
                                </div>
                              )}
                              <div className="col-span-2">
                                <Label className="text-xs">User Agent</Label>
                                <p className="text-xs text-gray-600 truncate">
                                  {session.user_agent}
                                </p>
                              </div>
                              <div>
                                <Label className="text-xs">Login</Label>
                                <p className="text-xs text-gray-900">
                                  {format(new Date(session.login_at), "MMM dd, yyyy HH:mm")}
                                </p>
                              </div>
                              {session.logout_at && (
                                <div>
                                  <Label className="text-xs">Logout</Label>
                                  <p className="text-xs text-gray-900">
                                    {format(new Date(session.logout_at), "MMM dd, yyyy HH:mm")}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You are about to ban <strong>{selectedUser?.email}</strong>. Please provide a reason:
              </p>

              <div>
                <Label htmlFor="ban_reason">Ban Reason *</Label>
                <textarea
                  id="ban_reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter the reason for banning this user"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => {
                  setShowBanDialog(false);
                  setBanReason("");
                }} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleBanUser} variant="destructive" className="flex-1">
                  Ban User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
