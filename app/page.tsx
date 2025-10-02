import Image from "next/image";
import NavBar from "@/Components/NavBar"
import HomePagePlaces from "@/Components/HomePagePlaces";

export default function Home() {
  return (
    <div>
      
      <div>
        <NavBar/>
        <HomePagePlaces/>
      </div>
    </div>
  );
}
