import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Plus,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Download
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FinancialStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  organization: {
    name: string;
  };
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  due_date: string;
  paid_date?: string;
}

interface CustomCharge {
  id: string;
  organization: {
    name: string;
  };
  description: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export default function AdminFinancial() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinancialStats>({
    totalRevenue: 0,
    monthlyRecurringRevenue: 0,
    activeSubscriptions: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customCharges, setCustomCharges] = useState<CustomCharge[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [showCustomChargeDialog, setShowCustomChargeDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [chargeForm, setChargeForm] = useState({
    organizationId: '',
    description: '',
    amount: '',
    hours: '',
    hourlyRate: '',
    notes: '',
  });

  const [invoiceForm, setInvoiceForm] = useState({
    organizationId: '',
    amount: '',
    description: '',
    dueDate: '',
  });

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      loadFinancialData();
    }
  }, [profile]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      const [invoicesResult, chargesResult, orgsResult, paymentsResult] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, organization:organizations(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('custom_charges')
          .select('*, organization:organizations(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('organizations')
          .select('id, name, subscription_tier, subscription_status')
          .order('name'),
        supabase
          .from('payments')
          .select('amount, status')
          .eq('status', 'succeeded'),
      ]);

      if (invoicesResult.data) {
        setInvoices(invoicesResult.data as any);

        const pending = invoicesResult.data.filter(i => i.status === 'sent').length;
        const overdue = invoicesResult.data.filter(i => i.status === 'overdue').length;

        setStats(prev => ({
          ...prev,
          pendingInvoices: pending,
          overdueInvoices: overdue,
        }));
      }

      if (chargesResult.data) {
        setCustomCharges(chargesResult.data as any);
      }

      if (orgsResult.data) {
        setOrganizations(orgsResult.data);

        const active = orgsResult.data.filter(
          org => org.subscription_status === 'active'
        ).length;

        setStats(prev => ({
          ...prev,
          activeSubscriptions: active,
        }));
      }

      if (paymentsResult.data) {
        const totalRevenue = paymentsResult.data.reduce(
          (sum, payment) => sum + Number(payment.amount),
          0
        );

        setStats(prev => ({
          ...prev,
          totalRevenue,
        }));
      }

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data: monthlyPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'succeeded')
        .gte('created_at', startOfMonth.toISOString());

      if (monthlyPayments) {
        const mrr = monthlyPayments.reduce(
          (sum, payment) => sum + Number(payment.amount),
          0
        );

        setStats(prev => ({
          ...prev,
          monthlyRecurringRevenue: mrr,
        }));
      }
    } catch (error: any) {
      console.error('Failed to load financial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const amount = chargeForm.hours && chargeForm.hourlyRate
        ? parseFloat(chargeForm.hours) * parseFloat(chargeForm.hourlyRate)
        : parseFloat(chargeForm.amount);

      const { error } = await supabase
        .from('custom_charges')
        .insert({
          organization_id: chargeForm.organizationId,
          description: chargeForm.description,
          amount,
          hours: chargeForm.hours ? parseFloat(chargeForm.hours) : null,
          hourly_rate: chargeForm.hourlyRate ? parseFloat(chargeForm.hourlyRate) : null,
          notes: chargeForm.notes,
          status: 'approved',
          billed_by: profile?.id,
          approved_by: profile?.id,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Custom charge created successfully',
      });

      setShowCustomChargeDialog(false);
      setChargeForm({
        organizationId: '',
        description: '',
        amount: '',
        hours: '',
        hourlyRate: '',
        notes: '',
      });
      await loadFinancialData();
    } catch (error: any) {
      console.error('Failed to create custom charge:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create custom charge',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: {
          organizationId: invoiceForm.organizationId,
          amount: parseFloat(invoiceForm.amount),
          description: invoiceForm.description,
          dueDate: invoiceForm.dueDate,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Invoice ${data.invoice.invoice_number} created successfully`,
      });

      setShowInvoiceDialog(false);
      setInvoiceForm({
        organizationId: '',
        amount: '',
        description: '',
        dueDate: '',
      });
      await loadFinancialData();
    } catch (error: any) {
      console.error('Failed to generate invoice:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate invoice',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBillCustomCharges = async (chargeIds: string[]) => {
    setActionLoading(true);

    try {
      const organizationId = customCharges.find(c => chargeIds.includes(c.id))?.organization.id;

      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: {
          organizationId,
          customChargeIds: chargeIds,
        },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Invoice ${data.invoice.invoice_number} created from custom charges`,
      });

      await loadFinancialData();
    } catch (error: any) {
      console.error('Failed to bill custom charges:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to bill custom charges',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return (
      <Layout>
        <div className="container-responsive py-8">
          <p>Access denied. Admin privileges required.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-responsive py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Financial Management</h1>
            <p className="text-gray-600">
              Manage billing, invoices, and custom charges
            </p>
          </div>
          <div className="flex gap-3">
            <Dialog open={showCustomChargeDialog} onOpenChange={setShowCustomChargeDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Charge
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Charge</DialogTitle>
                  <DialogDescription>
                    Create a custom charge for consulting or additional services
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCustomCharge} className="space-y-4">
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <select
                      id="organization"
                      className="w-full border rounded-md p-2"
                      value={chargeForm.organizationId}
                      onChange={(e) => setChargeForm({ ...chargeForm, organizationId: e.target.value })}
                      required
                    >
                      <option value="">Select organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={chargeForm.description}
                      onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })}
                      placeholder="Consulting services..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hours">Hours (optional)</Label>
                      <Input
                        id="hours"
                        type="number"
                        step="0.5"
                        value={chargeForm.hours}
                        onChange={(e) => setChargeForm({ ...chargeForm, hours: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (optional)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        step="0.01"
                        value={chargeForm.hourlyRate}
                        onChange={(e) => setChargeForm({ ...chargeForm, hourlyRate: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="amount">Total Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={chargeForm.amount}
                      onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })}
                      placeholder="0.00"
                      required={!chargeForm.hours && !chargeForm.hourlyRate}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input
                      id="notes"
                      value={chargeForm.notes}
                      onChange={(e) => setChargeForm({ ...chargeForm, notes: e.target.value })}
                      placeholder="Internal notes..."
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomChargeDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Charge'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Invoice
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Invoice</DialogTitle>
                  <DialogDescription>
                    Create a new invoice for an organization
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleGenerateInvoice} className="space-y-4">
                  <div>
                    <Label htmlFor="invoice-org">Organization</Label>
                    <select
                      id="invoice-org"
                      className="w-full border rounded-md p-2"
                      value={invoiceForm.organizationId}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, organizationId: e.target.value })}
                      required
                    >
                      <option value="">Select organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="invoice-description">Description</Label>
                    <Input
                      id="invoice-description"
                      value={invoiceForm.description}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                      placeholder="Service description..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoice-amount">Amount</Label>
                    <Input
                      id="invoice-amount"
                      type="number"
                      step="0.01"
                      value={invoiceForm.amount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoice-due">Due Date</Label>
                    <Input
                      id="invoice-due"
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInvoiceDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Invoice'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">All-time revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRecurringRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly recurring</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground mt-1">Paying customers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending/Overdue</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingInvoices} / {stats.overdueInvoices}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Invoices</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoices generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.slice(0, 5).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{invoice.organization?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-600 font-mono">{invoice.invoice_number}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(invoice.created_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(invoice.amount)}</div>
                      <Badge
                        className={
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No invoices yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Charges</CardTitle>
              <CardDescription>Unbilled custom work and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customCharges.filter(c => c.status === 'approved').slice(0, 5).map((charge) => (
                  <div
                    key={charge.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{charge.organization?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{charge.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(charge.created_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(charge.amount)}</div>
                      <Badge className="bg-blue-100 text-blue-800">{charge.status}</Badge>
                    </div>
                  </div>
                ))}
                {customCharges.filter(c => c.status === 'approved').length === 0 && (
                  <p className="text-center text-gray-500 py-4">No unbilled charges</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
