import { useState } from 'react'
import { useQuery } from 'wasp/client/operations'
import { getCategories, createCategory, updateCategory, deleteCategory } from 'wasp/client/operations'
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
import { Plus, Tag, Trash2, Edit, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { TransactionType } from '@prisma/client'

const transactionTypeLabels: Record<TransactionType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferência',
}

const categoryColors = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#a855f7'
]

const categoryIcons = [
  '🏠', '🍔', '🚗', '💊', '🎓', '🎮', '✈️', '👕', '📱', '⚡', 
  '💰', '💼', '🎁', '🏋️', '🎵', '🍿', '🛒', '🏦', '💳', '📊'
]

export default function CategoriesPage() {
  const { data: categories, isLoading, error, refetch } = useQuery(getCategories)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE' as TransactionType,
    color: categoryColors[0],
    icon: categoryIcons[0],
    description: '',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createCategory({
        name: formData.name,
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
        description: formData.description || null,
      })
      setIsCreateOpen(false)
      resetForm()
      refetch()
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      alert('Erro ao criar categoria')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    
    setIsSubmitting(true)
    try {
      await updateCategory({
        id: editingCategory.id,
        name: formData.name,
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
        description: formData.description || null,
      })
      setIsEditOpen(false)
      setEditingCategory(null)
      resetForm()
      refetch()
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      alert('Erro ao atualizar categoria')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
    
    try {
      await deleteCategory({ id })
      refetch()
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
      alert('Erro ao deletar categoria')
    }
  }

  const openEditDialog = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color ?? categoryColors[0],
      icon: category.icon ?? categoryIcons[0],
      description: category.description ?? '',
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'EXPENSE',
      color: categoryColors[0],
      icon: categoryIcons[0],
      description: '',
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
        <div className="text-lg text-red-600">Erro ao carregar categorias: {error.message}</div>
      </div>
    )
  }

  const incomeCategories = categories?.filter((c: any) => c.type === 'INCOME') || []
  const expenseCategories = categories?.filter((c: any) => c.type === 'EXPENSE') || []

  const CategoryForm = ({ onSubmit, isEdit = false }: { onSubmit: (e: React.FormEvent) => void, isEdit?: boolean }) => (
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
          <Label htmlFor="name">Nome*</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Alimentação, Salário"
            required
          />
        </div>
        <div>
          <Label>Ícone</Label>
          <div className="grid grid-cols-10 gap-2 mt-2">
            {categoryIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`w-10 h-10 text-2xl flex items-center justify-center rounded border-2 ${
                  formData.icon === icon ? 'border-gray-900 bg-gray-100' : 'border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, icon })}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Cor</Label>
          <div className="grid grid-cols-6 gap-2 mt-2">
            {categoryColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-10 h-10 rounded-full border-2 ${
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Categorias</h1>
            <p className="text-gray-600">Organize suas transações por categorias</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Categoria</DialogTitle>
                <DialogDescription>Adicione uma nova categoria para organizar suas transações</DialogDescription>
              </DialogHeader>
              <CategoryForm onSubmit={handleCreate} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                Categorias de Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{incomeCategories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-red-600" />
                Categorias de Despesa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{expenseCategories.length}</div>
            </CardContent>
          </Card>
        </div>

        {!categories || categories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma categoria cadastrada</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                Criar Primeira Categoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Income Categories */}
            {incomeCategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-6 h-6 text-green-600" />
                  Receitas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incomeCategories.map((category: any) => (
                    <Card key={category.id} className="relative overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 w-full h-2"
                        style={{ backgroundColor: category.color || '#10b981' }}
                      />
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{category.icon}</span>
                            <span className="truncate">{category.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      {category.description && (
                        <CardContent>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Expense Categories */}
            {expenseCategories.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <ArrowDownRight className="w-6 h-6 text-red-600" />
                  Despesas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {expenseCategories.map((category: any) => (
                    <Card key={category.id} className="relative overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 w-full h-2"
                        style={{ backgroundColor: category.color || '#ef4444' }}
                      />
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{category.icon}</span>
                            <span className="truncate">{category.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(category)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      {category.description && (
                        <CardContent>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>Atualize as informações da categoria</DialogDescription>
            </DialogHeader>
            <CategoryForm onSubmit={handleEdit} isEdit />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

