import { db } from '@/config/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { Contact, UserRole } from '@/types/contacts';

// Collections
const CONTACTS = 'contacts';
const DEPARTMENTS = 'departments';
const INSTITUTES = 'institutes';
const UNITS = 'units';

// Contact Operations
export const addContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, CONTACTS), {
      ...contactData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const updateContact = async (id: string, contactData: Partial<Contact>) => {
  try {
    const contactRef = doc(db, CONTACTS, id);
    await updateDoc(contactRef, {
      ...contactData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (id: string) => {
  try {
    await deleteDoc(doc(db, CONTACTS, id));
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// Department Operations
export const addDepartment = async (name: string) => {
  try {
    const docRef = await addDoc(collection(db, DEPARTMENTS), {
      name,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

// Institute Operations
export const addInstitute = async (name: string, departmentId: string) => {
  try {
    const docRef = await addDoc(collection(db, INSTITUTES), {
      name,
      departmentId,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding institute:', error);
    throw error;
  }
};

// Unit Operations
export const addUnit = async (name: string, instituteId: string) => {
  try {
    const docRef = await addDoc(collection(db, UNITS), {
      name,
      instituteId,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding unit:', error);
    throw error;
  }
};

// Query Operations
export const getContactsByDepartment = async (departmentId: string) => {
  try {
    const q = query(collection(db, CONTACTS), where("department", "==", departmentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting contacts by department:', error);
    throw error;
  }
};

export const getContactsByInstitute = async (instituteId: string) => {
  try {
    const q = query(collection(db, CONTACTS), where("institute", "==", instituteId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting contacts by institute:', error);
    throw error;
  }
};

export const getAllContacts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, CONTACTS));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Contact[];
  } catch (error) {
    console.error('Error getting all contacts:', error);
    throw error;
  }
}; 