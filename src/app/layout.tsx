"use client";

import React from 'react';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>UTASK - Plataforma de Serviços</title>
        <meta name="description" content="Conectando pessoas a serviços de qualidade" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <BottomNav />
          </div>
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
