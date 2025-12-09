import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

type TeamMember = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  inviter: {
    first_name: string;
    last_name: string;
  } | null;
};

export default function TeamManagement() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "user"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersResult, invitationsResult] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .eq('organization_id', profile?.organization_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('team_invitations')
          .select(`
            *,
            inviter:users!team_invitations_invited_by_fkey(first_name, last_name)
          `)
          .eq('organization_id', profile?.organization_id)
          .order('created_at', { ascending: false })
      ]);

      if (membersResult.error) throw membersResult.error;
      if (invitationsResult.error) throw invitationsResult.error;

      setTeamMembers(membersResult.data || []);
      setInvitations(invitationsResult.data as any || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (teamMembers.some(m => m.email === inviteForm.email)) {
      toast({
        title: "Already a Member",
        description: "This user is already a team member",
        variant: "destructive"
      });
      return;
    }

    setInviting(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          organization_id: profile?.organization_id,
          email: inviteForm.email,
          role: inviteForm.role,
          invited_by: profile?.id,
          expires_at: expiresAt.toISOString()
        })
        .select(`
          *,
          inviter:users!team_invitations_invited_by_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      setInvitations([data as any, ...invitations]);
      setInviteForm({ email: "", role: "user" });

      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${inviteForm.email}`
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvitations(invitations.filter(i => i.id !== id));
      toast({
        title: "Success",
        description: "Invitation cancelled"
      });
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setTeamMembers(teamMembers.map(m =>
        m.id === id ? { ...m, is_active: false } : m
      ));

      toast({
        title: "Success",
        description: "Team member removed"
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
    if (role === 'super_admin') return <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>;
    return <Badge className="bg-blue-100 text-blue-800">User</Badge>;
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    if (status === 'accepted') return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
    if (status === 'declined') return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
    if (status === 'expired' || new Date(expiresAt) < new Date()) {
      return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
  };

  const activeMembers = teamMembers.filter(m => m.is_active);
  const pendingInvitations = invitations.filter(i => i.status === 'pending' && new Date(i.expires_at) >= new Date());

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-600">Invite and manage your team members</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Team Members</p>
                  <p className="text-3xl font-bold">{activeMembers.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Invitations</p>
                  <p className="text-3xl font-bold">{pendingInvitations.length}</p>
                </div>
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admins</p>
                  <p className="text-3xl font-bold">
                    {activeMembers.filter(m => m.role === 'admin' || m.role === 'super_admin').length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Invite New Member</CardTitle>
            <CardDescription>Send an invitation to join your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="colleague@company.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleInvite} disabled={inviting}>
                <UserPlus className="w-4 h-4 mr-2" />
                {inviting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="members">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Team Members ({activeMembers.length})</CardTitle>
                <CardDescription>People in your organization</CardDescription>
              </CardHeader>
              <CardContent>
                {activeMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No team members yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMembers.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold">
                                  {member.first_name && member.last_name
                                    ? `${member.first_name} ${member.last_name}`
                                    : member.email}
                                </p>
                                <p className="text-sm text-gray-600">{member.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getRoleBadge(member.role)}
                                  <span className="text-xs text-gray-500">
                                    Joined {format(new Date(member.created_at), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {member.id !== profile?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
                <CardDescription>Track sent invitations</CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No invitations sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((invitation) => (
                      <Card key={invitation.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Mail className="w-6 h-6 text-yellow-600" />
                              </div>
                              <div>
                                <p className="font-semibold">{invitation.email}</p>
                                <p className="text-sm text-gray-600">
                                  Invited by {invitation.inviter
                                    ? `${invitation.inviter.first_name} ${invitation.inviter.last_name}`
                                    : 'Unknown'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getRoleBadge(invitation.role)}
                                  {getStatusBadge(invitation.status, invitation.expires_at)}
                                  {invitation.status === 'pending' && (
                                    <span className="text-xs text-gray-500">
                                      Expires {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {invitation.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelInvitation(invitation.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
