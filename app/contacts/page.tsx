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
  Spinner,
  Chip,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { collection, getDocs, deleteDoc, doc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Plus, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { toast } from 'sonner';
import ContactForm from '@/components/ContactForm';
import ViewContactModal from "@/components/ViewContactModal";

interface Contact {
  id: string;
  fullName: string;
  designation: string;
  department: string;
  institute: string;
  unit: string;
  officialEmail: string;
  personalEmail?: string;
  mobileNo1: string;
  mobileNo2?: string;
  landLine?: string;
  extension?: string;
  profilePicture?: string;
  contactType: string;
  contactStatus: string;
  createdAt: any;
}

export default function ContactsDirectory() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    field: "fullName",
    direction: "asc" as "asc" | "desc"
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const getUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setUserRole(userData?.role || '');
      }
    };
    getUserRole();
    fetchContacts();
  }, [user]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const contactsRef = collection(db, 'contacts');
      const snapshot = await getDocs(contactsRef);
      const contactsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];
      setContacts(contactsList);
      applyFilters(contactsList);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (contactsList: Contact[]) => {
    let filtered = [...contactsList];

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.fullName.toLowerCase().includes(searchLower) ||
        contact.department.toLowerCase().includes(searchLower) ||
        contact.designation?.toLowerCase().includes(searchLower) ||
        contact.officialEmail.toLowerCase().includes(searchLower) ||
        contact.mobileNo1?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => 
        contact.contactStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(contact => 
        contact.contactType.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = String(a[sortConfig.field as keyof Contact] || '').toLowerCase();
      const bValue = String(b[sortConfig.field as keyof Contact] || '').toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredContacts(filtered);
  };

  // Effect for filters
  useEffect(() => {
    applyFilters(contacts);
  }, [searchTerm, statusFilter, typeFilter, sortConfig]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setIsViewModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    try {
      await deleteDoc(doc(db, 'contacts', contactId));
      toast.success('Contact deleted successfully');
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contact Directory</h1>
        {(userRole === 'Admin' || userRole === 'DataEntry') && (
          <Button 
            color="primary"
            endContent={<Plus size={16} />}
            onPress={() => setIsAddModalOpen(true)}
          >
            Add New Contact
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardBody>
          <div className="flex justify-between items-center gap-4">
            <Input
              isClearable
              className="w-full max-w-[44%]"
              placeholder="Search contacts..."
              startContent={<Search className="text-default-300" size={18} />}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <div className="flex gap-3">
              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="flat" 
                    startContent={<SlidersHorizontal size={16} />}
                    endContent={<ChevronDown size={16} />}
                  >
                    {statusFilter === 'all' ? 'Status' : statusFilter}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Status filter"
                  onAction={(key) => setStatusFilter(key as string)}
                  selectedKeys={new Set([statusFilter])}
                >
                  <DropdownItem key="all">All</DropdownItem>
                  <DropdownItem key="Active">Active</DropdownItem>
                  <DropdownItem key="Inactive">Inactive</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="flat" 
                    startContent={<SlidersHorizontal size={16} />}
                    endContent={<ChevronDown size={16} />}
                  >
                    {typeFilter === 'all' ? 'Type' : typeFilter}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Type filter"
                  onAction={(key) => setTypeFilter(key as string)}
                  selectedKeys={new Set([typeFilter])}
                >
                  <DropdownItem key="all">All</DropdownItem>
                  <DropdownItem key="Staff">Staff</DropdownItem>
                  <DropdownItem key="Student">Student</DropdownItem>
                  <DropdownItem key="External">External</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <Button 
                    variant="flat" 
                    startContent={<SlidersHorizontal size={16} />}
                    endContent={<ChevronDown size={16} />}
                  >
                    Sort By
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Sort options"
                  onAction={(key) => {
                    const [field, direction] = (key as string).split('-');
                    setSortConfig({ field, direction: direction as 'asc' | 'desc' });
                  }}
                >
                  <DropdownItem key="fullName-asc">Name (A-Z)</DropdownItem>
                  <DropdownItem key="fullName-desc">Name (Z-A)</DropdownItem>
                  <DropdownItem key="department-asc">Department (A-Z)</DropdownItem>
                  <DropdownItem key="department-desc">Department (Z-A)</DropdownItem>
                  <DropdownItem key="contactStatus-asc">Status (A-Z)</DropdownItem>
                  <DropdownItem key="contactStatus-desc">Status (Z-A)</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Table
            aria-label="Contacts table"
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="primary"
                  page={currentPage}
                  total={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
            }
          >
            <TableHeader>
              <TableColumn>CONTACT</TableColumn>
              <TableColumn>ORGANIZATION</TableColumn>
              <TableColumn>CONTACT INFO</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent={loading ? undefined : "No contacts found"}
              loadingContent={<Spinner />}
              loadingState={loading ? "loading" : "idle"}
            >
              {currentItems.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <User
                      name={contact.fullName}
                      description={contact.designation}
                      avatarProps={{
                        src: contact.profilePicture,
                        showFallback: true,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="font-medium">{contact.department}</p>
                      <p className="text-small text-default-500">{contact.institute}</p>
                      <p className="text-tiny text-default-400">{contact.unit}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="font-medium">{contact.mobileNo1}</p>
                      {contact.mobileNo2 && (
                        <p className="text-small text-default-500">{contact.mobileNo2}</p>
                      )}
                      {contact.landLine && (
                        <p className="text-tiny text-default-400">
                          {contact.landLine} {contact.extension && `(Ext: ${contact.extension})`}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <p className="font-medium">{contact.officialEmail}</p>
                      {contact.personalEmail && (
                        <p className="text-small text-default-500">{contact.personalEmail}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Chip
                        color={contact.contactStatus === "Active" ? "success" : "danger"}
                        variant="flat"
                      >
                        {contact.contactStatus}
                      </Chip>
                      <Chip
                        color={contact.contactType === "Staff" ? "primary" : "secondary"}
                        variant="flat"
                      >
                        {contact.contactType}
                      </Chip>
                    </div>
                  </TableCell>
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
        </CardBody>
      </Card>

      <ContactForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchContacts();
        }}
      />

      <ViewContactModal
        contact={selectedContact}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedContact(null);
        }}
      />

      {selectedContact && (
        <ContactForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedContact(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setSelectedContact(null);
            fetchContacts();
          }}
          contact={selectedContact}
        />
      )}
    </div>
  );
} 