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
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.name}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <span className={getChangeColor(card.changeValue)}>
                      {getChangeIcon(card.changeValue)}
                      {card.change}
                    </span>
                    <span className="ml-1">from last month</span>
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                12-month income, expenses, and profit trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialCharts.RevenueTrendChart 
                data={charts.monthlyTrends} 
                height={300} 
              />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest financial activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.slice(0, 6).map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent transactions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common financial operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto hover:bg-blue-50"
                onClick={() => setTransactionModal({ isOpen: true, transaction: null })}
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Add Transaction</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto hover:bg-green-50"
                onClick={() => {/* setInvoiceModal({ isOpen: true, invoice: null }) */}}
              >
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Create Invoice</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto hover:bg-purple-50"
                onClick={() => {/* setBudgetModal({ isOpen: true, budget: null }) */}}
              >
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Set Budget</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto hover:bg-orange-50"
                onClick={() => setActiveTab('reports')}
              >
                <Download className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTransactionsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Transactions</h3>
            <p className="text-sm text-muted-foreground">Manage your financial transactions</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setTransactionModal({ isOpen: true, transaction: null })}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={transactionFilters.search}
                    onChange={(e) => setTransactionFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select 
                value={transactionFilters.type}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              
              <select 
                value={transactionFilters.category}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Categories</option>
                {financeService.getIncomeCategories().concat(financeService.getExpenseCategories()).map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select 
                value={transactionFilters.status}
                onChange={(e) => setTransactionFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>

              <Button 
                variant="outline" 
                onClick={() => setTransactionFilters({
                  type: '', category: '', status: '', search: '', startDate: '', endDate: ''
                })}
                className="flex items-center"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              A list of your financial transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="capitalize">{transaction.category.replace('_', ' ')}</span>
                        <Badge className={getStatusColor(transaction.status)} variant="secondary">
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1">{transaction.status}</span>
                        </Badge>
                      </div>
                      {transaction.linkedProject && (
                        <p className="text-xs text-muted-foreground">
                          Project: {transaction.linkedProject.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {transaction.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setTransactionModal({ isOpen: true, transaction })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No transactions found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new transaction</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setTransactionModal({ isOpen: true, transaction: null })}
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
          const actualSpent = dashboardData?.budgetVsActual?.find(b => b.category === budget.category)?.actual || 0
          const percentage = budget.amount > 0 ? (actualSpent / budget.amount) * 100 : 0
          return (
            <Card key={budget._id}>
              <CardHeader>
                <CardTitle className="text-lg capitalize">{budget.category.replace('_', ' ')}</CardTitle>
                <CardDescription>{budget.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Spent</span>
                    <span className="text-sm">{formatCurrency(actualSpent)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Budget: {formatCurrency(budget.amount)}</span>
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
          <Card key={invoice._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(invoice.total)}</p>
                  <p className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
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
            {dashboardData && (
              <FinancialCharts.MonthlyComparisonChart 
                data={dashboardData.charts.monthlyTrends} 
                height={200} 
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData && dashboardData.charts.expenseByCategory.length > 0 && (
              <FinancialCharts.ExpensePieChart 
                data={dashboardData.charts.expenseByCategory} 
                height={200} 
              />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance & Budgeting</h1>
          <p className="text-muted-foreground">
            Comprehensive financial management for your business
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveTab('reports')}
          >
            <Download className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button 
            size="sm"
            onClick={() => setTransactionModal({ isOpen: true, transaction: null })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading finance data...</span>
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