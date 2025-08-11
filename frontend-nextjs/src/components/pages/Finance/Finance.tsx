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
  Target,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Send
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FinancialCharts from '@/components/Finance/FinancialCharts'
import TransactionModal from '@/components/Finance/TransactionModal'
import { useAuth } from '@/context/AuthContext'
import * as financeService from '@/services/financeService'
import { Transaction, Budget, Invoice, DashboardData } from '@/services/financeService'

const Finance = () => {
  const { logActivity } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [employees, setEmployees] = useState<Array<{ _id: string; firstName: string; lastName: string }>>([])
  const [projects, setProjects] = useState<Array<{ _id: string; name: string }>>([])
  
  // Filter states
  const [transactionFilters, setTransactionFilters] = useState({
    type: '',
    category: '',
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  })
  const [invoiceFilters, setInvoiceFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  })
  
  // Modal states
  const [transactionModal, setTransactionModal] = useState({ isOpen: false, transaction: null as Transaction | null })
  
  // Pagination states
  const [transactionPage, setTransactionPage] = useState(1)
  const [invoicePage, setInvoicePage] = useState(1)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: PieChart },
  ]

  useEffect(() => {
    logActivity('Finance Dashboard Visit', 'User accessed finance management')
    loadFinanceData()
    loadSupportingData()
  }, [logActivity])

  useEffect(() => {
    loadTransactions()
  }, [transactionFilters, transactionPage])

  useEffect(() => {
    loadInvoices()
  }, [invoiceFilters, invoicePage])

  const loadFinanceData = async () => {
    setLoading(true)
    try {
      const [dashboardResponse, budgetsResponse] = await Promise.all([
        financeService.getFinancialDashboard(),
        financeService.getBudgets()
      ])
      
      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data)
      }
      
      if (budgetsResponse.success) {
        setBudgets(budgetsResponse.data)
      }
    } catch (error) {
      console.error('Error loading finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSupportingData = async () => {
    try {
      // Load employees and projects for dropdowns
      const [employeesResponse, projectsResponse] = await Promise.all([
        fetch('/api/hr/employees', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()).catch(() => ({ success: false })),
        fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()).catch(() => ({ success: false }))
      ])
      
      if (employeesResponse.success) {
        setEmployees(employeesResponse.data)
      }
      
      if (projectsResponse.success) {
        setProjects(projectsResponse.data)
      }
    } catch (error) {
      console.error('Error loading supporting data:', error)
    }
  }

  const loadTransactions = async () => {
    try {
      const filters = { ...transactionFilters, page: transactionPage, limit: 20 }
      const response = await financeService.getTransactions(filters)
      
      if (response.success) {
        setTransactions(response.data)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const loadInvoices = async () => {
    try {
      const filters = { ...invoiceFilters, page: invoicePage, limit: 20 }
      const response = await financeService.getInvoices(filters)
      
      if (response.success) {
        setInvoices(response.data)
      }
    } catch (error) {
      console.error('Error loading invoices:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([
      loadFinanceData(),
      loadTransactions(),
      loadInvoices()
    ])
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4" />
    if (value < 0) return <ArrowDownRight className="h-4 w-4" />
    return null
  }

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-50/80 text-green-700 border border-green-200/50',
      pending: 'bg-yellow-50/80 text-yellow-700 border border-yellow-200/50',
      overdue: 'bg-red-50/80 text-red-700 border border-red-200/50',
      draft: 'bg-gray-50/80 text-gray-700 border border-gray-200/50',
      sent: 'bg-blue-50/80 text-blue-700 border border-blue-200/50',
      paid: 'bg-green-50/80 text-green-700 border border-green-200/50',
      cancelled: 'bg-gray-50/80 text-gray-700 border border-gray-200/50',
      failed: 'bg-red-50/80 text-red-700 border border-red-200/50'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircle className="h-4 w-4" />,
      pending: <Clock className="h-4 w-4" />,
      overdue: <AlertTriangle className="h-4 w-4" />,
      draft: <FileText className="h-4 w-4" />,
      sent: <Clock className="h-4 w-4" />,
      paid: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />,
      failed: <XCircle className="h-4 w-4" />
    }
    return icons[status as keyof typeof icons] || icons.draft
  }

  // Modal handlers
  const handleTransactionSuccess = (transaction: Transaction) => {
    loadTransactions()
    loadFinanceData() // Refresh dashboard
  }

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await financeService.deleteTransaction(id)
        loadTransactions()
        loadFinanceData()
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    }
  }

  const handleUpdateInvoiceStatus = async (id: string, status: string) => {
    try {
      await financeService.updateInvoiceStatus(id, status)
      loadInvoices()
      loadFinanceData()
    } catch (error) {
      console.error('Error updating invoice status:', error)
    }
  }

  const renderOverviewTab = () => {
    if (!dashboardData) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500 mb-4"></div>
          <span className="text-gray-600 font-medium tracking-tight">Loading financial dashboard...</span>
          <p className="text-sm text-gray-500 mt-2 font-medium">Calculating financial metrics and trends</p>
        </div>
      )
    }

    const { summary, charts, budgetVsActual, recentTransactions, overdueInvoices } = dashboardData

    const overviewCards = [
      {
        name: 'Monthly Income',
        value: formatCurrency(summary.currentMonth.income),
        change: formatPercentage(summary.changes.incomeChange),
        changeValue: summary.changes.incomeChange,
        icon: TrendingUp,
        color: 'text-green-600'
      },
      {
        name: 'Monthly Expenses',
        value: formatCurrency(summary.currentMonth.expenses),
        change: formatPercentage(summary.changes.expenseChange),
        changeValue: summary.changes.expenseChange,
        icon: TrendingDown,
        color: 'text-red-600'
      },
      {
        name: 'Net Profit',
        value: formatCurrency(summary.currentMonth.profit),
        change: formatPercentage(summary.changes.profitChange),
        changeValue: summary.changes.profitChange,
        icon: DollarSign,
        color: 'text-blue-600'
      },
      {
        name: 'Pending Invoices',
        value: `${summary.invoices.pending} invoices`,
        change: formatCurrency(summary.invoices.totalReceivables),
        changeValue: 0,
        icon: CreditCard,
        color: 'text-orange-600'
      }
    ]

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card, index) => {
            const Icon = card.icon
            const iconColorMap = {
              'text-green-600': 'bg-green-50 text-green-500',
              'text-red-600': 'bg-red-50 text-red-500',
              'text-blue-600': 'bg-blue-50 text-blue-500',
              'text-orange-600': 'bg-orange-50 text-orange-500'
            }
            const iconBgColor = iconColorMap[card.color as keyof typeof iconColorMap] || 'bg-gray-50 text-gray-500'
            
            return (
              <Card 
                key={index} 
                className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 tracking-tight">{card.name}</p>
                      <p className="metric-number text-4xl text-gray-900 mt-1">{card.value}</p>
                      <div className="flex items-center mt-2">
                        <span className={`flex items-center text-sm font-medium tracking-tight ${getChangeColor(card.changeValue)}`}>
                          {getChangeIcon(card.changeValue)}
                          <span className="ml-1">{card.change}</span>
                        </span>
                        <span className="text-sm text-gray-500 ml-1 font-medium">from last month</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${iconBgColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="col-span-4 rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Revenue Trends</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                12-month income, expenses, and profit trends with precision analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <FinancialCharts.RevenueTrendChart 
                data={charts.monthlyTrends} 
                height={300} 
              />
            </CardContent>
          </Card>

          <Card className="col-span-3 rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
            <CardHeader className="p-0 pb-6">
              <CardTitle className="card-title text-gray-900">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
                Latest financial activities and cash flow
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3">
                {recentTransactions.slice(0, 6).map((transaction, index) => (
                  <div 
                    key={transaction._id} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50/50 rounded-xl transition-all duration-200 ease-out animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-gray-900 tracking-tight leading-none">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 font-medium tracking-tight capitalize">
                          {transaction.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold tracking-tight ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium tracking-tight">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm font-medium text-gray-500">No recent transactions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="card-title text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
              Common financial operations for efficient workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div 
                className="group cursor-pointer rounded-2xl bg-white/60 backdrop-blur-sm p-6 border border-gray-200/50 hover:bg-white/80 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out"
                onClick={() => setTransactionModal({ isOpen: true, transaction: null })}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors duration-200">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tracking-tight">Add Transaction</span>
                  <span className="text-xs text-gray-500 font-medium text-center">Create new income or expense</span>
                </div>
              </div>
              
              <div 
                className="group cursor-pointer rounded-2xl bg-white/60 backdrop-blur-sm p-6 border border-gray-200/50 hover:bg-white/80 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out"
                onClick={() => {/* setInvoiceModal({ isOpen: true, invoice: null }) */}}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-green-50 text-green-500 group-hover:bg-green-100 transition-colors duration-200">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tracking-tight">Create Invoice</span>
                  <span className="text-xs text-gray-500 font-medium text-center">Generate client invoices</span>
                </div>
              </div>
              
              <div 
                className="group cursor-pointer rounded-2xl bg-white/60 backdrop-blur-sm p-6 border border-gray-200/50 hover:bg-white/80 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out"
                onClick={() => {/* setBudgetModal({ isOpen: true, budget: null }) */}}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-purple-50 text-purple-500 group-hover:bg-purple-100 transition-colors duration-200">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tracking-tight">Set Budget</span>
                  <span className="text-xs text-gray-500 font-medium text-center">Plan financial limits</span>
                </div>
              </div>
              
              <div 
                className="group cursor-pointer rounded-2xl bg-white/60 backdrop-blur-sm p-6 border border-gray-200/50 hover:bg-white/80 hover:shadow-md hover:-translate-y-1 transition-all duration-200 ease-out"
                onClick={() => setActiveTab('reports')}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-orange-50 text-orange-500 group-hover:bg-orange-100 transition-colors duration-200">
                    <Download className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tracking-tight">View Reports</span>
                  <span className="text-xs text-gray-500 font-medium text-center">Financial analytics</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTransactionsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="card-title text-gray-900">Transactions</h3>
            <p className="text-sm text-gray-600 font-medium tracking-tight">Manage your financial transactions with precision</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => setTransactionModal({ isOpen: true, transaction: null })}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions with precision..."
                    value={transactionFilters.search}
                    onChange={(e) => setTransactionFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-12 rounded-xl bg-white/60 backdrop-blur-sm border-gray-200/50 text-gray-900 font-medium tracking-tight"
                  />
                </div>
              </div>
              
              <select 
                value={transactionFilters.type}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-4 py-3 border border-gray-200/50 bg-white/60 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-900 tracking-tight focus:outline-none focus:bg-white/80 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/50"
              >
                <option value="">All Types</option>
                <option value="income">💰 Income</option>
                <option value="expense">💸 Expense</option>
              </select>
              
              <select 
                value={transactionFilters.category}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-3 border border-gray-200/50 bg-white/60 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-900 tracking-tight focus:outline-none focus:bg-white/80 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/50"
              >
                <option value="">All Categories</option>
                {financeService.getIncomeCategories().concat(financeService.getExpenseCategories()).map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select 
                value={transactionFilters.status}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-3 border border-gray-200/50 bg-white/60 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-900 tracking-tight focus:outline-none focus:bg-white/80 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/50"
              >
                <option value="">All Status</option>
                <option value="completed">✅ Completed</option>
                <option value="pending">⏳ Pending</option>
                <option value="cancelled">❌ Cancelled</option>
                <option value="failed">⚠️ Failed</option>
              </select>

              <Button 
                variant="outline" 
                onClick={() => setTransactionFilters({
                  type: '', category: '', status: '', search: '', startDate: '', endDate: ''
                })}
                className="flex items-center rounded-xl bg-white/60 backdrop-blur-sm text-gray-700 px-4 py-3 hover:bg-white/80 transition-all duration-200 ease-out border border-gray-200/50 shadow-sm font-medium tracking-tight"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="card-title text-gray-900">All Transactions</CardTitle>
            <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
              Complete list of your financial transactions with detailed information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              {transactions.map((transaction, index) => (
                <div 
                  key={transaction._id} 
                  className="flex items-center justify-between p-5 border border-gray-100/50 rounded-2xl bg-gray-50/30 hover:bg-gray-50/50 transition-all duration-200 ease-out animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${transaction.type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 tracking-tight">{transaction.description}</p>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="capitalize text-gray-600 font-medium tracking-tight">{transaction.category.replace('_', ' ')}</span>
                        <Badge className={`rounded-lg px-2 py-1 text-xs font-semibold tracking-tight ${getStatusColor(transaction.status)}`}>
                          <span className="flex items-center">
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">{transaction.status}</span>
                          </span>
                        </Badge>
                      </div>
                      {transaction.linkedProject && (
                        <p className="text-xs text-gray-500 font-medium tracking-tight">
                          Project: {transaction.linkedProject.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-1">
                      <p className={`font-bold text-lg tracking-tight ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-600 font-medium tracking-tight">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 font-medium tracking-tight capitalize">
                        {transaction.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setTransactionModal({ isOpen: true, transaction })}
                        className="rounded-lg bg-blue-50/50 text-blue-600 border-blue-200/50 hover:bg-blue-100/80 h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        className="rounded-lg bg-red-50/50 text-red-600 border-red-200/50 hover:bg-red-100/80 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <p className="text-lg font-bold text-gray-900 mb-2">No transactions found</p>
                  <p className="text-sm text-gray-600 font-medium tracking-tight mb-6">Try adjusting your filters or add a new transaction</p>
                  <Button 
                    onClick={() => setTransactionModal({ isOpen: true, transaction: null })}
                    className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Transaction
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderBudgetsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="card-title text-gray-900">Budget Overview</h3>
          <p className="text-sm text-gray-600 font-medium tracking-tight">Monitor and manage your budget allocations</p>
        </div>
        <Button className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out">
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {budgets.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <p className="text-lg font-bold text-gray-900 mb-2">No budgets set</p>
            <p className="text-sm text-gray-600 font-medium tracking-tight mb-6">Create your first budget to track spending</p>
            <Button className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out">
              <Plus className="mr-2 h-4 w-4" />
              Create First Budget
            </Button>
          </div>
        ) : (
          budgets.map((budget, index) => {
          const actualSpent = dashboardData?.budgetVsActual?.find(b => b.category === budget.category)?.actual || 0
          const percentage = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0
          const getProgressColor = () => {
            if (percentage > 80) return 'bg-gradient-to-r from-red-400 to-red-500'
            if (percentage > 60) return 'bg-gradient-to-r from-yellow-400 to-orange-500'
            return 'bg-gradient-to-r from-green-400 to-green-500'
          }
          const getIconColor = () => {
            if (percentage > 80) return 'bg-red-50 text-red-500'
            if (percentage > 60) return 'bg-yellow-50 text-yellow-500'
            return 'bg-green-50 text-green-500'
          }
          
          return (
            <Card 
              key={budget._id}
              className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 tracking-tight capitalize">{budget.category.replace('_', ' ')}</CardTitle>
                    <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">{budget.name}</CardDescription>
                  </div>
                  <div className={`p-3 rounded-full ${getIconColor()}`}>
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600 tracking-tight">Spent</span>
                    <span className="text-sm font-bold text-gray-900 tracking-tight">{formatCurrency(actualSpent)}</span>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">Budget: {formatCurrency(budget.amount)}</span>
                    <span className="font-bold text-gray-900">{percentage.toFixed(1)}% used</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }))}
      </div>
    </div>
  )

  const renderInvoicesTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="card-title text-gray-900">Invoices</h3>
          <p className="text-sm text-gray-600 font-medium tracking-tight">Manage and track your invoice payments</p>
        </div>
        <Button className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>
      
      <div className="space-y-4">
        {invoices.map((invoice, index) => (
          <Card 
            key={invoice._id}
            className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0 transition-all duration-200 hover:shadow-md hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-blue-50 text-blue-500">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 tracking-tight">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600 font-medium tracking-tight">{invoice.clientName}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-lg text-gray-900 tracking-tight">{formatCurrency(invoice.total)}</p>
                  <p className="text-sm text-gray-600 font-medium tracking-tight">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <Badge className={`rounded-lg px-3 py-1 text-xs font-semibold tracking-tight ${getStatusColor(invoice.status)}`}>
                  <span className="flex items-center">
                    {getStatusIcon(invoice.status)}
                    <span className="ml-1 capitalize">{invoice.status}</span>
                  </span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {invoices.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <p className="text-lg font-bold text-gray-900 mb-2">No invoices found</p>
            <p className="text-sm text-gray-600 font-medium tracking-tight mb-6">Create your first invoice to get started</p>
            <Button className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out">
              <Plus className="mr-2 h-4 w-4" />
              Create First Invoice
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="card-title text-gray-900">Financial Reports</h3>
        <p className="text-sm text-gray-600 font-medium tracking-tight">Comprehensive financial analytics and insights</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="card-title text-gray-900">Monthly Revenue</CardTitle>
            <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
              Revenue trends and comparisons over time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {dashboardData && dashboardData.charts.monthlyTrends.length > 0 ? (
              <FinancialCharts.MonthlyComparisonChart 
                data={dashboardData.charts.monthlyTrends} 
                height={200} 
              />
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-500">No revenue data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border-0">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="card-title text-gray-900">Expense Categories</CardTitle>
            <CardDescription className="text-gray-600 font-medium tracking-tight mt-1">
              Breakdown of expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {dashboardData && dashboardData.charts.expenseByCategory.length > 0 ? (
              <FinancialCharts.ExpensePieChart 
                data={dashboardData.charts.expenseByCategory} 
                height={200} 
              />
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-500">No expense data available</p>
              </div>
            )}
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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title text-gray-900">Finance & Budgeting</h1>
          <p className="text-gray-600 mt-1 font-medium tracking-tight">
            Premium financial management with enterprise-grade precision
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('reports')}
            className="rounded-xl bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 hover:bg-white transition-all duration-200 ease-out border border-gray-200 shadow-sm font-medium tracking-tight"
          >
            <Download className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button 
            size="sm"
            onClick={() => setTransactionModal({ isOpen: true, transaction: null })}
            className="rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 font-semibold tracking-tight shadow-sm hover:shadow-md transition-all duration-200 ease-out"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="rounded-2xl bg-white/80 backdrop-blur-sm p-2 shadow-sm border-0 gap-1">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="flex items-center space-x-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-500 data-[state=active]:text-white font-medium tracking-tight px-4 py-2"
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500 mb-4"></div>
            <span className="text-gray-600 font-medium tracking-tight">Loading financial data...</span>
          </div>
        )}

        <TabsContent value={activeTab} className="space-y-4">
          {!loading && renderTabContent()}
        </TabsContent>
      </Tabs>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={transactionModal.isOpen}
        onClose={() => setTransactionModal({ isOpen: false, transaction: null })}
        transaction={transactionModal.transaction}
        onSuccess={handleTransactionSuccess}
        employees={employees}
        projects={projects}
      />
    </div>
  )
}

export default Finance