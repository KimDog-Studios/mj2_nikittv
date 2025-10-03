"use client";
import React, { useState } from "react";
import Image from "next/image";
import NavBar from "@/Components/NavBar"
import HomePagePlaces from "@/Components/HomePagePlaces";
import HomePageOpeningTimes from "@/Components/HomePageOpeningTimes";
import HomePageInfo from "@/Components/HomePageInfo";
import BookingsForm from "@/Components/BookingsForm";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Toggle a place into/out of the booking form
  function handleToggleLocation(placeName: string) {
    setSelectedLocation(prev => (prev === placeName ? '' : placeName));
  }

  return (
    <div style={{ background: '#181A1B', minHeight: '100vh', width: '100vw' }}>
      <HomePageInfo/>
      <HomePageOpeningTimes/>
      <HomePagePlaces selectedLocation={selectedLocation} onToggleLocation={handleToggleLocation} />
      <BookingsForm selectedLocation={selectedLocation} onLocationChange={(loc:string) => setSelectedLocation(loc)} />
    </div>
  );
}
