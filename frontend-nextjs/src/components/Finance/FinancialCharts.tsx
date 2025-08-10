'use client'

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Custom tooltip for currency formatting
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: ₹{entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Revenue Trend Chart
interface RevenueTrendChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
  height?: number;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Income"
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          strokeWidth={3}
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Expenses"
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Profit"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Income vs Expenses Area Chart
interface IncomeExpenseAreaChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  height?: number;
}

export const IncomeExpenseAreaChart: React.FC<IncomeExpenseAreaChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="income"
          stackId="1"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.6}
          name="Income"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stackId="2"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.6}
          name="Expenses"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Category Breakdown Bar Chart
interface CategoryBarChartProps {
  data: Array<{
    category: string;
    amount: number;
    count?: number;
  }>;
  height?: number;
  color?: string;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data, height = 300, color = "#3b82f6" }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          type="number"
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
        />
        <YAxis 
          type="category"
          dataKey="category"
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          width={100}
        />
        <Tooltip 
          formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
          labelStyle={{ color: '#374151' }}
        />
        <Bar dataKey="amount" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Expense Breakdown Pie Chart
interface ExpensePieChartProps {
  data: Array<{
    category: string;
    amount: number;
  }>;
  height?: number;
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data, height = 300 }) => {
  const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
          label={({ category, percent }: any) => 
            `${category}: ${(percent * 100).toFixed(1)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Budget Progress Chart
interface BudgetProgressChartProps {
  data: Array<{
    category: string;
    budget: number;
    actual: number;
    percentage?: number;
  }>;
  height?: number;
}

export const BudgetProgressChart: React.FC<BudgetProgressChartProps> = ({ data, height = 300 }) => {
  const chartData = data.map(item => ({
    ...item,
    utilization: item.budget > 0 ? (item.actual / item.budget) * 100 : 0
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="category" 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value: any, name: string) => {
            if (name === 'Budget Utilization') {
              return [`${value.toFixed(1)}%`, name];
            }
            return [`₹${value.toLocaleString()}`, name];
          }}
        />
        <Legend />
        <Bar 
          dataKey="utilization" 
          fill="#3b82f6" 
          name="Budget Utilization (%)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Monthly Comparison Chart
interface MonthlyComparisonChartProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  height?: number;
}

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ data, height = 400 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#6b7280"
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="income" 
          fill="#10b981" 
          name="Income"
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="expenses" 
          fill="#ef4444" 
          name="Expenses"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// KPI Gauge Chart (simplified using a donut chart)
interface KPIGaugeChartProps {
  value: number;
  max: number;
  label: string;
  color?: string;
  height?: number;
}

export const KPIGaugeChart: React.FC<KPIGaugeChartProps> = ({ 
  value, 
  max, 
  label, 
  color = "#3b82f6", 
  height = 200 
}) => {
  const percentage = (value / max) * 100;
  const data = [
    { name: 'Used', value: percentage, fill: color },
    { name: 'Remaining', value: 100 - percentage, fill: '#e5e7eb' }
  ];

  return (
    <div className="text-center">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2">
        <div className="text-2xl font-bold" style={{ color }}>
          {percentage.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xs text-gray-400">
          ₹{value.toLocaleString()} / ₹{max.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const FinancialCharts = {
  RevenueTrendChart,
  IncomeExpenseAreaChart,
  CategoryBarChart,
  ExpensePieChart,
  BudgetProgressChart,
  MonthlyComparisonChart,
  KPIGaugeChart
};

export default FinancialCharts;
