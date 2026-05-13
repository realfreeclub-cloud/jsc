import { Save, MessageCircle, Info } from 'lucide-react';
import { useState } from 'react';

const WhatsAppSettings = () => {
  const [config, setConfig] = useState({
    number: '919876543210',
    defaultMessage: 'Hello Judicial Study Centre, I want to know more about your courses and admission process.',
    courseTemplate: 'Hello Judicial Study Centre, I want details about [COURSE_NAME].',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-600/20 text-emerald-600 rounded-lg">
            <MessageCircle size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            WhatsApp Integration
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Configure how students interact with your support team via WhatsApp.</p>
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-premium border border-gray-100 dark:border-slate-900 overflow-hidden">
        <div className="p-8 space-y-8">
          <form className="space-y-10">
            
            {/* Number Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Support Number
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-2">WhatsApp Business Number</label>
                  <div className="flex group">
                    <div className="inline-flex items-center px-5 rounded-l-2xl border-none bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-bold">
                      +
                    </div>
                    <input 
                      type="text" 
                      value={config.number}
                      onChange={(e) => setConfig({...config, number: e.target.value})}
                      className="flex-1 min-w-0 block w-full px-5 py-4 rounded-none rounded-r-2xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all" 
                      placeholder="919876543210" 
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <Info size={14} />
                    Include country code without the '+' sign (e.g., 91 for India).
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-gray-50 dark:bg-slate-900" />

            {/* Default Message Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Floating Button Message
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-2">Global Inquiry Text</label>
                <textarea 
                  rows={3}
                  value={config.defaultMessage}
                  onChange={(e) => setConfig({...config, defaultMessage: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:text-white transition-all" 
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 italic">This message is pre-filled when a user clicks the floating button on general pages.</p>
              </div>
            </section>

            <div className="h-px bg-gray-50 dark:bg-slate-900" />

            {/* Course Template Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Dynamic Course Template
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-2">Message Pattern</label>
                <textarea 
                  rows={3}
                  value={config.courseTemplate}
                  onChange={(e) => setConfig({...config, courseTemplate: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:text-white transition-all font-medium" 
                />
                <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-600/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
                  <p className="text-[13px] text-blue-700 dark:text-blue-400 leading-relaxed">
                    <strong>Tip:</strong> Use the tag <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold shadow-sm">[COURSE_NAME]</code>. 
                    It will be auto-replaced with the course title when a student clicks from a specific course page.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-6">
              <button 
                type="button"
                className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95"
              >
                <Save size={20} /> Save Configuration
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettings;
