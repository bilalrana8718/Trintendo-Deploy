// Inspired by shadcn/ui toast implementation
import { useState, useEffect } from 'react';

// Unique ID for toasts
const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Initial state
const toastTimeouts = new Map();
const listeners = new Set();

export const toastState = {
  toasts: [],
};

function addToast(toast) {
  const id = toast.id || genId();
  
  const newToast = {
    ...toast,
    id,
    open: true,
    onOpenChange: (open) => {
      if (!open) {
        dismissToast(id);
      }
    },
  };

  // Check if toast already exists
  const toastIndex = toastState.toasts.findIndex((t) => t.id === id);
  if (toastIndex >= 0) {
    toastState.toasts[toastIndex] = newToast;
  } else {
    toastState.toasts = [newToast, ...toastState.toasts].slice(0, TOAST_LIMIT);
  }

  listeners.forEach((listener) => listener(toastState.toasts));

  return id;
}

function dismissToast(id) {
  // Find toast
  const toastIndex = toastState.toasts.findIndex((t) => t.id === id);
  if (toastIndex < 0) return;

  // Update toast
  const newToasts = [...toastState.toasts];
  newToasts[toastIndex].open = false;
  toastState.toasts = newToasts;

  // Notify listeners
  listeners.forEach((listener) => listener(toastState.toasts));

  // Remove toast after delay
  if (toastTimeouts.has(id)) {
    clearTimeout(toastTimeouts.get(id));
  }

  toastTimeouts.set(
    id,
    setTimeout(() => {
      toastState.toasts = toastState.toasts.filter((t) => t.id !== id);
      listeners.forEach((listener) => listener(toastState.toasts));
      toastTimeouts.delete(id);
    }, TOAST_REMOVE_DELAY)
  );
}

export function useToast() {
  const [toasts, setToasts] = useState(toastState.toasts);

  useEffect(() => {
    listeners.add(setToasts);
    return () => listeners.delete(setToasts);
  }, []);

  return {
    toast: (props) => addToast(props),
    toasts,
    dismissToast,
  };
} 