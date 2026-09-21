import { Beneficios } from "@/components/landing/Beneficios";
import { Clases } from "@/components/landing/Clases";
import { CtaFinal } from "@/components/landing/CtaFinal";
import { Footer } from "@/components/landing/Footer";
import { Frase } from "@/components/landing/Frase";
import { Galeria } from "@/components/landing/Galeria";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Horarios } from "@/components/landing/Horarios";
import { Profesoras } from "@/components/landing/Profesoras";
import { Ubicacion } from "@/components/landing/Ubicacion";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Frase />
        <Beneficios />
        <Profesoras />
        <Clases />
        <Galeria />
        <Horarios />
        <Ubicacion />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
