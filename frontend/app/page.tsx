import Image from "next/image";
import Navbar from "./components/Navbar";
import Background from "./components/Background";
import Main from "./components/Main";

export default function Home() {
  return (

    <div className="h-screen bg-black">

      <main className="">
        <div className="fixed inset-0 z-0">
          <Background />
          <div className="absolute inset-0 bg-black/40" />
        </div>


        <Navbar />

        <Main />
      </main>
    </div>
  );
}
