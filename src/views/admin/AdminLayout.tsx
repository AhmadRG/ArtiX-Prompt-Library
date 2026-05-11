import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, FileText, PlusCircle, Settings, LogOut, ArrowLeft, MoreVertical, Globe } from 'lucide-react';

export const AdminLayout = ({ children, currentView, onViewChange, onLogout }: any) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-prompts', label: 'Prompts', icon: FileText },
    { id: 'admin-add', label: 'Add Prompt', icon: PlusCircle },
    { id: 'admin-settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (view: string) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface flex relative">
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 right-0 z-50 w-72 bg-surface-lowest border-l border-surface-container-high flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full signature-gradient flex items-center justify-center text-white font-bold">A</div>
            <span className="font-display font-semibold text-xl">ArtiX</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2"><ArrowLeft className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentView === item.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-low'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-container-high space-y-2">
          <button onClick={() => handleNavigate('gallery')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors">
            <Globe className="w-5 h-5" /> المعرض
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" /> خروج
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 px-4 md:px-8 flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-40 border-b border-surface-container-high lg:border-none">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl bg-surface-low text-on-surface-variant">
              <MoreVertical className="w-6 h-6 rotate-90" />
            </button>
            <h2 className="text-xl font-display font-semibold capitalize">{currentView.replace('admin-', '')}</h2>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
            <img src="https://i.ibb.co/0j34R6rJ/619259636-26479285658340275-1413968427283024766-n.jpg" alt="Admin" className="w-full h-full object-cover" />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
