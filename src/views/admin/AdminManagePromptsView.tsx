import React, { useState } from 'react';
import { Search, Filter, Edit2, Trash2, Eye, Download } from 'lucide-react';
import { supabase } from '../../supabase';

export const AdminManagePromptsView = ({ promptsData, onEditPrompt }: any) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' }); 

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const uniqueCategories = ['All', ...Array.from(new Set(promptsData.map((p: any) => p.category)))];

  const filteredPrompts = promptsData.filter((prompt: any) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (prompt.description && prompt.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setActionMessage({ type: '', text: '' });
    
    try {
      const { data, error } = await supabase
        .from('prompt_library')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setActionMessage({ type: 'error', text: 'تم رفض الحذف. يرجى التأكد من صلاحيات قاعدة البيانات.' });
        return;
      }
      
      setActionMessage({ type: 'success', text: 'تم حذف البرومبت بنجاح!' });
      window.dispatchEvent(new Event('refresh-prompts'));
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
      
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'تنبيه: ' + err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline-variant" />
          <input 
            type="text" 
            placeholder="البحث في البرومبتات..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-lowest border border-outline-variant rounded-full pr-11 pl-4 py-2.5 text-sm focus:outline-none focus:border-primary text-right transition-colors"
            dir="rtl"
          />
        </div>

        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant flex items-center gap-2">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-surface-lowest border border-outline-variant rounded-full pr-11 pl-8 py-2.5 text-sm font-medium text-on-surface-variant focus:outline-none focus:border-primary cursor-pointer hover:bg-surface-low transition-colors min-w-[140px]"
            dir="rtl"
          >
            <option value="All">كل الأقسام</option>
            {uniqueCategories.filter((c: any) => c !== 'All').map((cat: any) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      {actionMessage.text && (
        <div className={`p-4 rounded-xl text-sm font-medium text-center ${actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {actionMessage.text}
        </div>
      )}

      <div className="bg-surface-lowest border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" dir="ltr">
            <thead>
              <tr className="border-b border-surface-container-high text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-4">Prompt Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {filteredPrompts.map((prompt: any) => (
                <tr key={prompt.id} className="hover:bg-surface-low/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={prompt.image} alt={prompt.title} className="w-12 h-12 rounded-xl object-cover border border-outline-variant/20" />
                      <div className="text-right flex-1" dir="rtl">
                        <h4 className="font-display font-medium text-on-surface line-clamp-1">{prompt.title}</h4>
                        <p className="text-xs text-on-surface-variant line-clamp-1 max-w-[200px]">{prompt.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-xs font-medium text-on-surface-variant">
                      {prompt.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {prompt.views}</span>
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {prompt.downloads}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {prompt.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="تعديل"
                        onClick={() => onEditPrompt(prompt)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="حذف"
                        onClick={() => handleDelete(prompt.id)}
                        disabled={deletingId === prompt.id}
                      >
                        {deletingId === prompt.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPrompts.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              {searchQuery || selectedCategory !== 'All' 
                ? 'لا توجد نتائج تطابق بحثك.' 
                : 'لا يوجد برومبتات حالياً. ابدأ بإضافة البعض!'}
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-surface-container-high flex items-center justify-between text-sm text-on-surface-variant flex-row-reverse">
          <span>إجمالي البرومبتات المعروضة: {filteredPrompts.length}</span>
        </div>
      </div>
    </div>
  );
};
