"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  User,
  Chip,
  Switch,
  Avatar,
} from "@nextui-org/react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from 'sonner';
import { collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/config/firebase';

interface SystemUser {
  uid: string;
  email: string;
  fullName: string;
  designation: string;
  departmentId: string;
  instituteId: string;
  unitId: string;
  contactNumber: string;
  role: string;
  profilePicture?: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  departmentId?: string;
  instituteId?: string;
}

interface FormData {
  email: string;
  fullName: string;
  designation: string;
  departmentId: string;
  instituteId: string;
  unitId: string;
  contactNumber: string;
  role: string;
  password?: string;
  profilePicture?: string;
  isActive: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [departments, setDepartments] = useState<Category[]>([]);
  const [institutes, setInstitutes] = useState<Category[]>([]);
  const [units, setUnits] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    fullName: '',
    designation: '',
    departmentId: '',
    instituteId: '',
    unitId: '',
    contactNumber: '',
    role: 'User',
    password: '',
    profilePicture: '',
    isActive: true
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch departments
      const deptSnapshot = await getDocs(collection(db, 'departments'));
      setDepartments(deptSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      })));

      // Fetch institutes
      const instSnapshot = await getDocs(collection(db, 'institutes'));
      setInstitutes(instSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        departmentId: doc.data().departmentId
      })));

      // Fetch units
      const unitSnapshot = await getDocs(collection(db, 'units'));
      setUnits(unitSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        instituteId: doc.data().instituteId
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUsers();
      await fetchCategories();
    };
    init();
  }, []);

  const handleImageUpload = async (file: File): Promise<string> => {
    const storage = getStorage();
    const storageRef = ref(storage, `profile-pictures/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedUser && (!formData.email || !formData.password)) {
        toast.error('Email and password are required for new users');
        return;
      }

      let profilePictureUrl = formData.profilePicture;
      if (profileImage) {
        profilePictureUrl = await handleImageUpload(profileImage);
      }

      const response = await fetch('/api/users', {
        method: selectedUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profilePicture: profilePictureUrl,
          ...(selectedUser && { uid: selectedUser.uid })
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`User ${selectedUser ? 'updated' : 'created'} successfully`);
        fetchUsers();
        setIsModalOpen(false);
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      fullName: '',
      designation: '',
      departmentId: '',
      instituteId: '',
      unitId: '',
      contactNumber: '',
      role: 'User',
      password: '',
      profilePicture: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: SystemUser) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName || '',
      designation: user.designation || '',
      departmentId: user.departmentId || '',
      instituteId: user.instituteId || '',
      unitId: user.unitId || '',
      contactNumber: user.contactNumber || '',
      role: user.role || 'User',
      profilePicture: user.profilePicture || '',
      isActive: user.isActive ?? true
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">System Users</h2>
        <Button 
          color="primary" 
          endContent={<Plus size={16} />}
          onPress={handleAddUser}
        >
          Add New User
        </Button>
      </div>

      <Table aria-label="Users table">
        <TableHeader>
          <TableColumn>USER</TableColumn>
          <TableColumn>CONTACT</TableColumn>
          <TableColumn>DEPARTMENT</TableColumn>
          <TableColumn>INSTITUTE</TableColumn>
          <TableColumn>UNIT</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody 
          isLoading={loading}
          emptyContent={loading ? "Loading..." : "No users found"}
        >
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>
                <User
                  name={user.fullName}
                  description={user.email}
                  avatarProps={{
                    src: user.profilePicture,
                    showFallback: true,
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{user.designation}</span>
                  <span className="text-small text-default-500">{user.contactNumber}</span>
                </div>
              </TableCell>
              <TableCell>{departments.find(d => d.id === user.departmentId)?.name}</TableCell>
              <TableCell>{institutes.find(i => i.id === user.instituteId)?.name}</TableCell>
              <TableCell>{units.find(u => u.id === user.unitId)?.name}</TableCell>
              <TableCell>
                <Chip
                  color={user.role === 'Admin' ? 'danger' : user.role === 'DataEntry' ? 'primary' : 'default'}
                  variant="flat"
                >
                  {user.role}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip
                  color={user.isActive ? 'success' : 'danger'}
                  variant="flat"
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleEditUser(user)}
                    disabled={user.uid === currentUser?.uid}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => handleDeleteUser(user.uid)}
                    disabled={user.uid === currentUser?.uid}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            {selectedUser ? 'Edit User' : 'Add New User'}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!!selectedUser}
                required
              />
              <Input
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                required
              />
              <Input
                label="Contact Number"
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                required
              />
              <Select
                label="Department"
                selectedKeys={formData.departmentId ? [formData.departmentId] : []}
                onChange={(e) => {
                  setFormData({
                    ...formData, 
                    departmentId: e.target.value,
                    instituteId: '', // Reset dependent fields
                    unitId: ''
                  });
                }}
                required
              >
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="Institute"
                selectedKeys={formData.instituteId ? [formData.instituteId] : []}
                onChange={(e) => {
                  setFormData({
                    ...formData, 
                    instituteId: e.target.value,
                    unitId: '' // Reset dependent field
                  });
                }}
                required
                isDisabled={!formData.departmentId}
              >
                {institutes
                  .filter(inst => !formData.departmentId || inst.departmentId === formData.departmentId)
                  .map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </SelectItem>
                  ))}
              </Select>
              <Select
                label="Unit"
                selectedKeys={formData.unitId ? [formData.unitId] : []}
                onChange={(e) => setFormData({...formData, unitId: e.target.value})}
                required
                isDisabled={!formData.instituteId}
              >
                {units
                  .filter(unit => !formData.instituteId || unit.instituteId === formData.instituteId)
                  .map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
              </Select>
              <Select
                label="Role"
                selectedKeys={[formData.role]}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <SelectItem key="User" value="User">User</SelectItem>
                <SelectItem key="Admin" value="Admin">Admin</SelectItem>
                <SelectItem key="DataEntry" value="DataEntry">Data Entry</SelectItem>
              </Select>
              {!selectedUser && (
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              )}
              <Input
                type="file"
                label="Profile Picture"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <span>Active</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSubmit}>
              {selectedUser ? 'Save Changes' : 'Create User'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 