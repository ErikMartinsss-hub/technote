"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  href: string;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  action?: ToastAction;
}

interface ToastState {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
}

let toastCounter = 0;

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = `toast-${Date.now()}-${toastCounter++}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    if (typeof window !== "undefined") {
      window.setTimeout(() => get().dismiss(id), 4800);
    }
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string, action?: ToastAction) =>
    useToast.getState().push({ title, description, variant: "success", action }),
  error: (title: string, description?: string) =>
    useToast.getState().push({ title, description, variant: "error" }),
  info: (title: string, description?: string, action?: ToastAction) =>
    useToast.getState().push({ title, description, variant: "info", action }),
};
