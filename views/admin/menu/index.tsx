'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { PlusIcon, PencilSquareIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useCategories, useMenuItems } from '@/services'
import { createMenuItem, updateMenuItem, deleteMenuItem, uploadMenuImage } from '@/services'
import { getAddonsByMenuItemId, syncMenuItemAddons } from '@/services'
import { useToast } from '@/hooks'
import { formatCurrency } from '@/utils'
import { Button, Input, TextArea, Select, CheckBox, PopupModal, DataTable, type Column, nairaStartContent } from '@/components/ui'
import type { AddonDraftType, MenuItemPayloadType, MenuItemType } from '@/types'

type MenuItemFormValues = {
  name: string
  description?: string
  price: number
  category_id: string
  is_available: boolean
}

const schema: yup.ObjectSchema<MenuItemFormValues> = yup.object({
  name: yup.string().required('Name is required'),
  description: yup.string(),
  price: yup.number().typeError('Enter a valid price').positive('Must be greater than 0').required('Price is required'),
  category_id: yup.string().required('Category is required'),
  is_available: yup.boolean().required(),
})

const columns: Column[] = [
  { key: 'name', title: 'Item' },
  { key: 'category', title: 'Category' },
  { key: 'addons', title: 'Add-ons' },
  { key: 'price', title: 'Price' },
  { key: 'status', title: 'Status' },
  { key: 'actions', title: '', className: 'text-right' },
]

const emptyAddon = (): AddonDraftType => ({ name: '', price: 0, is_available: true })

export default function AdminMenuView() {
  const { categories } = useCategories()
  const { menuItems, loading, refresh } = useMenuItems()
  const { showSuccess, showError } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItemType | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [addonDrafts, setAddonDrafts] = useState<AddonDraftType[]>([])

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { is_available: true },
  })

  const closeModal = () => {
    setIsModalOpen(false)
    setStep(1)
    setAddonDrafts([])
    setImageFile(null)
  }

  const openCreateModal = () => {
    setEditing(null)
    setImageFile(null)
    setStep(1)
    setAddonDrafts([])
    reset({ name: '', description: '', price: undefined, category_id: '', is_available: true })
    setIsModalOpen(true)
  }

  const openEditModal = async (item: MenuItemType) => {
    setEditing(item)
    setImageFile(null)
    setStep(1)
    reset({
      name: item.name,
      description: item.description ?? '',
      price: item.price,
      category_id: item.category_id ?? '',
      is_available: item.is_available,
    })

    try {
      const addons = await getAddonsByMenuItemId(item.id)
      setAddonDrafts(
        addons.length > 0
          ? addons.map(addon => ({
              id: addon.id,
              name: addon.name,
              price: addon.price,
              is_available: addon.is_available,
            }))
          : [],
      )
    } catch {
      setAddonDrafts(item.menu_addons?.map(addon => ({ ...addon, is_available: addon.is_available })) ?? [])
    }

    setIsModalOpen(true)
  }

  const goToAddonsStep = async () => {
    const valid = await trigger(['name', 'price', 'category_id'])
    if (valid) setStep(2)
  }

  const updateAddonDraft = (index: number, patch: Partial<AddonDraftType>) => {
    setAddonDrafts(current => current.map((addon, i) => (i === index ? { ...addon, ...patch } : addon)))
  }

  const removeAddonDraft = (index: number) => {
    setAddonDrafts(current => current.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: MenuItemFormValues) => {
    setSubmitting(true)
    try {
      let image_url = editing?.image_url ?? null
      if (imageFile) {
        image_url = await uploadMenuImage(imageFile)
      }

      const payload: MenuItemPayloadType = { ...values, image_url }
      let menuItemId = editing?.id

      if (editing) {
        await updateMenuItem(editing.id, payload)
        showSuccess('Menu item updated')
      } else {
        const created = await createMenuItem(payload)
        menuItemId = created.id
        showSuccess('Menu item created')
      }

      if (menuItemId) {
        await syncMenuItemAddons(menuItemId, addonDrafts)
      }

      closeModal()
      refresh()
    } catch (error) {
      showError('Save failed', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item: MenuItemType) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    try {
      await deleteMenuItem(item.id)
      showSuccess('Menu item deleted')
      refresh()
    } catch (error) {
      showError('Delete failed', error instanceof Error ? error.message : 'Please try again.')
    }
  }

  const modalTitle = editing ? 'Edit Menu Item' : 'Add Menu Item'

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-off-white">Menu Items</h1>
          <p className="mt-1 text-sm text-text-muted">Add items and attach optional add-ons.</p>
        </div>
        <Button onClick={openCreateModal} startContent={<PlusIcon className="size-4" />}>
          Add Item
        </Button>
      </div>

      <div className="mt-6">
        <DataTable<MenuItemType>
          columns={columns}
          data={menuItems}
          loading={loading}
          rowKey={item => item.id}
          emptyMessage="No menu items yet."
          renderRow={item => (
            <>
              <td className="px-6 py-4 text-sm font-semibold text-off-white">{item.name}</td>
              <td className="px-6 py-4 text-sm text-text-grey">{item.categories?.name ?? '—'}</td>
              <td className="px-6 py-4 text-sm text-text-grey">{item.menu_addons?.length ?? 0}</td>
              <td className="px-6 py-4 text-sm font-semibold text-primary">{formatCurrency(item.price)}</td>
              <td className="px-6 py-4">
                <span
                  className={
                    item.is_available
                      ? 'rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success'
                      : 'rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-text-grey'
                  }
                >
                  {item.is_available ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="rounded-lg p-2 text-text-grey hover:bg-white/10 hover:text-off-white"
                    aria-label="Edit"
                  >
                    <PencilSquareIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-lg p-2 text-text-grey hover:bg-danger/10 hover:text-danger"
                    aria-label="Delete"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </td>
            </>
          )}
        />
      </div>

      <PopupModal isOpen={isModalOpen} onClose={closeModal} title={modalTitle} size="2xl">
        
        <div className="mb-6 flex items-center gap-2">
          {[
            { n: 1, label: 'Details' },
            { n: 2, label: 'Add-ons' },
          ].map(({ n, label }) => (
            <div key={n} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                  step === n ? 'bg-primary text-white' : step > n ? 'bg-success text-white' : 'bg-white/10 text-text-grey'
                }`}
              >
                {n}
              </span>
              <span className={`text-sm font-medium ${step === n ? 'text-off-white' : 'text-text-grey'}`}>{label}</span>
              {n === 1 && <span className="mx-1 h-px flex-1 bg-white/10" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <Input label="Name" fullWidth {...register('name')} error={errors.name?.message} />
              <TextArea label="Description" {...register('description')} error={errors.description?.message} />
              <Input
                label="Price"
                type="number"
                step="0.01"
                fullWidth
                startContent={nairaStartContent}
                {...register('price')}
                error={errors.price?.message}
              />
              <Select label="Category" fullWidth {...register('category_id')} error={errors.category_id?.message}>
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <div className="form-group">
                <label className="form-label" htmlFor="menu-image">Image</label>
                <input
                  id="menu-image"
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                  className="form-control"
                />
              </div>

              <CheckBox label="Available for order" {...register('is_available')} />

              <Button type="button" onClick={goToAddonsStep} fullWidth className="mt-2">
                Next: Add-ons →
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="mb-4 text-sm text-text-muted">
                Add optional extras for this menu item (e.g. extra plantain, extra sauce).
              </p>

              {addonDrafts.length === 0 ? (
                <p className="mb-4 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-text-grey">
                  No add-ons yet. Add one below or skip to save.
                </p>
              ) : (
                <div className="mb-4 space-y-3">
                  {addonDrafts.map((addon, index) => (
                    <div key={index} className="rounded-xl border border-white/10 bg-white/3 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-text-grey">Add-on {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeAddonDraft(index)}
                          className="rounded-lg p-1 text-text-grey hover:bg-danger/10 hover:text-danger"
                          aria-label="Remove add-on"
                        >
                          <XMarkIcon className="size-4" />
                        </button>
                      </div>
                      <Input
                        label="Name"
                        name={`addon-name-${index}`}
                        fullWidth
                        value={addon.name}
                        onChange={e => updateAddonDraft(index, { name: e.target.value })}
                      />
                      <Input
                        label="Price"
                        name={`addon-price-${index}`}
                        type="number"
                        step="0.01"
                        fullWidth
                        startContent={nairaStartContent}
                        value={addon.price === 0 ? '' : String(addon.price)}
                        onChange={e => updateAddonDraft(index, { price: Number(e.target.value) || 0 })}
                      />
                      <CheckBox
                        label="Available"
                        name={`addon-available-${index}`}
                        checked={addon.is_available}
                        onChange={e => updateAddonDraft(index, { is_available: e.target.checked })}
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                color="secondary"
                variant="bordered"
                onClick={() => setAddonDrafts(current => [...current, emptyAddon()])}
                startContent={<PlusIcon className="size-4" />}
                fullWidth
              >
                Add add-on
              </Button>

              <div className="mt-4 flex gap-3">
                <Button type="button" color="secondary" variant="bordered" onClick={() => setStep(1)} fullWidth>
                  ← Back
                </Button>
                <Button type="submit" loading={submitting} fullWidth>
                  {editing ? 'Save Changes' : 'Create Item'}
                </Button>
              </div>
            </>
          )}
        </form>
      </PopupModal>
    </div>
  )
}
