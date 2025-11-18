import { useState } from 'react'
import { useQuery } from 'wasp/client/operations'
import { getBudgetAlerts, createBudget, updateBudget, deleteBudget, getCategories } from 'wasp/client/operations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Plus, Target, Trash2, Edit, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'

export default function BudgetsPage() {
  const { data: budgetData, isLoading, error, refetch } = useQuery(getBudgetAlerts)
  const { data: categories } = useQuery(getCategories)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    amount: '',
    period: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createBudget({
        name: formData.name,
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: new Date(formData.startDate + 'T00:00:00'),
        endDate: undefined,
      })
      setIsCreateOpen(false)
      resetForm()
      refetch()
    } catch (error) {
      console.error('Erro ao criar orçamento:', error)
      alert('Erro ao criar orçamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBudget) return
    
    setIsSubmitting(true)
    try {
      await updateBudget({
        id: editingBudget.id,
        name: formData.name,
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: new Date(formData.startDate + 'T00:00:00'),
        endDate: undefined,
      })
      setIsEditOpen(false)
      setEditingBudget(null)
      resetForm()
      refetch()
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error)
      alert('Erro ao atualizar orçamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return
    
    try {
      await deleteBudget({ id })
      refetch()
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error)
      alert('Erro ao deletar orçamento')
    }
  }

  const openEditDialog = (budget: any) => {
    setEditingBudget(budget)
    setFormData({
      name: budget.name,
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      amount: '',
      period: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
    })
  }

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
        <div className="text-lg text-red-600">Erro ao carregar orçamentos: {error.message}</div>
      </div>
    )
  }

  const expenseCategories = categories?.filter((c: any) => c.type === 'EXPENSE') || []
  const budgets = budgetData?.budgets || []
  
  const getAlertIcon = (alertLevel: string) => {
    switch (alertLevel) {
      case 'exceeded':
        return <AlertCircle className="w-5 h-5" />
      case 'danger':
        return <AlertTriangle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'safe':
        return <CheckCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  const getAlertMessage = (budget: any) => {
    switch (budget.alertLevel) {
      case 'exceeded':
        return `Orçamento ultrapassado em ${formatCurrency(Math.abs(budget.remaining))}!`
      case 'danger':
        return `Atenção! ${budget.percentage.toFixed(0)}% do orçamento usado. Apenas ${formatCurrency(budget.remaining)} restante.`
      case 'warning':
        return `Cuidado! ${budget.percentage.toFixed(0)}% do orçamento já foi usado.`
      case 'safe':
        return `Orçamento sob controle. ${formatCurrency(budget.remaining)} ainda disponível.`
      default:
        return ''
    }
  }

  const BudgetForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void, isEdit?: boolean }) => (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Orçamento*</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Orçamento Alimentação Mensal"
            required
          />
        </div>
        <div>
          <Label htmlFor="categoryId">Categoria*</Label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Valor Limite*</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label htmlFor="period">Período*</Label>
            <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
                <SelectItem value="YEARLY">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="startDate">Data de Início*</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEdit ? 'Salvando...' : 'Criando...') : (isEdit ? 'Salvar' : 'Criar')}
        </Button>
      </DialogFooter>
    </form>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Orçamentos</h1>
            <p className="text-gray-600">Defina limites de gastos para suas categorias</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Orçamento</DialogTitle>
                <DialogDescription>Defina um limite de gastos para uma categoria</DialogDescription>
              </DialogHeader>
              <BudgetForm onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Alert Summary */}
        {budgetData && budgetData.alertCount > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-900">Alertas Críticos</p>
                    <p className="text-3xl font-bold text-red-600">{budgetData.dangerCount}</p>
                  </div>
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Avisos</p>
                    <p className="text-3xl font-bold text-yellow-600">{budgetData.warningCount}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total de Orçamentos</p>
                    <p className="text-3xl font-bold text-blue-600">{budgets.length}</p>
                  </div>
                  <Target className="w-12 h-12 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budgets List */}
        {!budgets || budgets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Nenhum orçamento cadastrado</p>
              <p className="text-sm text-gray-500 mb-4">
                Orçamentos ajudam você a controlar seus gastos por categoria
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Criar Primeiro Orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget: any) => {
              const periodLabels: Record<string, string> = {
                WEEKLY: 'Semanal',
                MONTHLY: 'Mensal',
                YEARLY: 'Anual',
              }
              const periodLabel = periodLabels[budget.period] || budget.period

              const colorClasses: Record<string, string> = {
                safe: 'border-green-500',
                warning: 'border-yellow-500',
                danger: 'border-orange-500',
                exceeded: 'border-red-500',
              }
              const colorClass = colorClasses[budget.alertLevel] || 'border-gray-300'

              const progressColors: Record<string, string> = {
                safe: 'bg-green-500',
                warning: 'bg-yellow-500',
                danger: 'bg-orange-500',
                exceeded: 'bg-red-500',
              }
              const progressColor = progressColors[budget.alertLevel] || 'bg-blue-500'

              return (
                <Card key={budget.id} className={`relative border-2 ${colorClass}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{budget.category?.icon}</span>
                        <span className="truncate">{budget.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(budget)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{budget.category?.name} • {periodLabel}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Alert Message */}
                      {budget.alertLevel !== 'safe' && (
                        <Alert variant={budget.alertLevel}>
                          {getAlertIcon(budget.alertLevel)}
                          <AlertDescription className="ml-7">
                            {getAlertMessage(budget)}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Budget Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className={budget.isOverBudget ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            Gasto: {formatCurrency(budget.spent)}
                          </span>
                          <span className="text-gray-600">
                            Limite: {formatCurrency(budget.amount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all ${progressColor}`}
                            style={{ 
                              width: `${Math.min(budget.percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>{budget.percentage.toFixed(1)}% utilizado</span>
                          {budget.remaining > 0 ? (
                            <span className="text-green-600 font-medium">
                              {formatCurrency(budget.remaining)} restante
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium">
                              {formatCurrency(Math.abs(budget.remaining))} acima
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Budget Info */}
                      <div className="pt-4 border-t text-sm text-gray-600">
                        <p>Iniciado em: {new Date(budget.startDate).toLocaleDateString('pt-BR')}</p>
                        {budget.isActive ? (
                          <p className="text-green-600 font-medium mt-1">● Ativo</p>
                        ) : (
                          <p className="text-gray-400 mt-1">○ Inativo</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Orçamento</DialogTitle>
              <DialogDescription>Atualize as informações do orçamento</DialogDescription>
            </DialogHeader>
            <BudgetForm onSubmit={handleEdit} isEdit />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

