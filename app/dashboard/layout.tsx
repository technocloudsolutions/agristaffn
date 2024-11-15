"use client";

import { Navbar, Button } from "@nextui-org/react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { Settings } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar 
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        maxWidth="full"
      >
        <div className="flex justify-between w-full items-center px-4">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-green-700 dark:text-green-400">
              Agri Staff Control Panel
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Department of Agriculture
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/settings">
              <Button 
                variant="flat"
                startContent={<Settings size={20} />}
              >
                Settings
              </Button>
            </Link>
            <Button 
              color="danger" 
              variant="flat" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </Navbar>
      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 