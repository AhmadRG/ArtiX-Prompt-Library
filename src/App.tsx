import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabase';
import FastBackground from './FastBackground';
import { GalleryView } from './views/GalleryView';
import { PromptDetailView } from './views/PromptDetailView';
import { LoginView } from './views/LoginView';
import { MaintenanceView } from './views/MaintenanceView';
import { AdminLayout } from './views/admin/AdminLayout';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { AdminManagePromptsView } from './views/admin/AdminManagePromptsView';
import { AdminAddPromptView } from './views/admin/AdminAddPromptView';
import { AdminEditPromptView } from './views/admin/AdminEditPromptView';
import { AdminSettingsView } from './views/admin/AdminSettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState('login'); 
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [promptsData, setPromptsData] = useState<any[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason &&
        event.reason.message &&
        event.reason.message.includes('Refresh Token')
      ) {
        event.preventDefault(); // يمنع ظهور شاشة الخطأ الحمراء في Vite
        console.warn('Supabase auth error suppressed:', event.reason.message);
        // تسجيل الخروج لتنظيف الجلسة القديمة التالفة
        supabase.auth.signOut();
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('artix_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    } else {
      setTheme('dark'); // Default to dark as per original design
    }
  }, []);

  useEffect(() => {
    // Apply theme class to HTML root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('artix_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Session error:', sessionError.message);
          await supabase.auth.signOut();
        }

        if (session && session.user) {
          const isAdminUser = session.user.email === 'vb.ip.gt@gmail.com';
          setIsAdmin(isAdminUser);
          
          if (isAdminUser) {
            setCurrentView('admin-dashboard');
          } else {
            // جلب تفاصيل الحساب للتحقق من خطة الاشتراك
            const { data: profile } = await supabase
              .from('profiles')
              .select('plan_type')
              .eq('id', session.user.id)
              .single();
            
            if (profile && profile.plan_type !== 'free') {
              setCurrentView('gallery');
            } else {
              // إذا كان مسجل دخول ولكن بباحة مجانية (غير مسموح له بالمعرض) يتم خروجه
              await supabase.auth.signOut();
              setIsAdmin(false);
              setCurrentView('login');
            }
          }
        } else {
          setIsAdmin(false);
          setCurrentView('login');
        }
      } catch (err) {
        console.error('Error identifying logged in user session:', err);
        setIsAdmin(false);
        setCurrentView('login');
      } finally {
        setAuthLoading(false);
      }
    };
    checkUserRole();
    const fetchSettings = async () => {
      try {
        // جلب الإعدادات والـ SEO من قاعدة البيانات
        const { data } = await supabase.from('site_settings').select('maintenance_mode, categories, seo_title, seo_desc').eq('id', 1).single();
        if (data) {
          setMaintenanceMode(data.maintenance_mode);
          if (data.categories) setCategories(data.categories); 
          
          // ✨ تطبيق إعدادات SEO فوراً على المتصفح
          if (data.seo_title) {
            document.title = data.seo_title; // تغيير اسم التاب العلوي
          }
          
          // تغيير وصف الموقع لمحركات البحث (Meta Description)
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription && data.seo_desc) {
            metaDescription.setAttribute('content', data.seo_desc);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };

    const fetchPrompts = async () => {
      try {
        const { data, error } = await supabase
          .from('prompt_library')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedData = data.map((item: any) => ({
            id: item.id,
            title: item.title || 'بدون عنوان',
            category: item.category || 'All',
            aiModel: item.ai_model || 'أخرى',
            description: item.description || 'لا يوجد وصف حالياً',
            promptText: item.prompt_text || '',
            image: item.image_url || 'https://via.placeholder.com/800x600?text=No+Image',
            author: 'إدارة ArtiX',
            date: new Date(item.created_at).toLocaleDateString('ar-EG'),
            views: item.views || 0,
            downloads: item.downloads || 0,
            keywords: item.keywords ? item.keywords.split(',') : [],
            useCases: item.use_cases || '',
            promptVariables: item.prompt_variables || []
          }));
          setPromptsData(formattedData);
        }
      } catch (err) {
        console.error('Error fetching prompts:', err);
      } finally {
        setLoadingPrompts(false);
      }
    };

    fetchPrompts();
    fetchSettings(); 

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsAdmin(session.user.email === 'vb.ip.gt@gmail.com');
        fetchPrompts();
        fetchSettings();
      } else {
        setIsAdmin(false);
        setCurrentView('login');
      }
    });

    window.addEventListener('refresh-prompts', fetchPrompts);
    window.addEventListener('refresh-settings', fetchSettings); 
    
    return () => {
      window.removeEventListener('refresh-prompts', fetchPrompts);
      window.removeEventListener('refresh-settings', fetchSettings); 
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleViewPrompt = async (id: string) => {
    setSelectedPromptId(id);
    setCurrentView('prompt-detail');

    try {
      await supabase.rpc('increment_views', { prompt_id_text: id.toString() });
      window.dispatchEvent(new Event('refresh-prompts')); 
    } catch (error) {
      console.error('Error updating views count:', error);
    }
  };

  const renderView = () => {
    // التعديل الأول: إضافة !isAdmin لكي لا يتم حجب الأدمن ومنعه من رؤية المعرض
    if (maintenanceMode && !isAdmin && currentView !== 'login' && !currentView.startsWith('admin')) {
      return <MaintenanceView onLoginClick={() => setCurrentView('login')} />;
    }

    switch (currentView) {
      case 'gallery':
        return <GalleryView 
                 promptsData={promptsData} 
                 categories={categories}
                 isAdmin={isAdmin} 
                 theme={theme}
                 toggleTheme={toggleTheme}
                 onAdminClick={() => setCurrentView('admin-dashboard')} 
                 onViewPrompt={handleViewPrompt}
                 onLogout={async () => {
                   await supabase.auth.signOut(); 
                   setIsAdmin(false);
                   setCurrentView('login'); 
                 }} 
               />;

      case 'prompt-detail':
        return <PromptDetailView 
                 promptsData={promptsData} 
                 promptId={selectedPromptId} 
                 theme={theme}
                 toggleTheme={toggleTheme}
                 onBack={() => setCurrentView('gallery')} 
                 onViewPrompt={handleViewPrompt} // <--- هذا هو السطر الجديد!
               />;
    
      case 'login':
        return (
          <LoginView 
            onLoginSuccess={(role: string) => {
              setIsAdmin(role === 'admin'); 
              // التعديل الثاني: توجيه الأدمن للوحة التحكم فوراً، والمستخدم العادي للمعرض
              setCurrentView(role === 'admin' ? 'admin-dashboard' : 'gallery');    
            }} 
            onBack={() => setCurrentView('gallery')} 
          />
        );

      case 'admin-dashboard':
      case 'admin-prompts':
      case 'admin-add':
      case 'admin-settings':
      case 'admin-edit':
        return (
          <AdminLayout 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            onLogout={async () => {
              await supabase.auth.signOut();
              setIsAdmin(false);
              setCurrentView('login');
            }}
          >
            {currentView === 'admin-dashboard' && <AdminDashboardView promptsData={promptsData} />}
            
            {currentView === 'admin-prompts' && (
              <AdminManagePromptsView 
                promptsData={promptsData} 
                onEditPrompt={(prompt: any) => {
                  setEditingPrompt(prompt);
                  setCurrentView('admin-edit');
                }} 
              />
            )}
            
            {currentView === 'admin-add' && <AdminAddPromptView categories={categories} />}
            
            {currentView === 'admin-edit' && (
              <AdminEditPromptView 
                prompt={editingPrompt} 
                categories={categories} 
                onCancel={() => setCurrentView('admin-prompts')}
                onSuccess={() => setCurrentView('admin-prompts')}
              />
            )}
            
            {currentView === 'admin-settings' && <AdminSettingsView />}
          </AdminLayout>
        );

      default:
        return <GalleryView 
                 promptsData={promptsData} 
                 categories={categories}
                 isAdmin={isAdmin} 
                 onAdminClick={() => setCurrentView('admin-dashboard')} 
                 onViewPrompt={handleViewPrompt}
                 onLogout={async () => {
                   await supabase.auth.signOut(); 
                   setIsAdmin(false);
                   setCurrentView('login'); 
                 }} 
               />;
    }
  };

  if (authLoading || (loadingPrompts && currentView !== 'login')) {
    return (
      <>
        <FastBackground />
        <div className="min-h-screen flex flex-col items-center justify-center bg-transparent relative overflow-hidden" dir="rtl">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
              <span className="text-white font-display font-semibold text-2xl leading-none">A</span>
            </div>
            <div className="mt-4 flex flex-col items-center gap-2">
              <h3 className="font-display font-semibold text-xl text-gray-900 dark:text-white">جاري تحميل ArtiX...</h3>
              <p className="text-sm text-gray-500 dark:text-white/40">يرجى الانتظار ثوانٍ معدودة</p>
            </div>
            
            <div className="w-48 h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-3 relative">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full absolute left-0 top-0 animate-[progress_1.5s_infinite_ease-in-out]" 
                style={{ width: '40%', animationName: 'progress' }} 
              />
            </div>
          </div>
          
          <style>{`
            @keyframes progress {
              0% { left: -40%; }
              100% { left: 100%; }
            }
          `}</style>
        </div>
      </>
    );
  }

  return (
    // هنا قمنا بإضافة الخلفية التفاعلية الثابتة، وجعلنا الحاوية شفافة 
    <>
      <FastBackground />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView.startsWith('admin') ? 'admin' : currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15, ease: "circOut" }}
          className="min-h-[100dvh] w-full bg-transparent relative flex flex-col overflow-x-hidden"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
