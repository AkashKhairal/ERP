'use client'

import React from 'react'
import {
  LineChart,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// Line Chart Component
export function LineChartComponent({ 
  data, 
  color = "hsl(var(--primary))", 
  height = 200,
  dataKey = "value",
  strokeWidth = 2 
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={strokeWidth}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// Bar Chart Component
export function BarChartComponent({ 
  data, 
  color = "hsl(var(--primary))", 
  height = 200,
  dataKey = "value" 
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Area Chart Component
export function AreaChartComponent({ 
  data, 
  color = "hsl(var(--primary))", 
  height = 200,
  dataKey = "value" 
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fill="url(#colorArea)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Pie Chart Component
export function PieChartComponent({ 
  data, 
  height = 200,
  dataKey = "value",
  nameKey = "name"
}) {
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--destructive))',
    'hsl(var(--muted))',
    'hsl(var(--popover))'
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="hsl(var(--primary))"
          dataKey={dataKey}
          name={nameKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Multi-line Chart Component
export function MultiLineChartComponent({ 
  data, 
  lines = [], 
  height = 200 
}) {
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--destructive))'
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Legend />
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color || COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ fill: line.color || COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
            name={line.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// Stacked Bar Chart Component
export function StackedBarChartComponent({ 
  data, 
  bars = [], 
  height = 200 
}) {
  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--destructive))'
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Legend />
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            stackId="a"
            fill={bar.color || COLORS[index % COLORS.length]}
            radius={[4, 4, 0, 0]}
            name={bar.name}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
} 