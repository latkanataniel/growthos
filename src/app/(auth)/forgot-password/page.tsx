'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Sprawdź email');
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">Resetuj hasło</CardTitle>
        <p className="text-sm text-muted-foreground">Wyślemy Ci link do resetowania hasła</p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Wysyłanie...' : 'Wyślij link'}
          </Button>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Wróć do logowania
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
