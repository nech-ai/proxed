import { Header } from "@/components/sections/header";
import { Footer } from "@/components/sections/footer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
      <Header />
      {children}
      <Footer />
    </main>
  );
}
