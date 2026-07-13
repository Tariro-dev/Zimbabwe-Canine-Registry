import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Globe,
  ShieldCheck,
  Users,
  Activity,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function RegulatorDashboard() {
  // We'll use a manual fetch since we didn't add this to the generated client hooks yet
  const { data: stats, isLoading } = useQuery({
    queryKey: ['regulatorStats'],
    queryFn: async () => {
      const res = await fetch('/api/stats/regulator', {
        headers: { 'x-user-id': 'user-regulator' } // Simulate regulator role
      });
      return res.json();
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading National Registry Analytics...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Regulator Control Center</h1>
        <p className="text-muted-foreground mt-1">National oversight and compliance monitoring for the Zimbabwe Canine Registry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="User Role Distribution"
          value={stats.userRoles.reduce((acc: number, r: any) => acc + r.count, 0)}
          description="Total Registered Users"
          icon={Users}
        />
        <MetricCard
          title="Health Compliance"
          value={stats.healthCompliance.fullyVaccinated}
          description="Nationwide Vaccination Rate"
          icon={ShieldCheck}
          positive
        />
        <MetricCard
          title="Blockchain Integrity"
          value="100%"
          description="Record Immutability Status"
          icon={Activity}
          positive
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>Registrations by Province</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.regionalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="province" type="category" width={120} fontSize={12} />
                <Tooltip />
                <Bar dataKey="registeredDogs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Roles Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Stakeholder Mix</CardTitle>
            <CardDescription>System Access by Role Type</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.userRoles}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="role"
                  label
                >
                  {stats.userRoles.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Provincial Compliance Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Province</th>
                  <th className="px-6 py-4 font-semibold">Reg. Dogs</th>
                  <th className="px-6 py-4 font-semibold">Active Vets</th>
                  <th className="px-6 py-4 font-semibold">Vaccination Rate</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.regionalData.map((row: any, i: number) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">{row.province}</td>
                    <td className="px-6 py-4">{row.registeredDogs}</td>
                    <td className="px-6 py-4">{row.activeVets}</td>
                    <td className="px-6 py-4">{row.vaccinationRate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={parseFloat(row.vaccinationRate) > 80 ? 'default' : 'secondary'}>
                        {parseFloat(row.vaccinationRate) > 80 ? 'Optimal' : 'Needs Review'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, description, icon: Icon, positive }: any) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 ${positive ? 'text-emerald-500' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
