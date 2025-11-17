import { useState } from 'react'
import { useQuery } from 'wasp/client/operations'
import { getAccounts, createAccount, updateAccount, deleteAccount } from 'wasp/client/operations'
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
import { Plus, Wallet, Trash2, Edit, Eye, EyeOff } from 'lucide-react'
import { AccountType } from '@prisma/client'

const accountTypeLabels: Record<AccountType, string> = {
  CHECKING: 'Conta Corrente',
  SAVINGS: 'Poupança',
  CREDIT_CARD: 'Cartão de Crédito',
  CASH: 'Dinheiro',
  INVESTMENT: 'Investimento',
  OTHER: 'Outro',
}

const accountColors = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'
]

export default function AccountsPage() {
  const { data: accounts, isLoading, error, refetch } = useQuery(getAccounts)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    type: 'CHECKING' as AccountType,
    initialBalance: '0',
    currency: 'BRL',
    color: accountColors[0],
    description: '',
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
      await createAccount({
        name: formData.name,
        icon: formData.icon || null,
        type: formData.type,
        initialBalance: parseFloat(formData.initialBalance),
        currency: formData.currency,
        color: formData.color,
        description: formData.description || null,
      })
      setIsCreateOpen(false)
      setFormData({
        name: '',
        icon: '',
        type: 'CHECKING',
        initialBalance: '0',
        currency: 'BRL',
        color: accountColors[0],
        description: '',
      })
      refetch()
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      alert('Erro ao criar conta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAccount) return
    
    setIsSubmitting(true)
    try {
      await updateAccount({
        id: editingAccount.id,
        name: formData.name,
        type: formData.type,
        color: formData.color,
        description: formData.description || null,
      })
      setIsEditOpen(false)
      setEditingAccount(null)
      refetch()
    } catch (error) {
      console.error('Erro ao atualizar conta:', error)
      alert('Erro ao atualizar conta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return
    
    try {
      await deleteAccount({ id })
      refetch()
    } catch (error) {
      console.error('Erro ao deletar conta:', error)
      alert('Erro ao deletar conta')
    }
  }

  const openEditDialog = (account: any) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      icon: account.icon ?? '',
      initialBalance: account.initialBalance.toString(),
      currency: account.currency,
      color: account.color ?? accountColors[0],
      description: account.description ?? '',
    })
    setIsEditOpen(true)
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
        <div className="text-lg text-red-600">Erro ao carregar contas: {error.message}</div>
      </div>
    )
  }

  const totalBalance = accounts?.reduce((sum: number, account: any) => sum + account.balance, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Contas</h1>
            <p className="text-gray-600">Gerencie suas contas bancárias e carteiras</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Conta</DialogTitle>
                <DialogDescription>Adicione uma nova conta bancária ou carteira</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Conta*</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Conta Corrente Itaú"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo*</Label>
                    <Select value={formData.type} onValueChange={(value: AccountType) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(accountTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="initialBalance">Saldo Inicial*</Label>
                    <Input
                      id="initialBalance"
                      type="number"
                      step="0.01"
                      value={formData.initialBalance}
                      onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Cor</Label>
                    <div className="flex gap-2 mt-2">
                      {accountColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição opcional"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Criando...' : 'Criar Conta'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Saldo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-sm text-gray-500 mt-2">{accounts?.length || 0} conta(s) ativa(s)</p>
          </CardContent>
        </Card>

        {/* Accounts Grid */}
        {!accounts || accounts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma conta cadastrada</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Criar Primeira Conta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account: any) => (
              <Card key={account.id} className="relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-full h-2"
                  style={{ backgroundColor: account.color || '#6366f1' }}
                />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{account.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(account)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>{accountTypeLabels[account.type as AccountType]}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{formatCurrency(account.balance)}</div>
                  {account.description && (
                    <p className="text-sm text-gray-600">{account.description}</p>
                  )}
                  <div className="mt-4 text-xs text-gray-500">
                    Criado em {new Date(account.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Conta</DialogTitle>
              <DialogDescription>Atualize as informações da conta</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nome da Conta*</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Tipo*</Label>
                  <Select value={formData.type} onValueChange={(value: AccountType) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(accountTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-color">Cor</Label>
                  <div className="flex gap-2 mt-2">
                    {accountColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Input
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

