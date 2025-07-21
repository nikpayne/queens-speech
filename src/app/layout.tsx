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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=La+Belle+Aurore&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
      </body>
    </html>
  );
}
