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
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsAdmin(user.email === 'vb.ip.gt@gmail.com');
      } else {
        setIsAdmin(false);
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
