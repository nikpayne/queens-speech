"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
      </body>
    </html>
  );
}
