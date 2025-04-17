"use client";

import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

// Configuração da fonte Inter do Google Fonts
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'UTASK - Plataforma de Serviços',
  description: 'Conectando pessoas a serviços de qualidade',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
