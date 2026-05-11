import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Button, Input, Textarea } from '../../components/Shared';

export const AdminSettingsView = () => {
  const [categoriesInput, setCategoriesInput] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (data) {
        setCategoriesInput(data.categories ? data.categories.join(', ') : '');
        setMaintenanceMode(data.maintenance_mode || false);
        setSeoTitle(data.seo_title || '');
        setSeoDesc(data.seo_desc || '');
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setMessage('');
    try {
      const parsedCategories = categoriesInput.split(',').map(c => c.trim()).filter(c => c);
      const { error } = await supabase.from('site_settings').upsert({ 
        id: 1, 
        categories: parsedCategories,
        maintenance_mode: maintenanceMode, 
        seo_title: seoTitle,
        seo_desc: seoDesc
      });
      if (error) throw error;
      
      setMessage('تم حفظ الإعدادات بنجاح!');
      window.dispatchEvent(new Event('refresh-settings'));
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('حدث خطأ: ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8" dir="rtl">
      {message && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-200 text-sm font-medium text-center">
          {message}
        </div>
      )}

      <div className="bg-surface-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-display font-semibold mb-1">الأقسام (Categories)</h3>
          <p className="text-sm text-on-surface-variant mb-4">أدخل الأقسام مفصولة بفاصلة (,)</p>
          <Input 
            value={categoriesInput} 
            onChange={(e: any) => setCategoriesInput(e.target.value)} 
            placeholder="مثال: تصوير، شعارات، خلفيات"
          />
        </div>
      </div>

      <div className="bg-surface-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-display font-semibold mb-1 flex items-center gap-2">
            🚀 إعدادات محركات البحث (SEO)
          </h3>
          <p className="text-sm text-on-surface-variant mb-6 flex flex-col gap-1">
            <span>هذه الإعدادات هامة جداً لتصدر نتائج البحث في جوجل وغيرها.</span>
            <span className="text-red-500 font-bold">ملاحظة هامة: يجب أن يتم تفعيل اشتراك Pro للـ Supabase حتى يتمكن جوجل من أرشفة الصفحة لأنها بوضع Spa حاليا.</span>
          </p>
          
          <div className="space-y-5">
            <Input 
              label="عنوان الموقع (SEO Title)"
              value={seoTitle} 
              onChange={(e: any) => setSeoTitle(e.target.value)} 
              placeholder="مثال: ArtiX | أكبر مكتبة برومبتات عربية"
            />
            
            <Textarea 
              label="وصف الموقع (Meta Description)"
              rows={3}
              value={seoDesc} 
              onChange={(e: any) => setSeoDesc(e.target.value)} 
              placeholder="اكتب وصفاً جذاباً يظهر أسفل رابط الموقع في نتائج جوجل..."
            />
          </div>
        </div>
      </div>

      <div className="bg-surface-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm space-y-6 border-red-500/20 bg-red-50/10">
        <div>
          <h3 className="text-lg font-display font-semibold text-red-600 mb-1">وضع الصيانة (Maintenance Mode)</h3>
          <p className="text-sm text-on-surface-variant mb-4">
            عند التفعيل، لن يتمكن الزوار من الدخول للمنصة وسيظهر لهم صفحة الصيانة. 
            (الأدمن فقط هو من يمكنه تسجيل الدخول والتصفح).
          </p>
          
          <div className="flex items-center gap-3 mt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
              <div className="w-14 h-7 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-[-100%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
              <span className="mr-3 text-sm font-medium text-on-surface-variant">تفعيل وضع الصيانة</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-start pt-4">
        <Button onClick={handleSaveSettings}>حفظ التعدادات وتطبيق التغييرات</Button>
      </div>

    </div>
  );
};
