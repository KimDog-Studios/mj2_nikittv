"use client";
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the client NavBar without SSR to avoid server/client markup mismatch
const DynamicNavBar = dynamic(() => import('../NavBar'), { ssr: false });

export default function NavBarClient() {
  return <DynamicNavBar />;
}
