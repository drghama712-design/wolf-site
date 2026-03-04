import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { AlertTriangle, Lock, TrendingUp, Users, Shield } from "lucide-react";

export default function AdminPanel() {
  const [r12Trigger, setR12Trigger] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ottToken, setOttToken] = useState<string | null>(null);

  // R.12 Protocol Trigger
  const r12Mutation = trpc.admin.triggerR12.useMutation({
    onSuccess: (data) => {
      setOttToken(data.token);
      setIsAuthenticated(true);
      toast.success("Admin access granted!");
      setR12Trigger("");
    },
    onError: (error) => {
      toast.error(`Access denied: ${error.message}`);
    },
  });

  // Fetch admin data
  const { data: analytics } = trpc.admin.getAnalytics.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: profitDashboard } = trpc.admin.getProfitDashboard.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: threatRadar } = trpc.admin.getThreatRadar.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: auditLogs } = trpc.admin.getAuditLogs.useQuery(
    { limit: 20, offset: 0 },
    { enabled: isAuthenticated }
  );

  const handleR12Trigger = async () => {
    if (!r12Trigger) {
      toast.error("Please enter the access trigger");
      return;
    }
    await r12Mutation.mutateAsync({ triggerString: r12Trigger });
  };

  // Render R.12 Access Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              <CardTitle className="text-red-500">FORTRESS SPLITTER - Admin Access</CardTitle>
            </div>
            <CardDescription>R.12 Stealth Protocol Authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-300 mb-3">Enter the R.12 trigger string to access the admin panel.</p>
              <Input
                type="password"
                placeholder="Enter trigger string..."
                value={r12Trigger}
                onChange={(e) => setR12Trigger(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleR12Trigger()}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
              />
            </div>

            <Button
              onClick={handleR12Trigger}
              disabled={r12Mutation.isPending || !r12Trigger}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {r12Mutation.isPending ? "Verifying..." : "Access Admin Panel"}
            </Button>

            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
              <p className="text-xs text-yellow-300">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                This access is logged and monitored. Unauthorized attempts will trigger IP banning.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-red-500" />
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-slate-400">R.12 Protocol - Encrypted Admin Access</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Videos Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics?.totalVideosProcessed || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${profitDashboard?.monthlyRevenue || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Banned IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{threatRadar?.bannedIps || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-slate-700">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profit">Profit</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Processing Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: "Jan", videos: 120, segments: 450 },
                    { name: "Feb", videos: 200, segments: 750 },
                    { name: "Mar", videos: 150, segments: 600 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                    <Legend />
                    <Bar dataKey="videos" fill="#3b82f6" name="Videos" />
                    <Bar dataKey="segments" fill="#10b981" name="Segments" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profit Tab */}
          <TabsContent value="profit" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { name: "Week 1", revenue: 1200 },
                    { name: "Week 2", revenue: 1900 },
                    { name: "Week 3", revenue: 1500 },
                    { name: "Week 4", revenue: 2200 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Active Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{profitDashboard?.activeSubscriptions || 0}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{profitDashboard?.churnRate || 0}%</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">ARPU</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    ${profitDashboard?.averageRevenuePerUser || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Threats Tab */}
          <TabsContent value="threats" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Threat Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Banned IPs */}
                <div>
                  <h3 className="font-medium text-white mb-3">Recently Banned IPs</h3>
                  <div className="space-y-2">
                    {threatRadar?.recentBans && threatRadar.recentBans.length > 0 ? (
                      threatRadar.recentBans.map((ban: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                          <div>
                            <p className="font-mono text-sm text-red-400">{ban.ip}</p>
                            <p className="text-xs text-slate-400">{ban.reason}</p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(ban.bannedUntil).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No banned IPs</p>
                    )}
                  </div>
                </div>

                {/* Suspicious Activities */}
                <div>
                  <h3 className="font-medium text-white mb-3">Suspicious Activities</h3>
                  <div className="space-y-2">
                    {threatRadar?.threats && threatRadar.threats.length > 0 ? (
                      threatRadar.threats.map((threat: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                          <div>
                            <p className="font-mono text-sm text-yellow-400">{threat.action}</p>
                            <p className="text-xs text-slate-400">{threat.ip}</p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(threat.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No suspicious activities</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.map((log: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-700 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-blue-400">{log.action}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.status === "success" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-slate-400">IP: {log.ipAddress}</p>
                        <p className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-4">No audit logs</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
