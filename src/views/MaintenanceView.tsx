import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';

export const MaintenanceView = ({ onLoginClick }: any) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface relative">
    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <ShieldAlert className="w-10 h-10 text-primary animate-pulse" />
    </div>
    <h1 className="text-3xl font-display font-bold mb-4">منصة ArtiX في أعمال صيانة</h1>
    <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
      نحن الآن نقوم بتحديث المكتبة وتطوير بعض الميزات الجديدة لنقدم لكم تجربة أفضل. سنعود للعمل قريباً جداً!
    </p>
    <div className="mt-10 text-xs text-outline flex flex-col items-center gap-4">
      <span>شكراً لصبركم وثقتكم بنا.</span>
      
      <button 
        onClick={onLoginClick} 
        className="text-primary/10 hover:text-primary transition-colors duration-300 p-2"
        title="دخول الإدارة"
      >
        <Lock className="w-4 h-4" />
      </button>
    </div>
  </div>
);
