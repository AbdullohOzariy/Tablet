import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { Branch } from '../../types';
import { Store, Plus, Trash2, Edit2, Search, Building, CheckCircle, Link as LinkIcon, Upload, Image as ImageIcon } from 'lucide-react';
import { Button, Input, Modal, EmptyState, LoadingSpinner } from '../ui';

export const BranchManager: React.FC<{ fabTrigger: number }> = ({ fabTrigger }) => {
  const { branches, addBranch, updateBranch, deleteBranch } = useStore();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formState, setFormState] = useState<Omit<Branch, 'id'>>({ name: '', address: '', phone: '', customColor: '#F97316', logoUrl: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (fabTrigger > 0) openModal();
  }, [fabTrigger]);

  const filteredBranches = useMemo(() =>
    branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase())
    ), [branches, searchTerm]);

  const openModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setFormState({ name: branch.name, address: branch.address, phone: branch.phone, customColor: branch.customColor || '#F97316', logoUrl: branch.logoUrl || '' });
    } else {
      setEditingBranch(null);
      setFormState({ name: '', address: '', phone: '', customColor: '#F97316', logoUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.address || !formState.phone) {
        showToast("Barcha maydonlarni to'ldiring!", "error");
        return;
    }
    setIsSubmitting(true);
    try {
      if (editingBranch) {
        await updateBranch(editingBranch.id, { id: editingBranch.id, ...formState });
        showToast('Filial yangilandi');
      } else {
        await addBranch(formState);
        showToast('Yangi filial qo\'shildi');
      }
      setIsModalOpen(false);
    } catch (error) {
        console.error("Filialni saqlashda xatolik:", error);
        showToast('Xatolik yuz berdi!', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100">
        <div className="w-full md:w-1/2 lg:w-1/3">
            <Input icon={Search} placeholder="Filial izlash..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="hidden md:block">
            <Button onClick={() => openModal()} icon={Plus}>Yangi Filial</Button>
        </div>
      </div>
      {branches.length === 0 ? (
        <EmptyState icon={Building} title="Hali filiallar yo'q" description="Tizimga birinchi filialingizni qo'shing."><Button onClick={() => openModal()} icon={Plus}>Birinchi Filialni Qo'shish</Button></EmptyState>
      ) : filteredBranches.length === 0 ? (
        <EmptyState icon={Search} title="Natija topilmadi" description={`"${searchTerm}" uchun filiallar topilmadi.`} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Branch list rendering */}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBranch ? 'Filialni Tahrirlash' : 'Yangi Filial Yaratish'}>
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Branch form content */}
        </form>
      </Modal>
    </div>
  );
};