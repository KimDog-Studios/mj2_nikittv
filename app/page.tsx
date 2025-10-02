"use client";
import Image from "next/image";
import NavBar from "@/Components/NavBar"
import HomePagePlaces from "@/Components/HomePagePlaces";
import HomePageOpeningTimes from "@/Components/HomePageOpeningTimes";

export default function Home() {
  return (
    <div style={{ background: '#181A1B', minHeight: '100vh', width: '100vw' }}>
      <NavBar/>
      <HomePageOpeningTimes/>
      <HomePagePlaces/>
    </div>
  );
}
