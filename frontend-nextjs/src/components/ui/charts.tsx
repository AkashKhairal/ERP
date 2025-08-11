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

// Luxury Color Palettes - TastyIgniter Inspired
const LUXURY_COLORS = {
  primary: '#f97316', // Orange-500
  primaryLight: '#fb923c', // Orange-400
  primaryDark: '#ea580c', // Orange-600
  secondary: '#ef4444', // Red-500
  secondaryLight: '#f87171', // Red-400
  accent: '#f59e0b', // Amber-500
  success: '#10b981', // Emerald-500
  warning: '#f59e0b', // Amber-500
  info: '#3b82f6', // Blue-500
  muted: '#6b7280', // Gray-500
  background: 'rgba(255, 255, 255, 0.8)',
  text: '#1f2937', // Gray-800
  textMuted: '#6b7280', // Gray-500
}

const GRADIENT_COLORS = [
  ['#f97316', '#fb923c'], // Orange gradient
  ['#ef4444', '#f87171'], // Red gradient
  ['#f59e0b', '#fbbf24'], // Amber gradient
  ['#10b981', '#34d399'], // Emerald gradient
  ['#3b82f6', '#60a5fa'], // Blue gradient
  ['#8b5cf6', '#a78bfa'], // Violet gradient
  ['#ec4899', '#f472b6'], // Pink gradient
  ['#06b6d4', '#22d3ee'], // Cyan gradient
]

const LUXURY_PIE_COLORS = [
  '#f97316', // Orange
  '#ef4444', // Red  
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
]

// TypeScript interfaces
interface LineData {
  dataKey: string
  name: string
  color?: string
}

interface BarData {
  dataKey: string
  name: string
  color?: string
}

interface MultiLineChartProps {
  data: any[]
  lines: LineData[]
  height?: number
}

interface StackedBarChartProps {
  data: any[]
  bars: BarData[]
  height?: number
}

interface LineChartProps {
  data: any[]
  color?: string
  height?: number
  dataKey?: string
  strokeWidth?: number
}

interface BarChartProps {
  data: any[]
  color?: string
  height?: number
  dataKey?: string
}

interface AreaChartProps {
  data: any[]
  color?: string
  height?: number
  dataKey?: string
}

interface PieChartProps {
  data: any[]
  height?: number
  dataKey?: string
  nameKey?: string
}

// Luxury Tooltip Component with enhanced styling
const LuxuryTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border-0 rounded-2xl shadow-2xl p-4 min-w-[180px] animate-fade-in-up">
        <div className="text-sm font-semibold text-gray-900 tracking-tight mb-3 border-b border-gray-100 pb-2">
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 mb-2 last:mb-0">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs font-medium text-gray-600 tracking-tight">
                {entry.name || entry.dataKey}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight tabular-nums">
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString() 
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Enhanced responsive wrapper
const ResponsiveChartContainer = ({ children, height }: { children: React.ReactNode, height: number }) => (
  <div className="w-full" style={{ height: `${height}px` }}>
    <ResponsiveContainer width="100%" height="100%">
      {children as any}
    </ResponsiveContainer>
  </div>
)

// Luxury Grid Component
const LuxuryGrid = () => (
  <CartesianGrid 
    strokeDasharray="2 8" 
    stroke="rgba(107, 114, 128, 0.1)"
    strokeWidth={1}
  />
)

// Luxury Axis styling
const axisStyle = {
  fontSize: 11,
  fontWeight: 500,
  fontFamily: 'Poppins, system-ui, sans-serif',
  letterSpacing: '-0.005em',
  fill: '#6b7280'
}

// Line Chart Component - Luxury Edition
export function LineChartComponent({ 
  data, 
  color = LUXURY_COLORS.primary, 
  height = 300,
  dataKey = "value",
  strokeWidth = 3 
}: LineChartProps) {
  return (
    <ResponsiveChartContainer height={height}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id={`lineGradient-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={1}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <LuxuryGrid />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dy={10}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dx={-10}
        />
        <Tooltip content={<LuxuryTooltip />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={`url(#lineGradient-${dataKey})`}
          strokeWidth={strokeWidth}
          dot={{ 
            fill: color, 
            strokeWidth: 0, 
            r: 6,
            filter: 'url(#glow)'
          }}
          activeDot={{ 
            r: 8, 
            fill: color,
            stroke: 'rgba(255, 255, 255, 0.8)',
            strokeWidth: 3,
            filter: 'url(#glow)'
          }}
          animationDuration={1500}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveChartContainer>
  )
}

// Bar Chart Component - Luxury Edition
export function BarChartComponent({ 
  data, 
  color = LUXURY_COLORS.primary, 
  height = 300,
  dataKey = "value" 
}: BarChartProps) {
  return (
    <ResponsiveChartContainer height={height}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id={`barGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
          </linearGradient>
        </defs>
        <LuxuryGrid />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dy={10}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dx={-10}
        />
        <Tooltip content={<LuxuryTooltip />} />
        <Bar 
          dataKey={dataKey} 
          fill={`url(#barGradient-${dataKey})`}
          radius={[8, 8, 0, 0]}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveChartContainer>
  )
}

// Area Chart Component - Luxury Edition
export function AreaChartComponent({ 
  data, 
  color = LUXURY_COLORS.primary, 
  height = 300,
  dataKey = "value" 
}: AreaChartProps) {
  return (
    <ResponsiveChartContainer height={height}>
      <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id={`areaGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
            <stop offset="50%" stopColor={color} stopOpacity={0.2}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id={`areaStroke-${dataKey}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={1}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.8}/>
          </linearGradient>
        </defs>
        <LuxuryGrid />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dy={10}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dx={-10}
        />
        <Tooltip content={<LuxuryTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={`url(#areaStroke-${dataKey})`}
          fill={`url(#areaGradient-${dataKey})`}
          strokeWidth={3}
          dot={{ 
            fill: color, 
            strokeWidth: 0, 
            r: 4
          }}
          activeDot={{ 
            r: 6, 
            fill: color,
            stroke: 'rgba(255, 255, 255, 0.8)',
            strokeWidth: 2
          }}
          animationDuration={1800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveChartContainer>
  )
}

// Pie Chart Component - Luxury Edition
export function PieChartComponent({ 
  data, 
  height = 300,
  dataKey = "value",
  nameKey = "name"
}: PieChartProps) {

  return (
    <ResponsiveChartContainer height={height}>
      <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <defs>
          {LUXURY_PIE_COLORS.map((color, index) => (
            <linearGradient key={index} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
            </linearGradient>
          ))}
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => (
            <text 
              className="text-xs font-semibold tracking-tight" 
              fill="#374151"
            >
              {`${name} ${(percent * 100).toFixed(0)}%`}
            </text>
          )}
          outerRadius={height * 0.3}
          innerRadius={height * 0.15}
          paddingAngle={2}
          dataKey={dataKey}
          nameKey={nameKey}
          animationDuration={1500}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#pieGradient-${index % LUXURY_PIE_COLORS.length})`}
              stroke="rgba(255, 255, 255, 0.8)"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<LuxuryTooltip />} />
      </PieChart>
    </ResponsiveChartContainer>
  )
}

// Multi-line Chart Component - Luxury Edition
export function MultiLineChartComponent({ 
  data, 
  lines = [], 
  height = 300 
}: MultiLineChartProps) {
  return (
    <ResponsiveChartContainer height={height}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <defs>
          {lines.map((line, index) => (
            <linearGradient key={line.dataKey} id={`multiLineGradient-${line.dataKey}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={line.color || LUXURY_PIE_COLORS[index]} stopOpacity={1}/>
              <stop offset="100%" stopColor={line.color || LUXURY_PIE_COLORS[index]} stopOpacity={0.6}/>
            </linearGradient>
          ))}
        </defs>
        <LuxuryGrid />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dy={10}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dx={-10}
        />
        <Tooltip content={<LuxuryTooltip />} />
        <Legend 
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '12px',
            fontWeight: '500',
            fontFamily: 'Poppins, system-ui, sans-serif'
          }}
        />
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={`url(#multiLineGradient-${line.dataKey})`}
            strokeWidth={3}
            dot={{ 
              fill: line.color || LUXURY_PIE_COLORS[index], 
              strokeWidth: 0, 
              r: 5
            }}
            activeDot={{ 
              r: 7, 
              fill: line.color || LUXURY_PIE_COLORS[index],
              stroke: 'rgba(255, 255, 255, 0.8)',
              strokeWidth: 2
            }}
            name={line.name}
            animationDuration={1500 + (index * 200)}
            animationEasing="ease-out"
          />
        ))}
      </LineChart>
    </ResponsiveChartContainer>
  )
}

// Stacked Bar Chart Component - Luxury Edition
export function StackedBarChartComponent({ 
  data, 
  bars = [], 
  height = 300 
}: StackedBarChartProps) {
  return (
    <ResponsiveChartContainer height={height}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <defs>
          {bars.map((bar, index) => (
            <linearGradient key={bar.dataKey} id={`stackedBarGradient-${bar.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={bar.color || LUXURY_PIE_COLORS[index]} stopOpacity={1}/>
              <stop offset="100%" stopColor={bar.color || LUXURY_PIE_COLORS[index]} stopOpacity={0.7}/>
            </linearGradient>
          ))}
        </defs>
        <LuxuryGrid />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dy={10}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tick={axisStyle}
          dx={-10}
        />
        <Tooltip content={<LuxuryTooltip />} />
        <Legend 
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '12px',
            fontWeight: '500',
            fontFamily: 'Poppins, system-ui, sans-serif'
          }}
        />
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            stackId="a"
            fill={`url(#stackedBarGradient-${bar.dataKey})`}
            radius={index === bars.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
            name={bar.name}
            animationDuration={1200 + (index * 150)}
            animationEasing="ease-out"
          />
        ))}
      </BarChart>
    </ResponsiveChartContainer>
  )
}