"use client";

import { useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Tabs, Tab } from "@nextui-org/react";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    try {
      await signUp(email, password, fullName);
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-2 items-center">
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-400">Agri Staff Control Panel</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Department of Agriculture</p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardHeader>
        <CardBody>
          <Tabs 
            aria-label="Authentication options" 
            fullWidth 
            classNames={{
              tabList: "gap-4",
              cursor: "bg-green-500",
              tab: "text-gray-600 dark:text-gray-400",
              tabContent: "group-data-[selected=true]:text-green-600"
            }}
          >
            <Tab key="login" title="Login">
              <form onSubmit={handleLogin} className="flex flex-col gap-4 py-4">
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  variant="bordered"
                  required
                />
                <Input
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  variant="bordered"
                  required
                />
                <Button 
                  type="submit" 
                  color="success" 
                  className="w-full"
                  isLoading={loading}
                >
                  Login
                </Button>
              </form>
            </Tab>
            <Tab key="signup" title="Sign Up">
              <form onSubmit={handleSignUp} className="flex flex-col gap-4 py-4">
                <Input
                  name="fullName"
                  label="Full Name"
                  placeholder="Enter your full name"
                  variant="bordered"
                  required
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  variant="bordered"
                  required
                />
                <Input
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  variant="bordered"
                  required
                />
                <Button 
                  type="submit" 
                  color="success" 
                  className="w-full"
                  isLoading={loading}
                >
                  Sign Up
                </Button>
              </form>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
      <footer className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Department of Agriculture, Sri Lanka. All rights reserved.</p>
        <p className="mt-1">Developed by Television and Farmers Broadcasting Service</p>
        <p className="mt-1 text-xs">Version 1.0.0</p>
      </footer>
    </section>
  );
}
