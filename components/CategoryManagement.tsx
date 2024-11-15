"use client";

import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Chip,
} from "@nextui-org/react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Department {
  id: string;
  name: string;
  description?: string;
  institutes: Institute[];
}

interface Institute {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  units: Unit[];
}

interface Unit {
  id: string;
  name: string;
  description?: string;
  instituteId: string;
}

export default function CategoryManagement() {
  const { user } = useAuth();
  const [canEdit, setCanEdit] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'department' | 'institute' | 'unit'>('department');
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setCanEdit(userData?.role === 'Admin' || userData?.role === 'DataEntry');
      }
    };

    checkUserRole();
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Fetch departments
      const deptSnapshot = await getDocs(collection(db, 'departments'));
      const deptList: Department[] = [];

      for (const deptDoc of deptSnapshot.docs) {
        const dept = { id: deptDoc.id, ...deptDoc.data() } as Department;
        dept.institutes = [];

        // Fetch institutes for each department
        const instSnapshot = await getDocs(collection(db, 'institutes'));
        const institutes = instSnapshot.docs
          .filter(doc => doc.data().departmentId === dept.id)
          .map(doc => ({ id: doc.id, ...doc.data() }) as Institute);

        // Fetch units for each institute
        for (const inst of institutes) {
          const unitSnapshot = await getDocs(collection(db, 'units'));
          inst.units = unitSnapshot.docs
            .filter(doc => doc.data().instituteId === inst.id)
            .map(doc => ({ id: doc.id, ...doc.data() }) as Unit);
        }

        dept.institutes = institutes;
        deptList.push(dept);
      }

      setDepartments(deptList);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (type: 'department' | 'institute' | 'unit', parentId?: string) => {
    if (!canEdit) {
      toast.error("You don't have permission to add categories");
      return;
    }
    setModalType(type);
    setSelectedParent(parentId || '');
    setEditingItem(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (type: 'department' | 'institute' | 'unit', item: any) => {
    if (!canEdit) {
      toast.error("You don't have permission to edit categories");
      return;
    }
    setModalType(type);
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Name is required');
        return;
      }

      if (editingItem) {
        // Update existing item
        const docRef = doc(db, `${modalType}s`, editingItem.id);
        await updateDoc(docRef, formData);
        toast.success(`${modalType} updated successfully`);
      } else {
        // Create new item
        const data = {
          ...formData,
          ...(modalType === 'institute' && { departmentId: selectedParent }),
          ...(modalType === 'unit' && { instituteId: selectedParent }),
        };
        await addDoc(collection(db, `${modalType}s`), data);
        toast.success(`${modalType} created successfully`);
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (type: 'department' | 'institute' | 'unit', id: string) => {
    if (!canEdit) {
      toast.error("You don't have permission to delete categories");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      await deleteDoc(doc(db, `${modalType}s`, id));
      toast.success(`${type} deleted successfully`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Delete operation failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Category Management</h2>
        {canEdit && (
          <Button 
            color="primary" 
            startContent={<Plus size={20} />}
            onPress={() => handleAdd('department')}
          >
            Add Department
          </Button>
        )}
      </div>

      <Accordion 
        variant="bordered"
        selectionMode="multiple"
      >
        {departments.map((dept) => (
          <AccordionItem
            key={dept.id}
            aria-label={dept.name}
            title={
              <div className="flex justify-between items-center w-full pr-8">
                <span>{dept.name}</span>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleAdd('institute', dept.id)}
                    >
                      <Plus size={16} />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleEdit('department', dept)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete('department', dept.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            }
          >
            <div className="pl-4 space-y-4">
              {dept.institutes.map((inst) => (
                <Card key={inst.id} className="mb-2">
                  <CardBody>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">{inst.name}</h3>
                        {inst.description && (
                          <p className="text-sm text-gray-500">{inst.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {inst.units.map((unit) => (
                            <Chip
                              key={unit.id}
                              onClose={canEdit ? () => handleDelete('unit', unit.id) : undefined}
                              variant="flat"
                              className={canEdit ? "cursor-pointer" : undefined}
                              onClick={canEdit ? () => handleEdit('unit', unit) : undefined}
                            >
                              {unit.name}
                            </Chip>
                          ))}
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="light"
                              startContent={<Plus size={16} />}
                              onPress={() => handleAdd('unit', inst.id)}
                            >
                              Add Unit
                            </Button>
                          )}
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleEdit('institute', inst)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => handleDelete('institute', inst.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </AccordionItem>
        ))}
      </Accordion>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader>
            {editingItem ? `Edit ${modalType}` : `Add New ${modalType}`}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              {editingItem ? 'Save Changes' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 