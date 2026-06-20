import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Approach from "./components/Approach";
import Results from "./components/Results";

export default function App() {
  return (
    <>
      <a
        href="#results"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to results
      </a>
      <Nav />
      <main>
        <Hero />
        <Approach />
        <Results />
      </main>
    </>
  );
}
