import { SiteShell } from "./components/site/SiteShell";
import {
  Carries,
  Constraints,
  Demo,
  Faq,
  Hero,
  Scale,
  Statement,
} from "./components/site/Home";

/* The home page. Built from `app/components/site/`; the design, its tokens and the
   reasoning behind the moon are in `app/site.css` and `site/Moon.tsx`.

   Order is the argument: the claim (hero), what it means in a sentence (statement), the
   three levels it rests on (scale), one question going through them (demo), what comes
   back with an answer (carries), what the system may never do (constraints), and the
   questions left over. The close and the footer come from the shell. */
export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <Statement />
      <Scale />
      <Demo />
      <Carries />
      <Constraints />
      <Faq />
    </SiteShell>
  );
}
