import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Abstract from "./components/Abstract";
import Approach from "./components/Approach";
import Architecture from "./components/Architecture";
import Results from "./components/Results";
import Limitations from "./components/Limitations";
import TechRole from "./components/TechRole";
import References from "./components/References";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <a
        href="#abstract"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Abstract />
        <Approach />
        <Architecture />
        <Results />
        <Limitations />
        <TechRole />
        <References />
      </main>
      <Footer />
    </>
  );
}
