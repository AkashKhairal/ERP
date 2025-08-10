import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import * as financeService from '../../services/financeService';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats] = useState({
    totalRevenue: 45231,
    totalExpenses: 23450,
    netProfit: 21781,
    pendingInvoices: 12500
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: PieChart },
  ];

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    setLoading(true);
    try {
      const [transactionsData, budgetsData, invoicesData] = await Promise.all([
        financeService.getTransactions().catch(() => ({ data: { transactions: [] } })),
        financeService.getBudgets().catch(() => ({ data: { budgets: [] } })),
        financeService.getInvoices().catch(() => ({ data: { invoices: [] } }))
      ]);
      
      setTransactions(transactionsData?.data?.transactions || transactionsData?.data || []);
      setBudgets(budgetsData?.data?.budgets || budgetsData?.data || []);
      setInvoices(invoicesData?.data?.invoices || invoicesData?.data || []);
    } catch (error) {
      console.error('Error loading finance data:', error);
      // Set empty arrays as fallback
      setTransactions([]);
      setBudgets([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.draft;
  };

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
        change: '+12.5%',
        changeType: 'negative',
        icon: TrendingDown,
        color: 'text-red-600'
      },
      {
        name: 'Net Profit',
        value: formatCurrency(stats.netProfit),
        change: '+15.3%',
        changeType: 'positive',
        icon: DollarSign,
        color: 'text-blue-600'
      },
      {
        name: 'Pending Invoices',
        value: formatCurrency(stats.pendingInvoices),
        change: '5 invoices',
        changeType: 'neutral',
        icon: CreditCard,
        color: 'text-orange-600'
      }
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.name}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={card.changeType === 'positive' ? 'text-green-600' : card.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'}>
                      {card.change}
                    </span> from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Monthly revenue and expense trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Revenue chart will be displayed here</p>
                </div>
              </div>
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
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category}
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
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Plus className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Add Transaction</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Create Invoice</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Set Budget</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-3 p-4 h-auto">
                <Download className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Export Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTransactionsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Transactions</h3>
            <p className="text-sm text-muted-foreground">Manage your financial transactions</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                
                <select className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">All Categories</option>
                  <option value="salary">Salary</option>
                  <option value="marketing">Marketing</option>
                  <option value="tools">Tools</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              A list of your recent financial transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderBudgetsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Budgets</h3>
            <p className="text-sm text-muted-foreground">Track your budget allocations</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget._id}>
              <CardHeader>
                <CardTitle className="text-lg">{budget.category}</CardTitle>
                <CardDescription>{budget.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Spent</span>
                    <span>{formatCurrency(budget.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Budget</span>
                    <span>{formatCurrency(budget.amount)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${budget.spent > budget.amount ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min((budget.spent / budget.amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {budget.spent > budget.amount ? 'Over budget' : 'Under budget'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderInvoicesTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Invoices</h3>
            <p className="text-sm text-muted-foreground">Manage your invoices</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {invoices.map((invoice) => (
            <Card key={invoice._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">#{invoice.invoiceNumber}</CardTitle>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
                <CardDescription>{invoice.clientName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Amount</span>
                    <span className="font-medium">{formatCurrency(invoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Due Date</span>
                    <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <span className="capitalize">{invoice.status}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderReportsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Financial Reports</h3>
            <p className="text-sm text-muted-foreground">Generate and view financial reports</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss</CardTitle>
              <CardDescription>Monthly P&L statement</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download P&L
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow</CardTitle>
              <CardDescription>Cash flow analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Cash Flow
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Report</CardTitle>
              <CardDescription>Budget vs actual analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Budget Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'transactions':
        return renderTransactionsTab();
      case 'budgets':
        return renderBudgetsTab();
      case 'invoices':
        return renderInvoicesTab();
      case 'reports':
        return renderReportsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Finance & Budgeting</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Manage your income, expenses, budgets, and financial reports.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading finance data...</span>
          </div>
        )}

        {/* Tab Content */}
        {!loading && (
          <TabsContent value={activeTab} className="space-y-6">
            {renderTabContent()}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Finance; 