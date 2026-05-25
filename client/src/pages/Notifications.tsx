import { useState, useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, AlertCircle, Pin, ExternalLink, Loader2 } from 'lucide-react';
import api from '../utils/api';
import SEO from '../components/seo/SEO';

interface NotificationType {
  _id: string;
  title: string;
  content: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  isPinned: boolean;
  link?: string;
  createdAt: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="text-red-500" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'warning':
        return <AlertCircle className="text-amber-500" size={24} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <>
      <SEO 
        title="Notifications & Updates | Judicial Study Centre"
        description="Stay updated with the latest news, announcements, and alerts from Judicial Study Centre."
        canonicalUrl="/notifications"
      />
      
      <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-gold shadow-lg shadow-primary/20">
              <Bell size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary">Notifications</h1>
              <p className="text-slate-500 mt-1">Latest updates and announcements</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={40} className="animate-spin text-gold" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <Bell size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Notifications</h3>
              <p className="text-slate-500">You're all caught up! There are no new announcements at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification._id}
                  className={`relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-md ${notification.isPinned ? getBorderColor(notification.type) : 'border-slate-200 bg-white'}`}
                >
                  {notification.isPinned && (
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-6 -right-6 bg-gold text-primary text-[10px] font-bold py-1 px-8 rotate-45 shadow-sm">
                        PINNED
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="mt-1 shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-primary">{notification.title}</h3>
                        {notification.isPinned && <Pin size={14} className="text-gold" />}
                      </div>
                      
                      <div 
                        className="text-slate-600 mb-4 prose prose-sm max-w-none prose-p:my-1"
                        dangerouslySetInnerHTML={{ __html: notification.content }}
                      />
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/50">
                        <span className="text-xs font-medium text-slate-400">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        {notification.link && (
                          <a 
                            href={notification.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-gold transition-colors"
                          >
                            View Details <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
