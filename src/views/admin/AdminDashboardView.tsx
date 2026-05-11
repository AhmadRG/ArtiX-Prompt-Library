import React from 'react';
import { PlusCircle } from 'lucide-react';

export const AdminDashboardView = ({ promptsData = [] }: any) => {
  const totalPrompts = promptsData.length;
  const totalViews = promptsData.reduce((sum: number, prompt: any) => sum + (prompt.views || 0), 0);
  const totalDownloads = promptsData.reduce((sum: number, prompt: any) => sum + (prompt.downloads || 0), 0);
  
  const kpis = [
    { label: 'إجمالي البرومبتات', value: totalPrompts.toString(), trend: 'مباشر', positive: true },
    { label: 'إجمالي المشاهدات', value: totalViews.toString(), trend: 'مباشر', positive: true },
    { label: 'عمليات النسخ', value: totalDownloads.toString(), trend: 'مباشر', positive: true },
    { label: 'حالة المكتبة', value: totalPrompts > 0 ? 'نشط' : 'فارغ', trend: '', positive: true },
  ];

  const categoryCounts = promptsData.reduce((acc: any, prompt: any) => {
    const cat = prompt.category || 'غير مصنف';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  const chartData = Object.entries(categoryCounts)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 7)
    .map(([cat, count]: any) => ({
      label: cat,
      value: count
    }));
  
  const maxChartValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 1;
  const recentPrompts = promptsData.slice(0, 3);

  return (
    <div className="space-y-8" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm text-right">
            <p className="text-sm font-medium text-on-surface-variant mb-2">{kpi.label}</p>
            <div className="flex items-end justify-between flex-row-reverse">
              <h3 className="text-3xl font-display font-bold text-left">{kpi.value}</h3>
              <span className={`text-sm font-medium ${kpi.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-semibold text-lg">كثافة البرومبتات حسب القسم</h3>
          </div>
          
          {chartData.length > 0 ? (
            <div className="flex-1 flex items-end gap-2 sm:gap-4 h-64 mt-4 relative pt-10">
              {chartData.map((data, i) => {
                const heightPercent = Math.max((data.value / maxChartValue) * 100, 5); 
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end cursor-pointer">
                    <div className="absolute -top-12 bg-on-surface text-surface-lowest px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 whitespace-nowrap z-10 shadow-ambient pointer-events-none">
                      {data.value} برومبت
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-on-surface"></div>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-t-xl relative overflow-hidden flex items-end h-full">
                      <div 
                        className="w-full bg-primary rounded-t-xl transition-all duration-1000 ease-out group-hover:bg-primary/80"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium truncate w-full text-center px-1">
                      {data.label}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[200px] border-2 border-dashed border-outline-variant rounded-2xl bg-surface-low/50">
              <p className="text-on-surface-variant text-sm font-medium">قم بإضافة برومبتات ليظهر المخطط البياني</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-surface-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center">
            <h3 className="font-display font-semibold text-lg w-full mb-6 text-right">المجموع الكلي</h3>
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f0eded" strokeWidth="15" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#003b93" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="60" className="transition-all duration-1000" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6b38d4" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset="190" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-on-surface">{totalPrompts}</span>
                <span className="text-xs text-on-surface-variant mt-1">برومبت</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
            <h3 className="font-display font-semibold text-lg mb-4 text-right">أحدث الإضافات</h3>
            <div className="space-y-4">
              {recentPrompts.length > 0 ? recentPrompts.map((prompt: any) => (
                <div key={prompt.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <PlusCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-right flex-1">
                    <p className="text-sm text-on-surface">
                      تمت إضافة <span className="font-medium text-primary">{prompt.title}</span>
                    </p>
                    <p className="text-xs text-outline mt-0.5">{prompt.category}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-on-surface-variant text-center py-4">لا يوجد نشاطات حديثة</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
