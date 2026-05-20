"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { NotificationService } from "../services/notificationService";

interface NotificationItem {
  id?: string | number;
  title?: string;
  detail?: string;
  body?: string;
  createdAt?: string;
}

export default function NotificationList() {
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const limit = 20;
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;

    try {
      if (isRefresh) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const result = await NotificationService.getNotifications({
        userId: user.id.toString(),
        offset: isRefresh ? 0 : offset,
        limit,
      });

      if (result && result.status === "success") {
        const newNotifications = result.data || [];
        
        setNotifications((prev) => 
          isRefresh ? newNotifications : [...prev, ...newNotifications]
        );
        
        if (newNotifications.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (newNotifications.length > 0) {
          setOffset((prevOffset) => (isRefresh ? newNotifications.length : prevOffset + newNotifications.length));
        }
      } else {
        if (!isRefresh) setHasMore(false);
      }
    } catch {
      if (!isRefresh) setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [user?.id, offset]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(true);
    }
  }, [user?.id, fetchNotifications]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          fetchNotifications();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNotifications, hasMore, isFetchingMore, isLoading]);

  const getIconProps = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('alert') || t.includes('warning')) {
      return {
        path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        color: "text-orange-500",
        bg: "bg-orange-50"
      };
    } else if (t.includes('success') || t.includes('completed')) {
      return {
        path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        color: "text-green-500",
        bg: "bg-green-50"
      };
    } else if (t.includes('message') || t.includes('chat')) {
      return {
        path: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
        color: "text-blue-500",
        bg: "bg-blue-50"
      };
    }
    return {
      path: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    };
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 7) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } else if (diffInDays >= 1) {
      return `${diffInDays}d ago`;
    } else if (diffInHours >= 1) {
      return `${diffInHours}h ago`;
    } else if (diffInMinutes >= 1) {
      return `${diffInMinutes}m ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button 
          onClick={() => fetchNotifications(true)}
          disabled={isLoading}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2 disabled:opacity-70"
        >
          {isLoading && notifications.length > 0 && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          Refresh Data
        </button>
      </div>

      {isLoading && notifications.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h2>
          <p className="text-gray-500 max-w-sm">We&apos;ll let you know when something arrives or requires your attention.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item, index) => {
            const title = item.title || "Notification";
            const iconProps = getIconProps(title);
            
            return (
              <div 
                key={item.id || index} 
                className="bg-white p-5 text-left rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default flex gap-5 group"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconProps.bg} ${iconProps.color}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconProps.path} />
                  </svg>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 mb-2">
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{title}</h3>
                    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed truncate md:whitespace-normal md:overflow-visible overflow-hidden">
                    {item.detail || item.body || "No details available"}
                  </p>
                </div>
              </div>
            );
          })}
          
          {hasMore && (
            <div ref={loadMoreRef} className="py-6 flex justify-center h-24 items-center">
              {isFetchingMore && (
                <div className="bg-white border border-gray-200 text-gray-700 font-medium py-3 px-8 rounded-xl shadow-sm flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Loading...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
