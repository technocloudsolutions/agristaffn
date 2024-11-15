"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Avatar,
  Divider,
  Chip,
} from "@nextui-org/react";
import { Mail, Phone, Building2, User2, Calendar } from "lucide-react";

interface ViewContactModalProps {
  contact: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewContactModal({ contact, isOpen, onClose }: ViewContactModalProps) {
  if (!contact) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <Avatar
              src={contact.profilePicture}
              className="w-20 h-20"
              showFallback
            />
            <div>
              <h2 className="text-xl font-bold">{contact.fullName}</h2>
              <p className="text-default-500">{contact.designation}</p>
              <Chip
                className="mt-2"
                color={contact.contactStatus === "Active" ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {contact.contactStatus}
              </Chip>
            </div>
          </div>
        </ModalHeader>
        <Divider/>
        <ModalBody className="gap-6 py-6">
          <div className="space-y-6">
            {/* Organization Info */}
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Building2 size={20}/>
                Organization Details
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-7">
                <div>
                  <p className="text-small text-default-500">Department</p>
                  <p className="font-medium">{contact.department}</p>
                </div>
                <div>
                  <p className="text-small text-default-500">Institute</p>
                  <p className="font-medium">{contact.institute}</p>
                </div>
                <div>
                  <p className="text-small text-default-500">Unit</p>
                  <p className="font-medium">{contact.unit}</p>
                </div>
                <div>
                  <p className="text-small text-default-500">Contact Type</p>
                  <p className="font-medium">{contact.contactType}</p>
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Phone size={20}/>
                Contact Information
              </h3>
              <div className="space-y-3 pl-7">
                <div>
                  <p className="text-small text-default-500">Mobile Numbers</p>
                  <p className="font-medium">{contact.mobileNo1}</p>
                  {contact.mobileNo2 && (
                    <p className="font-medium">{contact.mobileNo2}</p>
                  )}
                </div>
                {(contact.landLine || contact.extension) && (
                  <div>
                    <p className="text-small text-default-500">Land Line</p>
                    <p className="font-medium">
                      {contact.landLine} 
                      {contact.extension && ` (Ext: ${contact.extension})`}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Email Info */}
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Mail size={20}/>
                Email Addresses
              </h3>
              <div className="space-y-3 pl-7">
                <div>
                  <p className="text-small text-default-500">Official Email</p>
                  <p className="font-medium">{contact.officialEmail}</p>
                </div>
                {contact.personalEmail && (
                  <div>
                    <p className="text-small text-default-500">Personal Email</p>
                    <p className="font-medium">{contact.personalEmail}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Timestamps */}
            <section>
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Calendar size={20}/>
                Record Information
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-7">
                <div>
                  <p className="text-small text-default-500">Created At</p>
                  <p className="font-medium">
                    {contact.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-small text-default-500">Last Updated</p>
                  <p className="font-medium">
                    {contact.updatedAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              color="primary"
              variant="light" 
              onPress={onClose}
            >
              Close
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 