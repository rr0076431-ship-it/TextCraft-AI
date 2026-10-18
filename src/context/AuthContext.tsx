import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, GenerationRecord } from '../types/index';
import { getTodayDateString, getRoleDailyLimit } from '../utils/textMetrics';

import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile;
  usedTodayCount: number;
  remainingTodayCount: number;
  history: GenerationRecord[];
  isLimitReached: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, role?: 'user' | 'admin', fullName?: string) => Promise<void>;
  register: (fullName: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  recordGeneration: (record: Omit<GenerationRecord, 'id' | 'timestamp'>) => GenerationRecord;
  toggleFavorite: (id: string) => void;
  deleteGeneration: (id: string) => void;
  clearHistory: () => void;
}

const GUEST_PROFILE: UserProfile = {
  id: 'guest',
  fullName: 'Guest User',
  email: '',
  role: 'guest',
  dailyLimit: 5,
  createdAt: Date.now(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('textcraft_user');
      return stored ? JSON.parse(stored) : GUEST_PROFILE;
    } catch {
      return GUEST_PROFILE;
    }
  });

  const [usedTodayCount, setUsedTodayCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('textcraft_usage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === getTodayDateString()) {
          return parsed.count || 0;
        }
      }
    } catch {
      // fallback
    }
    return 0;
  });

  const [history, setHistory] = useState<GenerationRecord[]>(() => {
    try {
      const stored = localStorage.getItem('textcraft_history');
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'hist-seed-1',
        toolSlug: 'article-writer',
        toolName: 'Article Writer',
        inputText: 'Benefits of Deep Work and Focus Habits in 2026',
        outputText: '# The Power of Deep Work\n\nDeep work is the ability to focus without distraction on a cognitively demanding task. In a world full of rapid notifications, cultivating concentration is a genuine superpower.\n\n### Key Habits\n- Dedicated distraction-free blocks\n- Daily deliberate shutdown rituals',
        thinkingMode: true,
        modelUsed: 'gemini-4-argon (Thinking)',
        timestamp: Date.now() - 3600 * 1000 * 2,
        wordCount: 142,
        isFavorite: true,
      },
      {
        id: 'hist-seed-2',
        toolSlug: 'paraphraser',
        toolName: 'Paraphraser',
        inputText: 'We are reaching out to let you know about upcoming upgrades to our servers next Friday.',
        outputText: 'We are pleased to inform you that crucial performance enhancements and system upgrades will take place on our servers next Friday.',
        thinkingMode: false,
        modelUsed: 'gemini-3.8-flash',
        timestamp: Date.now() - 3600 * 1000 * 5,
        wordCount: 22,
        isFavorite: false,
      },
    ];
  });

  // Sync with Supabase on mount if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const userMeta = session.user.user_metadata;
          const role = userMeta?.role || (session.user.email?.includes('admin') ? 'admin' : 'user');
          setUser({
            id: session.user.id,
            fullName: userMeta?.full_name || session.user.email?.split('@')[0] || 'Member',
            email: session.user.email || '',
            role,
            dailyLimit: getRoleDailyLimit(role),
            createdAt: new Date(session.user.created_at).getTime(),
          });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userMeta = session.user.user_metadata;
          const role = userMeta?.role || (session.user.email?.includes('admin') ? 'admin' : 'user');
          setUser({
            id: session.user.id,
            fullName: userMeta?.full_name || session.user.email?.split('@')[0] || 'Member',
            email: session.user.email || '',
            role,
            dailyLimit: getRoleDailyLimit(role),
            createdAt: new Date(session.user.created_at).getTime(),
          });
        } else {
          setUser(GUEST_PROFILE);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Persist user changes
  useEffect(() => {
    localStorage.setItem('textcraft_user', JSON.stringify(user));
  }, [user]);

  // Persist usage counter
  useEffect(() => {
    const data = {
      date: getTodayDateString(),
      count: usedTodayCount,
    };
    localStorage.setItem('textcraft_usage', JSON.stringify(data));
  }, [usedTodayCount]);

  // Persist history
  useEffect(() => {
    localStorage.setItem('textcraft_history', JSON.stringify(history));
  }, [history]);

  const dailyLimit = getRoleDailyLimit(user.role);
  const remainingTodayCount = Math.max(0, dailyLimit - usedTodayCount);
  const isLimitReached = usedTodayCount >= dailyLimit;

  const login = async (email: string, role: 'user' | 'admin' = 'user', fullName?: string) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signInWithPassword({
          email,
          password: 'Password123!',
        });
      } catch (err) {
        console.warn('Supabase signIn fallback to local state', err);
      }
    }
    const defaultName = role === 'admin' ? 'Admin Manager' : (email.split('@')[0] || 'Craft User');
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: fullName || defaultName,
      email: email,
      role: role,
      dailyLimit: getRoleDailyLimit(role),
      createdAt: Date.now(),
    };
    setUser(newUser);
  };

  const register = async (fullName: string, email: string, password = 'Password123!') => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
      } catch (err) {
        console.warn('Supabase signUp fallback to local state', err);
      }
    }
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: fullName || 'Registered User',
      email: email,
      role: 'user',
      dailyLimit: 20,
      createdAt: Date.now(),
    };
    setUser(newUser);
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // fallback
      }
    }
    setUser(GUEST_PROFILE);
  };

  const recordGeneration = (recordData: Omit<GenerationRecord, 'id' | 'timestamp'>): GenerationRecord => {
    const newRecord: GenerationRecord = {
      ...recordData,
      id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
    };

    setHistory((prev) => [newRecord, ...prev]);
    setUsedTodayCount((prev) => prev + 1);

    return newRecord;
  };

  const toggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const deleteGeneration = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usedTodayCount,
        remainingTodayCount,
        history,
        isLimitReached,
        isSupabaseConnected: isSupabaseConfigured,
        login,
        register,
        logout,
        recordGeneration,
        toggleFavorite,
        deleteGeneration,
        clearHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
