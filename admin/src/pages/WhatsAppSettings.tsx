import { Save, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const WhatsAppSettings = () => {
  const [config, setConfig] = useState({
    number: '919876543210',
    defaultMessage: 'Hello Judicial Study Centre, I want to know more about your courses and admission process.',
    courseTemplate: 'Hello Judicial Study Centre, I want details about [COURSE_NAME].',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="text-green-500" /> WhatsApp Integration
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage the floating WhatsApp button configuration and pre-filled inquiry messages.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form className="space-y-8">
          
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Support Number</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Business Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  +
                </span>
                <input 
                  type="text" 
                  value={config.number}
                  onChange={(e) => setConfig({...config, number: e.target.value})}
                  className="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-none rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="919876543210" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Include country code without the '+' sign (e.g., 91 for India).</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Default Inquiry Message</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floating Button Message</label>
              <textarea 
                rows={3}
                value={config.defaultMessage}
                onChange={(e) => setConfig({...config, defaultMessage: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
              />
              <p className="text-xs text-gray-500 mt-2">This message will be pre-filled when a user clicks the floating WhatsApp button on general pages.</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Course-Specific Inquiry Template</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dynamic Message Template</label>
              <textarea 
                rows={3}
                value={config.courseTemplate}
                onChange={(e) => setConfig({...config, courseTemplate: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
              />
              <p className="text-xs text-gray-500 mt-2">Use the variable <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-mono">[COURSE_NAME]</code> which will be dynamically replaced with the actual course title when a student clicks the WhatsApp button from a Course Details page.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="button"
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Save size={18} /> Save Settings
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default WhatsAppSettings;
