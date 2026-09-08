import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';
import { useProblems } from '../../context/ProblemContext';
import { CATEGORY_LABELS, SEVERITY_CONFIG } from '../../data/demoData';
import type { ProblemCategory, Severity } from '../../types';
import { Card } from '../common/Card';
import { MaterialIcon } from '../common/MaterialIcon';

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #c6c6ce',
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: 'Inter, sans-serif',
  color: '#0b1c30',
};

export function PriorityDistributionChart() {
  const { problems } = useProblems();
  const data = (['critical', 'high', 'medium', 'low'] as Severity[])
    .map((sev) => ({
      name: SEVERITY_CONFIG[sev].label,
      value: problems.filter((p) => p.severity === sev).length,
      fill: sev === 'critical' ? '#BA1A1A' : sev === 'high' ? '#F59E0B' : sev === 'medium' ? '#06B6D4' : '#76767e',
    }));

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon icon="monitoring" size={20} className="text-secondary" />
        <h3 className="font-headline-sm text-on-surface">Severity Distribution</h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce9ff" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#76767e' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#45464d' }} axisLine={false} tickLine={false} width={70} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function CategoryBreakdownChart() {
  const { problems } = useProblems();
  const colors = ['#06B6D4', '#39b8fd', '#0B132B', '#F59E0B', '#BA1A1A', '#7b83a0', '#89ceff', '#131a33', '#ffb3ad', '#76767e'];

  const counts = problems.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([cat, value], i) => ({
    name: CATEGORY_LABELS[cat as ProblemCategory],
    value,
    fill: colors[i % colors.length],
  }));

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon icon="pie_chart" size={20} className="text-secondary" />
        <h3 className="font-headline-sm text-on-surface">Problems by Category</h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function WeekTrendChart() {
  const { problems } = useProblems();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      reported: problems.filter((p) => p.reportedAt.toDateString() === d.toDateString()).length,
    };
  });

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon icon="show_chart" size={20} className="text-secondary" />
        <h3 className="font-headline-sm text-on-surface">Report Activity (7d)</h3>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={days} margin={{ left: -18, right: 8 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce9ff" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#76767e' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#76767e' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="reported" stroke="#06B6D4" strokeWidth={2} fill="url(#trendGrad)" dot={{ r: 3, fill: '#06B6D4' }} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function PipelineRadialChart() {
  const { problems } = useProblems();

  const stageCounts = {
    reported: problems.filter((p) => p.currentStage === 1).length,
    analyzed: problems.filter((p) => p.currentStage === 2).length,
    verified: problems.filter((p) => p.currentStage === 3).length,
    matched: problems.filter((p) => p.currentStage === 4).length,
    active: problems.filter((p) => p.currentStage > 4 && p.currentStage < 8).length,
    deployed: problems.filter((p) => p.currentStage >= 8).length,
  };

  const data = [
    { name: 'Reported', value: stageCounts.reported, fill: '#89ceff' },
    { name: 'Analyzed', value: stageCounts.analyzed, fill: '#06B6D4' },
    { name: 'Verified', value: stageCounts.verified, fill: '#39b8fd' },
    { name: 'Matched', value: stageCounts.matched, fill: '#7b83a0' },
    { name: 'In Progress', value: stageCounts.active, fill: '#131a33' },
    { name: 'Deployed', value: stageCounts.deployed, fill: '#0B132B' },
  ];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <MaterialIcon icon="radar" size={20} className="text-secondary" />
        <h3 className="font-headline-sm text-on-surface">Pipeline Health</h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart innerRadius="25%" outerRadius="100%" data={data} cx="50%" cy="50%" startAngle={90} endAngle={-270}>
          <RadialBar dataKey="value" background={{ fill: '#e5eeff' }} cornerRadius={8} />
          <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
          <Tooltip contentStyle={tooltipStyle} />
        </RadialBarChart>
      </ResponsiveContainer>
    </Card>
  );
}