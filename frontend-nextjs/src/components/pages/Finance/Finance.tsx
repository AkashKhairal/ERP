'use client'

import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Download, 
  CreditCard, 
  Receipt, 
  PieChart, 
  BarChart3,
  Target
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/charts'
import { useAuth } from '@/context/AuthContext'

const Finance = () => {
  const { logActivity } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'income',
      amount: 5000,
      description: 'Client payment - Project A',
      category: 'Revenue',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 2,
      type: 'expense',
      amount: 1200,
      description: 'Office supplies',
      category: 'Operations',
      date: '2024-01-14',
      status: 'completed'
    },
    {
      id: 3,
      type: 'income',
      amount: 3000,
      description: 'Subscription revenue',
      category: 'Revenue',
      date: '2024-01-13',
      status: 'completed'
    }
  ])
  const [budgets, setBudgets] = useState([
    {
      id: 1,
      name: 'Marketing Budget',
      allocated: 10000,
      spent: 6500,
      remaining: 3500,
      category: 'Marketing'
    },
    {
      id: 2,
      name: 'Development Budget',
      allocated: 25000,
      spent: 18000,
      remaining: 7000,
      category: 'Development'
    }
  ])
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      number: 'INV-001',
      client: 'TechCorp Inc.',
      amount: 5000,
      dueDate: '2024-02-15',
      status: 'pending'
    },
    {
      id: 2,
      number: 'INV-002',
      client: 'Design Studio',
      amount: 3000,
      dueDate: '2024-02-10',
      status: 'completed'
    }
  ])
  const [stats] = useState({
    totalRevenue: 45231,
    totalExpenses: 23450,
    netProfit: 21781,
    pendingInvoices: 12500
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: PieChart },
  ]

  useEffect(() => {
    logActivity('Finance Dashboard Visit', 'User accessed finance management')
  }, [logActivity])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const renderOverviewTab = () => {
    const overviewCards = [
      {
        name: 'Total Revenue',
        value: formatCurrency(stats.totalRevenue),
        change: '+20.1%',
        changeType: 'positive',
        icon: TrendingUp,
        color: 'text-green-600'
      },
      {
        name: 'Total Expenses',
        value: formatCurrency(stats.totalExpenses),
        change: '+12.3%',
        changeType: 'negative',
        icon: TrendingDown,
        color: 'text-red-600'
      },
      {
        name: 'Net Profit',
        value: formatCurrency(stats.netProfit),
        change: '+15.7%',
        changeType: 'positive',
        icon: TrendingUp,
        color: 'text-green-600'
      },
      {
        name: 'Pending Invoices',
        value: formatCurrency(stats.pendingInvoices),
        change: '+5.2%',
        changeType: 'neutral',
        icon: CreditCard,
        color: 'text-blue-600'
      }
    ]

    const revenueData = [
      { name: 'Jan', value: 12000 },
      { name: 'Feb', value: 15000 },
      { name: 'Mar', value: 18000 },
      { name: 'Apr', value: 22000 },
      { name: 'May', value: 25000 },
      { name: 'Jun', value: 28000 }
    ]

    const expenseData = [
      { name: 'Jan', value: 8000 },
      { name: 'Feb', value: 10000 },
      { name: 'Mar', value: 12000 },
      { name: 'Apr', value: 14000 },
      { name: 'May', value: 16000 },
      { name: 'Jun', value: 18000 }
    ]

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card) => (
            <Card key={card.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.name}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className={`text-xs ${card.changeType === 'positive' ? 'text-green-600' : card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
                  {card.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent data={revenueData} height={300} />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={[
                  { name: 'Marketing', value: 30 },
                  { name: 'Development', value: 40 },
                  { name: 'Operations', value: 20 },
                  { name: 'Other', value: 10 }
                ]} height={300} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const renderTransactionsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <DollarSign className={`h-4 w-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderBudgetsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Budget Overview</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.allocated) * 100
          return (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle className="text-lg">{budget.name}</CardTitle>
                <CardDescription>{budget.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Spent</span>
                    <span className="text-sm">{formatCurrency(budget.spent)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Remaining: {formatCurrency(budget.remaining)}</span>
                    <span>{percentage.toFixed(1)}% used</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderInvoicesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Invoices</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>
      
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{invoice.number}</p>
                  <p className="text-sm text-muted-foreground">{invoice.client}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                  <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                </div>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderReportsTab = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Financial Reports</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={[
              { name: 'Jan', value: 12000 },
              { name: 'Feb', value: 15000 },
              { name: 'Mar', value: 18000 },
              { name: 'Apr', value: 22000 },
              { name: 'May', value: 25000 },
              { name: 'Jun', value: 28000 }
            ]} height={200} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={[
              { name: 'Marketing', value: 30 },
              { name: 'Development', value: 40 },
              { name: 'Operations', value: 20 },
              { name: 'Other', value: 10 }
            ]} height={200} />
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab()
      case 'transactions':
        return renderTransactionsTab()
      case 'budgets':
        return renderBudgetsTab()
      case 'invoices':
        return renderInvoicesTab()
      case 'reports':
        return renderReportsTab()
      default:
        return renderOverviewTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance</h1>
          <p className="text-muted-foreground">
            Manage your financial data and reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {renderTabContent()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Finance 