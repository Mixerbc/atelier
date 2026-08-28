import { useEffect, useState } from 'react'
import { adminApi, ApiError } from '../../lib/api'
import { toast } from '../../store/toastStore'
import type { Category } from '../../types'
import { Field } from '../components/Field'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
}

export function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setItems(await adminApi.getCategories())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const reset = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive ?? true,
    })
  }

  const save = async () => {
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description,
        imageUrl: form.imageUrl || null,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      }
      if (editingId) await adminApi.updateCategory(editingId, payload)
      else await adminApi.createCategory(payload)
      toast('success', editingId ? 'Categoría actualizada' : 'Categoría creada')
      reset()
      await load()
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'No se pudo guardar')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    try {
      await adminApi.deleteCategory(id)
      toast('success', 'Categoría eliminada')
      await load()
    } catch (error) {
      toast('error', error instanceof ApiError ? error.message : 'No se pudo eliminar')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Categorías</h1>
        <p className="text-sm text-slate-600">Organiza el catálogo público.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">{editingId ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Field label="Nombre" hint="Cómo se llama el grupo en la tienda. Ejemplo: Vestidos.">
            <input
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              placeholder="Ej. Vestidos"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field
            label="Enlace"
            hint="Texto de la dirección. Si lo dejas vacío, se arma solo con el nombre."
          >
            <input
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              placeholder="Ej. vestidos"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </Field>
          <Field
            className="md:col-span-2"
            label="Descripción"
            hint="Una frase corta de qué prendas van aquí."
          >
            <input
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              placeholder="Ej. Prendas de vestir"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field
            label="Foto"
            hint="Opcional. Enlace de una imagen para el recuadro de la categoría."
          >
            <input
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              placeholder="Ej. /images/categories/vestidos.svg"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </Field>
          <Field label="Orden" hint="Número pequeño sale primero. Ejemplo: 1">
            <input
              type="number"
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
              placeholder="Ej. 1"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Activa
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => void save()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Guardar
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-4 text-sm text-slate-600">Cargando…</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Enlace</th>
                <th className="px-4 py-3">Activa</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((category) => (
                <tr key={category.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3">{category.slug}</td>
                  <td className="px-4 py-3">{category.isActive ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-slate-700 underline"
                        onClick={() => startEdit(category)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="text-red-700 underline"
                        onClick={() => void remove(category.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
