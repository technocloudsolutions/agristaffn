export type UserRole = 'Admin' | 'DataEntry' | 'Viewer';

export type ContactStatus = 'Active' | 'Inactive';

export type ContactType = 'Institute' | 'Person';

export type Title = 'Mr' | 'Miss' | 'Mrs' | 'Dr' | 'Prof';

export interface Contact {
  id: string;
  title: Title;
  fullName: string;
  department: string;
  institute: string;
  unit: string;
  mobileNo1: string;
  mobileNo2?: string;
  whatsAppNo?: string;
  officeNo1: string;
  officeNo2?: string;
  faxNo1?: string;
  faxNo2?: string;
  personalEmail?: string;
  officialEmail: string;
  address: string;
  description?: string;
  contactType: ContactType;
  contactStatus: ContactStatus;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
} 