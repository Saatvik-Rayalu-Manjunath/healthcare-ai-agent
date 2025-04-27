"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Use React.ComponentProps to infer the props type from NextThemesProvider
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}