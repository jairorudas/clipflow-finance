import { useQuery } from 'wasp/client/operations'
import { getDashboardStats, getBudgetAlerts } from 'wasp/client/operations'
import { Link } from 'wasp/client/router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertTriangle,
  AlertCircle,
  Bell
} from 'lucide-react'

export default function FinanceDashboardPage() {
  const { data: stats, isLoading, error } = useQuery(getDashboardStats)
  const { data: budgetAlerts } = useQuery(getBudgetAlerts)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Erro ao carregar dados: {error.message}</div>
      </div>
    )
  }

  if (!stats) return null

  const balance = stats.totalBalance || 0
  const monthlyBalance = (stats.monthlyIncome || 0) - (stats.monthlyExpenses || 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Financeiro</h1>
          <p className="text-gray-600">Visão geral das suas finanças pessoais</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <Link to="/transactions">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </Link>
          <Link to="/accounts">
            <Button variant="outline" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Gerenciar Contas
            </Button>
          </Link>
          <Link to="/categories">
            <Button variant="outline" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Categorias
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.accountsCount} conta(s)
              </p>
            </CardContent>
          </Card>

          {/* Monthly Income */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.monthlyIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Este mês
              </p>
            </CardContent>
          </Card>

          {/* Monthly Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.monthlyExpenses)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Este mês
              </p>
            </CardContent>
          </Card>

          {/* Monthly Balance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balanço Mensal</CardTitle>
              {monthlyBalance >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(monthlyBalance))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {monthlyBalance >= 0 ? 'Lucro' : 'Prejuízo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alerts */}
        {budgetAlerts && budgetAlerts.alertCount > 0 && (
          <Card className="mb-8 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-600" />
                Alertas de Orçamento
              </CardTitle>
              <CardDescription>
                {budgetAlerts.alertCount} orçamento(s) requerem atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budgetAlerts.budgets
                  .filter((b: any) => b.alertLevel !== 'safe')
                  .slice(0, 3)
                  .map((budget: any) => (
                    <Alert 
                      key={budget.id} 
                      variant={budget.alertLevel}
                      className="transition-all hover:shadow-md"
                    >
                      {budget.alertLevel === 'exceeded' ? (
                        <AlertCircle className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                      <div className="ml-7">
                        <AlertTitle className="mb-1">
                          {budget.category?.icon} {budget.category?.name}
                        </AlertTitle>
                        <AlertDescription>
                          {budget.alertLevel === 'exceeded' && (
                            <>
                              <strong>Orçamento ultrapassado!</strong> Você gastou{' '}
                              <strong>{formatCurrency(budget.spent)}</strong> de{' '}
                              <strong>{formatCurrency(budget.amount)}</strong> ({budget.percentage.toFixed(0)}%).
                              Excedeu em <strong>{formatCurrency(Math.abs(budget.remaining))}</strong>.
                            </>
                          )}
                          {budget.alertLevel === 'danger' && (
                            <>
                              <strong>Atenção!</strong> Você já gastou{' '}
                              <strong>{budget.percentage.toFixed(0)}%</strong> do orçamento.
                              Apenas <strong>{formatCurrency(budget.remaining)}</strong> restante.
                            </>
                          )}
                          {budget.alertLevel === 'warning' && (
                            <>
                              <strong>Cuidado!</strong> {budget.percentage.toFixed(0)}% do orçamento já foi utilizado.
                              Restam <strong>{formatCurrency(budget.remaining)}</strong>.
                            </>
                          )}
                        </AlertDescription>
                      </div>
                    </Alert>
                  ))}
                {budgetAlerts.alertCount > 3 && (
                  <Link to="/budgets">
                    <Button variant="outline" className="w-full mt-2">
                      Ver todos os {budgetAlerts.alertCount} alertas
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas 10 transações</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma transação encontrada</p>
                  <Link to="/transactions">
                    <Button variant="link" className="mt-2">
                      Criar primeira transação
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.category?.name || 'Sem categoria'} • {transaction.account.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                  <Link to="/transactions">
                    <Button variant="link" className="w-full">
                      Ver todas as transações
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>Este mês</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.expensesByCategory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma despesa encontrada</p>
                  <Link to="/categories">
                    <Button variant="link" className="mt-2">
                      Criar categorias
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.expensesByCategory.map((category: any) => {
                    const percentage = stats.monthlyExpenses > 0 
                      ? (category.total / stats.monthlyExpenses * 100).toFixed(1)
                      : '0'
                    
                    return (
                      <div key={category.categoryName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {category.color && (
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            <span className="text-sm font-medium">{category.categoryName}</span>
                          </div>
                          <span className="text-sm font-bold">{formatCurrency(category.total)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: category.color || '#6366f1'
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">{percentage}% do total</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

