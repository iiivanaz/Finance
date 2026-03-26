import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import type { AuthError } from '@supabase/supabase-js';

interface AuthProps {
  onSignIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
}

export function Auth({ onSignIn, onSignUp }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await onSignIn(email, password);
        if (error) {
          let message = 'Terjadi kesalahan';
          if (error.message === 'Invalid login credentials') {
            message = 'Email atau password salah';
          } else if (error.message.includes('Email not confirmed')) {
            message = 'Email belum diverifikasi. Cek inbox email Anda.';
          } else {
            message = error.message;
          }
          setError(message);
        }
      } else {
        const { error } = await onSignUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Pendaftaran berhasil! Silakan cek email untuk verifikasi.');
          setEmail('');
          setPassword('');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
      style={{ background: 'linear-gradient(135deg, #e8e0d0 0%, #d4c8b0 50%, #c8bba0 100%)' }}>
      
      <div className="skeuo-card w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(145deg, #c9a227 0%, #a88220 50%, #8b6914 100%)',
              border: '3px solid #6b5010',
              boxShadow: '0 6px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}>
            <Wallet className="h-8 w-8 text-[#f5f0e6]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#3d2914]">
            Catatan Keuangan
          </h1>
          <p className="text-sm text-[#a09080] font-serif mt-1">
            Kelola keuanganmu dengan mudah
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => {
          setIsLogin(v === 'login');
          setError(null);
          setSuccess(null);
        }} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 gap-1"
            style={{
              background: 'linear-gradient(180deg, #d8d0c0 0%, #c8c0b0 100%)',
              padding: '4px',
              borderRadius: '10px'
            }}>
            <TabsTrigger value="login" className="font-serif data-[state=active]:shadow-lg">
              Masuk
            </TabsTrigger>
            <TabsTrigger value="register" className="font-serif data-[state=active]:shadow-lg">
              Daftar
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-serif text-[#5a3a1e] mb-1 block">Email</Label>
            <div className="relative">
              <Mail className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a09080]" />
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="skeuo-input h-12 pl-10 font-serif"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-serif text-[#5a3a1e] mb-1 block">Password</Label>
            <div className="relative">
              <Lock className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a09080]" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="skeuo-input h-12 pl-10 pr-10 font-serif"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09080] hover:text-[#5a3a1e]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-[#a09080] font-serif mt-1">
                Minimal 6 karakter
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm font-serif bg-[#f5e8e8] text-[#8b3a3a] border border-[#a54a4a]">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg text-sm font-serif bg-[#d0e8d0] text-[#1d4a2d] border border-[#4a8a5a]">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 font-serif font-bold"
            style={{
              background: 'linear-gradient(180deg, #8b5a2b 0%, #6b4423 50%, #5a3a1e 100%)',
              border: '1px solid #4a3018',
              boxShadow: '0 4px 0 #3d2914, 0 6px 12px rgba(0,0,0,0.2)',
              color: '#f5f0e6'
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Memuat...
              </>
            ) : (
              isLogin ? 'Masuk' : 'Daftar'
            )}
          </Button>
        </form>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-[#a09080] font-serif">
          <p>Data tersimpan aman di cloud Supabase</p>
          <p className="mt-1">Akses dari perangkat mana saja</p>
        </div>
      </div>
    </div>
  );
}
