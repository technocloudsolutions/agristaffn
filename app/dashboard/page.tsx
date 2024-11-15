"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardBody, 
  Button, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  User,
  Pagination,
  Spinner
} from "@nextui-org/react";
import { collection, getDocs, deleteDoc, doc, query, limit, startAfter, orderBy, getDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Contact, ContactStatus, ContactType } from '@/types/contacts';
import ContactForm from '@/components/ContactForm';
import ViewContactModal from "@/components/ViewContactModal";
import SearchAndFilter from "@/components/SearchAndFilter";
import { Plus } from "lucide-react";
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function Dashboard() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [firstVisible, setFirstVisible] = useState<any>(null);
  const [pageCache, setPageCache] = useState<{ [key: number]: { contacts: Contact[], lastDoc: any } }>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all');
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const getUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setUserRole(userData?.role || '');
      }
    };
    getUserRole();
  }, [user]);

  const fetchContacts = async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      console.log('Fetching with:', { typeFilter, sortField, sortDirection }); // Debug log

      // Start with base query
      const contactsRef = collection(db, 'contacts');
      let constraints: any[] = [];

      // Add type filter
      if (typeFilter !== 'all') {
        constraints.push(where('contactType', '==', typeFilter));
      }

      // Add sorting
      if (sortField === 'createdAt') {
        constraints.push(orderBy('createdAt', sortDirection));
      } else if (sortField === 'fullName') {
        constraints.push(orderBy('fullName', sortDirection));
      } else if (sortField === 'department') {
        constraints.push(orderBy('department', sortDirection));
      }

      // Create query
      let q = query(contactsRef, ...constraints);

      // Add pagination
      if (pageNumber > 1 && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
      q = query(q, limit(ITEMS_PER_PAGE));

      // Execute query
      const snapshot = await getDocs(q);
      let contactsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];

      // Apply search filter in memory
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        contactsList = contactsList.filter(contact => 
          contact.fullName.toLowerCase().includes(searchLower) ||
          contact.department.toLowerCase().includes(searchLower) ||
          contact.officialEmail.toLowerCase().includes(searchLower) ||
          contact.mobileNo1?.includes(searchTerm)
        );
      }

      setContacts(contactsList);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setCurrentPage(pageNumber);

      // Update total count for pagination
      const countSnapshot = await getDocs(query(contactsRef, ...constraints));
      const totalPages = Math.ceil(countSnapshot.size / ITEMS_PER_PAGE);
      setTotalPages(totalPages);

    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      if (error.code === 'failed-precondition') {
        toast.error('Please create the required index in Firebase console');
        console.error('Required index:', { typeFilter, sortField });
      } else {
        toast.error('Failed to load contacts');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect for filters to reset pagination
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    setPageCache({}); // Clear cache when filters change
    const timer = setTimeout(() => {
      fetchContacts(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, typeFilter, sortField, sortDirection]);

  const handlePageChange = (page: number) => {
    fetchContacts(page);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteDoc(doc(db, 'contacts', id));
        // Clear cache and refetch current page
        setPageCache({});
        await fetchContacts(currentPage);
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedContact(null);
  };

  const handleSuccess = async () => {
    // Clear cache and refetch current page
    setPageCache({});
    await fetchContacts(currentPage);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contacts Directory</h1>
        {(userRole === 'Admin' || userRole === 'DataEntry') && (
          <Button 
            color="primary"
            onPress={() => setIsAddModalOpen(true)}
            endContent={<Plus size={16} />}
          >
            Add New Contact
          </Button>
        )}
      </div>

      <SearchAndFilter
        onSearch={setSearchTerm}
        onFilterType={(value: string) => setTypeFilter(value as ContactType | 'all')}
        onSort={(field, direction) => {
          setSortField(field);
          setSortDirection(direction);
        }}
        loading={loading}
      />

      <Card className="bg-default-50">
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" color="success" label="Loading contacts..." />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No contacts found</p>
            </div>
          ) : (
            <Table
              aria-label="Contacts table"
              classNames={{
                wrapper: "min-h-[400px]",
              }}
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    showControls
                    showShadow
                    color="success"
                    page={currentPage}
                    total={totalPages}
                    onChange={handlePageChange}
                    isDisabled={loading}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>DEPARTMENT</TableColumn>
                <TableColumn>CONTACT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                loadingContent={<Spinner />}
                loadingState={loading ? "loading" : "idle"}
              >
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <User
                        name={contact.fullName}
                        description={contact.officialEmail}
                        avatarProps={{ src: contact.profilePicture }}
                      />
                    </TableCell>
                    <TableCell>{contact.department}</TableCell>
                    <TableCell>{contact.mobileNo1}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="bordered"
                          onPress={() => handleView(contact)}
                        >
                          View
                        </Button>
                        {(userRole === 'Admin' || userRole === 'DataEntry') && (
                          <Button 
                            size="sm" 
                            color="primary"
                            onPress={() => handleEdit(contact)}
                          >
                            Edit
                          </Button>
                        )}
                        {userRole === 'Admin' && (
                          <Button 
                            size="sm" 
                            color="danger"
                            onPress={() => handleDelete(contact.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <ContactForm 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <ViewContactModal
        contact={selectedContact}
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
      />

      {selectedContact && (
        <ContactForm
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleSuccess}
          contact={selectedContact}
        />
      )}
    </div>
  );
} 