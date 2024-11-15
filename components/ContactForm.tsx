"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Avatar,
  Divider,
  Chip,
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  Progress,
} from "@nextui-org/react";
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/config/firebase';
import { toast } from 'sonner';
import { Phone, Mail, Building2, User2, Image, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  departmentId?: string;
  instituteId?: string;
}

interface FormData {
  fullName: string;
  designation: string;
  department: string;
  institute: string;
  unit: string;
  officialEmail: string;
  personalEmail: string;
  mobileNo1: string;
  mobileNo2: string;
  landLine: string;
  extension: string;
  profilePicture: string;
  contactType: string;
  contactStatus: string;
  departmentId: string;
  instituteId: string;
  unitId: string;
}

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contact?: any;
}

interface FormErrors {
  fullName?: string;
  officialEmail?: string;
  departmentId?: string;
  instituteId?: string;
  unitId?: string;
  mobileNo1?: string;
  personalEmail?: string;
  profileImage?: string;
}

type FormDataKey = keyof FormData;

export default function ContactForm({ isOpen, onClose, onSuccess, contact }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Category[]>([]);
  const [institutes, setInstitutes] = useState<Category[]>([]);
  const [units, setUnits] = useState<Category[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState("basic");
  const [errors, setErrors] = useState<FormErrors>({});
  const [imageError, setImageError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: contact?.fullName || '',
    designation: contact?.designation || '',
    department: contact?.department || '',
    institute: contact?.institute || '',
    unit: contact?.unit || '',
    officialEmail: contact?.officialEmail || '',
    personalEmail: contact?.personalEmail || '',
    mobileNo1: contact?.mobileNo1 || '',
    mobileNo2: contact?.mobileNo2 || '',
    landLine: contact?.landLine || '',
    extension: contact?.extension || '',
    profilePicture: contact?.profilePicture || '',
    contactType: contact?.contactType || 'Staff',
    contactStatus: contact?.contactStatus || 'Active',
    departmentId: contact?.departmentId || '',
    instituteId: contact?.instituteId || '',
    unitId: contact?.unitId || ''
  });

  // Add state for form validation
  const [isFormValid, setIsFormValid] = useState(false);
  const [imageUploadKey, setImageUploadKey] = useState(Date.now());

  // Add new state for image upload
  const [imageKey, setImageKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setImageKey(Date.now()); // Force input refresh
      setImageError('');
      setProfileImage(null);
      setPreviewUrl('');
      // Reset other form fields...
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setImageUploadKey(Date.now()); // Force input refresh
      setImageError('');
      setErrors({});
      validateForm(formData);
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const [deptSnapshot, instSnapshot, unitSnapshot] = await Promise.all([
        getDocs(collection(db, 'departments')),
        getDocs(collection(db, 'institutes')),
        getDocs(collection(db, 'units'))
      ]);

      setDepartments(deptSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      })));

      setInstitutes(instSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        departmentId: doc.data().departmentId
      })));

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

  // Validate form on data change
  useEffect(() => {
    validateForm(formData);
  }, [formData]);

  const validateForm = (data: typeof formData): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!data.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.officialEmail.trim()) {
      newErrors.officialEmail = 'Official email is required';
    } else if (!emailRegex.test(data.officialEmail)) {
      newErrors.officialEmail = 'Please enter a valid email address';
    }

    if (data.personalEmail && !emailRegex.test(data.personalEmail)) {
      newErrors.personalEmail = 'Please enter a valid email address';
    }

    // Phone validation (Sri Lankan format)
    const phoneRegex = /^(?:\+94|0)?[0-9]{9,10}$/;
    if (!data.mobileNo1 && !contact) { // Only required for new contacts
      newErrors.mobileNo1 = 'Mobile number is required';
    } else if (data.mobileNo1 && !phoneRegex.test(data.mobileNo1)) {
      newErrors.mobileNo1 = 'Please enter a valid Sri Lankan phone number';
    }

    // Category validations - only required for new contacts
    if (!data.departmentId && !contact) {
      newErrors.departmentId = 'Department is required';
    }
    if (!data.instituteId && !contact) {
      newErrors.instituteId = 'Institute is required';
    }
    if (!data.unitId && !contact) {
      newErrors.unitId = 'Unit is required';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');

    if (!file) {
      setProfileImage(null);
      setPreviewUrl('');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please upload a valid image file (JPG, PNG)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size should be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setProfileImage(file);
    toast.success('Image selected successfully');
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const storage = getStorage();
      // Create a safe filename by removing special characters and spaces
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
      const fileName = `contact-pictures/${Date.now()}-${safeFileName}`;
      const storageRef = ref(storage, fileName);

      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm(formData)) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    try {
      setLoading(true);

      // Handle image upload first if there's a new image
      let profilePictureUrl = formData.profilePicture;
      if (profileImage) {
        try {
          profilePictureUrl = await handleImageUpload(profileImage);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload profile picture');
          setLoading(false);
          return;
        }
      }

      // Get category names
      const department = departments.find(d => d.id === formData.departmentId)?.name || '';
      const institute = institutes.find(i => i.id === formData.instituteId)?.name || '';
      const unit = units.find(u => u.id === formData.unitId)?.name || '';

      // Prepare contact data
      const contactData = {
        fullName: formData.fullName,
        designation: formData.designation,
        department,
        institute,
        unit,
        departmentId: formData.departmentId,
        instituteId: formData.instituteId,
        unitId: formData.unitId,
        officialEmail: formData.officialEmail,
        personalEmail: formData.personalEmail,
        mobileNo1: formData.mobileNo1,
        mobileNo2: formData.mobileNo2,
        landLine: formData.landLine,
        extension: formData.extension,
        profilePicture: profilePictureUrl || '',
        contactType: formData.contactType,
        contactStatus: formData.contactStatus,
        updatedAt: new Date()
      };

      if (!contact) {
        // Add new contact
        await addDoc(collection(db, 'contacts'), {
          ...contactData,
          createdAt: new Date()
        });
        toast.success('Contact added successfully');
      } else {
        // Update existing contact
        await updateDoc(doc(db, 'contacts', contact.id), contactData);
        toast.success('Contact updated successfully');
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error(contact ? 'Failed to update contact' : 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      designation: '',
      department: '',
      institute: '',
      unit: '',
      officialEmail: '',
      personalEmail: '',
      mobileNo1: '',
      mobileNo2: '',
      landLine: '',
      extension: '',
      profilePicture: '',
      contactType: 'Staff',
      contactStatus: 'Active',
      departmentId: '',
      instituteId: '',
      unitId: ''
    });
    setProfileImage(null);
    setPreviewUrl('');
    setErrors({});
    setSelectedTab("basic");
    onClose();
  };

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = [
      'fullName',
      'officialEmail',
      'departmentId',
      'instituteId',
      'unitId',
      'mobileNo1',
      'contactType',
      'contactStatus'
    ] as FormDataKey[];
    
    const completedFields = requiredFields.filter(field => formData[field]?.trim()).length;
    const progress = (completedFields / requiredFields.length) * 100;
    setFormProgress(progress);
  }, [formData]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="4xl"
      scrollBehavior="inside"
      isDismissable={!loading}
      classNames={{
        base: "max-h-[90vh]",
        closeButton: "hidden",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <p className="text-sm text-default-500">
            Fields marked with an asterisk (*) are required
          </p>
        </ModalHeader>
        <Divider/>
        <ModalBody>
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Picture Section */}
            <Card className="col-span-full">
              <CardBody className="flex flex-col items-center gap-4">
                <Avatar
                  src={previewUrl || formData.profilePicture}
                  className="w-32 h-32"
                  showFallback
                />
                <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                  <Input
                    ref={fileInputRef}
                    key={imageKey}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageChange}
                    label="Profile Picture"
                    description="Max file size: 5MB (JPG, PNG)"
                    errorMessage={imageError}
                    isInvalid={!!imageError}
                    startContent={<Image size={16}/>}
                    classNames={{
                      input: "file:text-primary file:bg-primary-50 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-primary-100",
                      description: "text-tiny text-default-400",
                      errorMessage: "text-tiny text-danger",
                    }}
                  />
                  {profileImage && (
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-tiny text-success">
                        Selected: {profileImage.name}
                      </p>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => {
                          setProfileImage(null);
                          setPreviewUrl('');
                          setImageKey(Date.now());
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Form Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="col-span-full">
                <CardHeader className="flex gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-small text-default-500">Enter the basic details of the contact</p>
                  </div>
                </CardHeader>
                <Divider/>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    errorMessage={errors.fullName}
                    isInvalid={!!errors.fullName}
                    isRequired
                    startContent={<User2 size={16} className="text-default-400" />}
                  />
                  <Input
                    label="Designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    startContent={<Building2 size={16} className="text-default-400" />}
                  />
                  <Select
                    label="Contact Type"
                    selectedKeys={[formData.contactType]}
                    onChange={(e) => setFormData({...formData, contactType: e.target.value})}
                    isRequired
                  >
                    <SelectItem key="Staff" value="Staff">Staff</SelectItem>
                    <SelectItem key="Student" value="Student">Student</SelectItem>
                    <SelectItem key="External" value="External">External</SelectItem>
                  </Select>
                  <Select
                    label="Status"
                    selectedKeys={[formData.contactStatus]}
                    onChange={(e) => setFormData({...formData, contactStatus: e.target.value})}
                    isRequired
                  >
                    <SelectItem key="Active" value="Active">Active</SelectItem>
                    <SelectItem key="Inactive" value="Inactive">Inactive</SelectItem>
                  </Select>
                </CardBody>
              </Card>

              {/* Contact Information */}
              <Card className="col-span-full">
                <CardHeader className="flex gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <p className="text-small text-default-500">Enter contact details and communication preferences</p>
                  </div>
                </CardHeader>
                <Divider/>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Official Email"
                    type="email"
                    value={formData.officialEmail}
                    onChange={(e) => setFormData({...formData, officialEmail: e.target.value})}
                    errorMessage={errors.officialEmail}
                    isInvalid={!!errors.officialEmail}
                    startContent={<Mail size={16}/>}
                    isRequired
                  />
                  <Input
                    label="Personal Email"
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                    errorMessage={errors.personalEmail}
                    isInvalid={!!errors.personalEmail}
                    startContent={<Mail size={16}/>}
                  />
                  <Input
                    label="Mobile Number"
                    value={formData.mobileNo1}
                    onChange={(e) => setFormData({...formData, mobileNo1: e.target.value})}
                    errorMessage={errors.mobileNo1}
                    isInvalid={!!errors.mobileNo1}
                    startContent={<Phone size={16}/>}
                    placeholder="Ex: 0771234567"
                  />
                  <Input
                    label="Alternative Mobile"
                    value={formData.mobileNo2}
                    onChange={(e) => setFormData({...formData, mobileNo2: e.target.value})}
                    startContent={<Phone size={16}/>}
                    placeholder="Ex: 0771234567"
                  />
                  <Input
                    label="Land Line"
                    value={formData.landLine}
                    onChange={(e) => setFormData({...formData, landLine: e.target.value})}
                    startContent={<Phone size={16}/>}
                    placeholder="Ex: 0112345678"
                  />
                  <Input
                    label="Extension"
                    value={formData.extension}
                    onChange={(e) => setFormData({...formData, extension: e.target.value})}
                    placeholder="Ex: 123"
                  />
                </CardBody>
              </Card>

              {/* Organization Information */}
              <Card className="col-span-full">
                <CardHeader className="flex gap-3">
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold">Organization Details</h3>
                    <p className="text-small text-default-500">Select the organizational hierarchy</p>
                  </div>
                </CardHeader>
                <Divider/>
                <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Department"
                    selectedKeys={formData.departmentId ? [formData.departmentId] : []}
                    onChange={(e) => {
                      setFormData({
                        ...formData, 
                        departmentId: e.target.value,
                        instituteId: '',
                        unitId: ''
                      });
                    }}
                    errorMessage={errors.departmentId}
                    isInvalid={!!errors.departmentId}
                    isRequired
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
                        unitId: ''
                      });
                    }}
                    errorMessage={errors.instituteId}
                    isInvalid={!!errors.instituteId}
                    isRequired
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
                    errorMessage={errors.unitId}
                    isInvalid={!!errors.unitId}
                    isRequired
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
                </CardBody>
              </Card>
            </div>
          </div>
        </ModalBody>
        <Divider/>
        <ModalFooter>
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center gap-2">
              {Object.keys(errors).length > 0 && (
                <div className="flex items-center gap-2 text-danger">
                  <AlertCircle size={16} />
                  <span className="text-small">Please fix the errors before submitting</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                color="danger" 
                variant="light" 
                onPress={handleClose}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                isLoading={loading}
                isDisabled={loading || (!contact && !isFormValid)}
              >
                {contact ? 'Save Changes' : 'Create Contact'}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 