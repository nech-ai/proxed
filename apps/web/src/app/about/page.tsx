import { Section } from "@/components/section";
import { generateMetadata } from "@/lib/metadata";
import Image from "next/image";

export const metadata = generateMetadata({
  title: "About Proxed - Our Mission & Vision",
  description:
    "Learn about Proxed's mission to simplify protecting your AI keys on iOS. Founded by Alex Vakhitov, we're building an open-source platform to help you build your own iOS AI wrapper.",
  path: "/about",
});

export default function Page() {
  return (
    <div className="flex justify-center py-12">
      <Section id="about">
        <div className="border p-8 backdrop-blur">
          <h1 className="font-medium text-center text-5xl mb-16 leading-snug bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Building the Future of AI Access
          </h1>

          <div className="space-y-12">
            <section>
              <h3 className="font-medium text-xl mb-4 bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                Our Mission
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Proxed.ai was created to solve a common issue: while AI
                continues to revolutionise industries, integrating it securely
                and easily into apps remains a challenge. Drawing on experience
                from building successful technology in other sectors, we saw the
                need for a streamlined approach—where developers can focus on
                building great features instead of wrestling with device
                verification, API credentials, or complicated response handling.
              </p>
            </section>

            <section>
              <h3 className="font-medium text-xl mb-4 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                Open Source First
              </h3>
              <p className="text-gray-400 leading-relaxed mb-12">
                At its core, Proxed.ai is open source. We believe AI tooling
                should be transparent, community-driven, and built to address
                real-world problems. By offering a simple way to add DeviceCheck
                verification, manage API keys safely, and shape responses via an
                intuitive schema builder, Proxed.ai lets teams adopt AI faster
                while preserving control over their data and costs.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We're committed to evolving with the community, embracing
                collaboration, and keeping developers at the heart of
                innovation. Whether you're adding AI to a new app or
                strengthening an existing product, Proxed.ai is here to make
                secure, structured integration effortless—so you can focus on
                delivering the best experience possible.
              </p>
            </section>

            <section>
              <div className="flex justify-center">
                <Image
                  src={"/alex.jpeg"}
                  width={450}
                  height={290}
                  alt="Alex Vakhitov"
                  className="rounded-lg border border-gray-800/50"
                  priority
                />
              </div>
            </section>

            <div className="flex items-center pt-6 border-t border-gray-800">
              <div className="space-y-1">
                <p className="text-sm text-gray-400">Best regards,</p>
                <p className="font-medium">Alex Vakhitov</p>
                <p className="text-sm text-gray-400">Founder & CEO, Proxed</p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
