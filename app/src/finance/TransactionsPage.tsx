import { useState } from 'react'
import { useQuery } from 'wasp/client/operations'
import { 
  getTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  getAccounts,
  getCategories
} from 'wasp/client/operations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
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
import { Plus, ArrowUpRight, ArrowDownRight, Trash2, Edit, Filter } from 'lucide-react'
import { TransactionType } from '@prisma/client'

const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferência',
}

export default function TransactionsPage() {
  const { data: transactions, isLoading, error, refetch } = useQuery(getTransactions, {})
  const { data: accounts } = useQuery(getAccounts)
  const { data: categories } = useQuery(getCategories)
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL')

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE' as TransactionType,
    accountId: '',
    categoryId: '',
    notes: '',
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
      await createTransaction({
        transferFromAccountId: null,
        transferToAccountId: null,
        recurringFrequency: null,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date + 'T12:00:00'),
        type: formData.type,
        accountId: formData.accountId,
        categoryId: formData.categoryId || null,
        notes: formData.notes || null,
        tags: [],
        isRecurring: false,
      })
      setIsCreateOpen(false)
      resetForm()
      refetch()
    } catch (error) {
      console.error('Erro ao criar transação:', error)
      alert('Erro ao criar transação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaction) return
    
    setIsSubmitting(true)
    try {
      await updateTransaction({
        id: editingTransaction.id,
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date + 'T12:00:00'),
        type: formData.type,
        accountId: formData.accountId,
        categoryId: formData.categoryId || null,
        notes: formData.notes || null,
      })
      setIsEditOpen(false)
      setEditingTransaction(null)
      resetForm()
      refetch()
    } catch (error) {
      console.error('Erro ao atualizar transação:', error)
      alert('Erro ao atualizar transação')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    
    try {
      await deleteTransaction({ id })
      refetch()
    } catch (error) {
      console.error('Erro ao deletar transação:', error)
      alert('Erro ao deletar transação')
    }
  }

  const openEditDialog = (transaction: any) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      date: new Date(transaction.date).toISOString().split('T')[0],
      type: transaction.type,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId ?? '',
      notes: transaction.notes ?? '',
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      accountId: accounts?.[0]?.id || '',
      categoryId: '',
      notes: '',
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
        <div className="text-lg text-red-600">Erro ao carregar transações: {error.message}</div>
      </div>
    )
  }

  // Filter transactions
  const filteredTransactions = filterType === 'ALL' 
    ? transactions 
    : transactions?.filter((t: any) => t.type === filterType)

  // Calculate totals
  const totalIncome = transactions?.filter((t: any) => t.type === 'INCOME')
    .reduce((sum: number, t: any) => sum + t.amount, 0) || 0
  const totalExpense = transactions?.filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: number, t: any) => sum + t.amount, 0) || 0

  const TransactionForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void, isEdit?: boolean }) => (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="type">Tipo*</Label>
          <Select value={formData.type} onValueChange={(value: TransactionType) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Receita</SelectItem>
              <SelectItem value="EXPENSE">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="description">Descrição*</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Supermercado, Salário"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Valor*</Label>
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
            <Label htmlFor="date">Data*</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="accountId">Conta*</Label>
          <Select 
            value={formData.accountId} 
            onValueChange={(value) => setFormData({ ...formData, accountId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma conta" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account: any) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="categoryId">Categoria</Label>
          <Select 
            value={formData.categoryId} 
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem categoria</SelectItem>
              {categories?.filter((c: any) => c.type === formData.type).map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionais (opcional)"
            rows={3}
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Transações</h1>
            <p className="text-gray-600">Gerencie suas receitas e despesas</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
                <DialogDescription>Adicione uma nova receita ou despesa</DialogDescription>
              </DialogHeader>
              <TransactionForm onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalIncome - totalExpense)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('ALL')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterType === 'INCOME' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('INCOME')}
                >
                  Receitas
                </Button>
                <Button
                  variant={filterType === 'EXPENSE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('EXPENSE')}
                >
                  Despesas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        {!filteredTransactions || filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">Nenhuma transação encontrada</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Criar Primeira Transação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'INCOME' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{transaction.category?.name || 'Sem categoria'}</span>
                          <span>•</span>
                          <span>{transaction.account.name}</span>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {transaction.notes && (
                          <p className="text-xs text-gray-500 mt-1">{transaction.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-xl font-bold ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(transaction)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Transação</DialogTitle>
              <DialogDescription>Atualize os dados da transação</DialogDescription>
            </DialogHeader>
            <TransactionForm onSubmit={handleEdit} isEdit />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

