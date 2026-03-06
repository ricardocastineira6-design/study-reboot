import { useEffect, useState } from 'react';
import type { User } from '../types';

type AuthHook = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
};

type StoredUser = {
  id: string;
  email: string;
  password: string; // stored only for local demo
  displayName?: string;
  createdAt: string;
};

const USERS_KEY = 'studyreboot_users_v1';
const SESSION_KEY = 'studyreboot_session_v1';

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): StoredUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function writeSession(user: StoredUser | null) {
  if (!user) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(() => {
    const s = readSession();
    if (!s) return null;
    return { id: s.id, email: s.email, displayName: s.displayName, createdAt: new Date(s.createdAt) } as User;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep session in sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        const s = readSession();
        if (!s) setUser(null);
        else setUser({ id: s.id, email: s.email, displayName: s.displayName, createdAt: new Date(s.createdAt) });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 200)); // simulate latency

    const users = readUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      setLoading(false);
      const err = new Error('Usuario no encontrado') as { code?: string };
      err.code = 'auth/user-not-found';
      throw err;
    }

    if (found.password !== password) {
      setLoading(false);
      const err = new Error('Contraseña incorrecta') as { code?: string };
      err.code = 'auth/wrong-password';
      throw err;
    }

    const session = { ...found };
    writeSession(session);
    setUser({ id: session.id, email: session.email, displayName: session.displayName, createdAt: new Date(session.createdAt) });
    setLoading(false);
  };

  const register = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    if (password.length < 6) {
      setLoading(false);
      const err = new Error('Contraseña demasiado débil') as { code?: string };
      err.code = 'auth/weak-password';
      throw err;
    }

    const users = readUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      setLoading(false);
      const err = new Error('Email ya registrado') as { code?: string };
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      email,
      password,
      displayName,
      createdAt: new Date().toISOString(),
    };

    users.unshift(newUser);
    writeUsers(users);

    writeSession(newUser);
    setUser({ id: newUser.id, email: newUser.email, displayName: newUser.displayName, createdAt: new Date(newUser.createdAt) });
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 150));
    writeSession(null);
    setUser(null);
    setLoading(false);
  };

  return { user, loading, login, register, logout };
}
