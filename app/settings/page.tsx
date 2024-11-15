"use client";

import { Tabs, Tab, Card, CardBody, Button } from "@nextui-org/react";
import UserManagement from "@/components/UserManagement";
import CategoryManagement from "@/components/CategoryManagement";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { toast } from "sonner";

export default function Settings() {
  const router = useRouter();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("categories");

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setUserRole(userData?.role || null);
        
        if (userData?.role === 'Admin') {
          setSelectedTab("users");
        }
      }
    };

    fetchUserRole();
  }, [user]);

  const handleTabChange = (key: string) => {
    if (key === "users" && userRole !== "Admin") {
      toast.error("Only Admin users can access User Management");
      return;
    }
    setSelectedTab(key);
  };

  return (
    <AdminProtectedRoute>
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="light"
            startContent={<ArrowLeft size={20} />}
            onPress={() => router.back()}
            className="text-default-500"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <Tabs 
          aria-label="Settings tabs"
          selectedKey={selectedTab}
          onSelectionChange={(key) => handleTabChange(key as string)}
          classNames={{
            tabList: "gap-4",
            cursor: "bg-green-500",
            tab: "text-gray-600 dark:text-gray-400",
            tabContent: "group-data-[selected=true]:text-green-600"
          }}
        >
          {userRole === 'Admin' && (
            <Tab key="users" title="User Management">
              <Card>
                <CardBody>
                  <UserManagement />
                </CardBody>
              </Card>
            </Tab>
          )}
          <Tab 
            key="categories" 
            title="Category Management"
          >
            <Card>
              <CardBody>
                <CategoryManagement />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </AdminProtectedRoute>
  );
} 