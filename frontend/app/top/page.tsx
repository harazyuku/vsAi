import Navbar from "./components/Navbar";
import Background from "./components/Background";
import Main from "./components/Main";

export default function Home() {

  return (

    <div className="min-h-[100dvh] bg-black">

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
