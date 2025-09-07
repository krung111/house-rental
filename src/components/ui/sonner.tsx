"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      duration={8000} // 8s auto-close
      position="bottom-right"
      richColors
      style={
        {
          // Neutral / subtle tones for a minimal UI
          "--normal-bg": "var(--popover)", // soft background
          "--normal-text": "var(--popover-foreground)", // readable text
          "--normal-border": "var(--border)", // subtle border
          "--success-bg": "var(--green-200)", // subtle success background
          "--success-text": "var(--green-900)", // subtle success text
          "--destructive-bg": "var(--red-200)", // subtle destructive background
          "--destructive-text": "var(--red-900)", // subtle destructive text
          "--icon-size": "18px", // slightly larger icons
          "--border-radius": "0.6rem", // soft rounded corners
          "--shadow": "0 4px 12px rgba(0,0,0,0.08)", // subtle shadow
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
