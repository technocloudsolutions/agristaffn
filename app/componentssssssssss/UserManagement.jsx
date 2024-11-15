'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Button,
  useDisclosure,
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Input,
} from "@nextui-org/react";
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'User',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      displayName: '',
      role: 'User',
      password: ''
    });
    onOpen();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      displayName: user.displayName || '',
      role: user.role || 'User',
      password: ''
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (!selectedUser && (!formData.email || !formData.password)) {
        toast.error('Email and password are required for new users');
        return;
      }

      const method = selectedUser ? 'PUT' : 'POST';
      const body = selectedUser 
        ? { ...formData, uid: selectedUser.uid }
        : formData;

      const response = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(selectedUser ? 'User updated successfully' : 'User created successfully');
        fetchUsers();
        onClose();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteUser = async (uid) => {
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button 
          color="primary" 
          startContent={<Plus size={20} />}
          onPress={handleAddUser}
        >
          Add User
        </Button>
      </div>

      <Table aria-label="Users table">
        <TableHeader>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>DISPLAY NAME</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody 
          isLoading={loading}
          emptyContent={loading ? "Loading..." : "No users found"}
        >
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.displayName}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    color="primary"
                    variant="light"
                    onPress={() => handleEditUser(user)}
                    disabled={user.uid === currentUser?.uid}
                  >
                    <Edit size={20} />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    onPress={() => handleDeleteUser(user.uid)}
                    disabled={user.uid === currentUser?.uid}
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        placement="center"
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {selectedUser ? 'Edit User' : 'Add New User'}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    disabled={!!selectedUser}
                    isRequired={!selectedUser}
                  />
                  <Input
                    label="Display Name"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({...prev, displayName: e.target.value}))}
                  />
                  {!selectedUser && (
                    <Input
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      isRequired
                      description="Password must be at least 6 characters"
                    />
                  )}
                  <select
                    className="w-full rounded-lg bg-default-100 dark:bg-default-50 p-3 text-default-700"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="DataEntry">Data Entry</option>
                  </select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  {selectedUser ? 'Save Changes' : 'Create User'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
} 