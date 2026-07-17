"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "student" | "class_advisor" | "department_officer" | "college_admin" | "super_admin";

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  college_id?: number;
  college?: {
    id: number;
    name: string;
    code: string;
  };
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  notifications: string[];
  addNotification: (msg: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Core mock logins to align with FastAPI pre-seeded accounts
export const MOCK_EMAILS: Record<UserRole, string> = {
  student: "student@campusai.com",
  class_advisor: "advisor@campusai.com",
  department_officer: "hostelofficer@campusai.com",
  college_admin: "ectadmin@campusai.com",
  super_admin: "superadmin@campusai.com",
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>("student");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Initialize theme from system or local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(systemTheme);
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Perform mock backend login when role changes
  const setRole = async (newRole: UserRole) => {
    setIsLoading(true);
    setRoleState(newRole);
    const email = MOCK_EMAILS[newRole];

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole }),
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        addNotification(`Switched role to ${newRole.replace("_", " ").toUpperCase()}: ${userData.name}`);
      } else {
        console.warn("Login request failed");
      }
    } catch (err) {
      console.warn("Failed to connect to API, using client fallback", err);
      // Fallback
      setUser({
        id: 999,
        email,
        name: newRole.charAt(0).toUpperCase() + newRole.slice(1).replace("_", " ") + " User",
        role: newRole,
        department: newRole === "student" || newRole === "class_advisor" ? "Computer Science" : undefined,
        college_id: 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger login on load
  useEffect(() => {
    setRole("student");
  }, []);

  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev.slice(0, 9)]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        user,
        setUser,
        theme,
        toggleTheme,
        isLoading,
        setIsLoading,
        notifications,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
