'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
} from '@nextui-org/react';
import { toast } from 'sonner';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard'); // or wherever you want to redirect after login
    } catch (error) {
      // Error is already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-default-500">Enter your credentials to continue</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardBody className="gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </CardBody>
          <CardFooter>
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={loading}
            >
              Log In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 