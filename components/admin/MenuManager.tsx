import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Dish, Category, CategoryViewType } from '../../types';
import { UtensilsCrossed, Plus, Trash2, Edit2, GripVertical, LayoutList, Grid } from 'lucide-react';
import { Button, Input, Modal, EmptyState, LoadingSpinner } from '../ui';
import { DishModal } from '../modals/DishModal';

export const MenuManager: React.FC<{ fabTrigger: number }> = ({ fabTrigger }) => {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories, dishes, updateDish, deleteDish } = useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dishes' | 'categories'>('dishes');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState<{name: string, viewType: CategoryViewType}>({ name: '', viewType: 'grid' });

  useEffect(() => {
    if (fabTrigger > 0) {
        if (activeTab === 'categories') openCategoryModal();
        else openDishModal();
    }
  }, [fabTrigger, activeTab]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    const newCategories = Array.from(categories);
    const [reorderedItem] = newCategories.splice(source.index, 1);
    newCategories.splice(destination.index, 0, reorderedItem);
    const updatedCategories = newCategories.map((cat, index) => ({ ...cat, sortOrder: index }));
    reorderCategories(updatedCategories).catch(() => showToast("Tartibni saqlashda xatolik!", "error"));
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
        setEditingCategory(category);
        setCatForm({ name: category.name, viewType: category.viewType });
    } else {
        setEditingCategory(null);
        setCatForm({ name: '', viewType: 'grid' });
    }
    setIsCatModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    setIsSubmitting(true);
    try {
        if (editingCategory) {
            await updateCategory(editingCategory.id, { ...editingCategory, ...catForm });
            showToast('Kategoriya yangilandi');
        } else {
            await addCategory(catForm.name, catForm.viewType);
            showToast('Yangi kategoriya qo\'shildi');
        }
        setIsCatModalOpen(false);
    } catch (error) {
        showToast('Xatolik yuz berdi!', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const openDishModal = (dish?: Dish) => {
    setEditingDish(dish || null);
    setIsDishModalOpen(true);
  };

  const filteredDishes = useMemo(() =>
    (selectedCatId === 'all' ? dishes : dishes.filter(d => d.categoryId === selectedCatId)).sort((a, b) => a.sortOrder - b.sortOrder),
    [dishes, selectedCatId]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
         <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            <button onClick={() => setActiveTab('dishes')} className={`flex-1 md:w-32 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dishes' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Taomlar</button>
            <button onClick={() => setActiveTab('categories')} className={`flex-1 md:w-32 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Kategoriyalar</button>
         </div>
         <div className="hidden md:block">
            <Button onClick={() => activeTab === 'dishes' ? openDishModal() : openCategoryModal()} icon={Plus}>{activeTab === 'dishes' ? 'Yangi Taom' : 'Yangi Kategoriya'}</Button>
         </div>
      </div>
      {activeTab === 'categories' ? (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* ... Draggable category list ... */}
        </DragDropContext>
      ) : (
        <div>{/* Dish list rendering */}</div>
      )}
      <DishModal isOpen={isDishModalOpen} onClose={() => setIsDishModalOpen(false)} editingDish={editingDish} initialCategoryId={selectedCatId !== 'all' ? selectedCatId : undefined} />
      <Modal isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)} title={editingCategory ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya'}>
        <form onSubmit={handleCategorySubmit} className="space-y-6">
            {/* Category form content */}
        </form>
      </Modal>
    </div>
  );
};