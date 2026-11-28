import type { ReactNode } from "react";
import { ToastProvider } from "@alien6-studio/elea-ui";

export function Notifications({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ToastProvider
      label="Notifications"
      dismissLabel="Dismiss"
      position="top-center"
    >
      {children}
    </ToastProvider>
  );
}
