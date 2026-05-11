import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../supabase';
import { Button, Input } from '../components/Shared';

export const LoginView = ({ onLoginSuccess, onBack }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan_type')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        const adminEmails = ['vb.ip.gt@gmail.com']; 

        if (authData.user && adminEmails.includes(authData.user.email || '')) {
          window.dispatchEvent(new Event('refresh-prompts'));
          window.dispatchEvent(new Event('refresh-settings'));
          onLoginSuccess('admin'); 
        } else if (profile && profile.plan_type !== 'free') {
          window.dispatchEvent(new Event('refresh-prompts'));
          window.dispatchEvent(new Event('refresh-settings'));
          onLoginSuccess('user'); 
        } else {
          await supabase.auth.signOut();
          setError('عذراً، هذه المكتبة متاحة فقط لمشتركي باقة Pro فأعلى.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ، يرجى التأكد من الإيميل وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-lowest rounded-3xl shadow-ambient p-10 border border-outline-variant/30 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-full signature-gradient flex items-center justify-center">
            <span className="text-white font-display font-bold text-2xl leading-none">L</span>
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-center mb-2">تسجيل الدخول</h2>
        <p className="text-sm text-on-surface-variant text-center mb-8">سجل دخولك باستخدام حسابك في ArtiX.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}
          <Input 
            label="البريد الإلكتروني" 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            required 
            disabled={loading}
          />
          <Input 
            label="كلمة المرور" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            required 
            disabled={loading}
          />
          
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'جاري التحقق...' : 'دخول'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};
