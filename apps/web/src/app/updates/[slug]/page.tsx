import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";
import { PostAuthor } from "@/components/post-author";
import { PostStatus } from "@/components/post-status";
import { getBlogPosts } from "@/lib/blog";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Section } from "@/components/section";

export async function generateStaticParams() {
  const posts = getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const post = getBlogPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;

  return {
    title: `${title}`,
    description,
    alternates: {
      canonical: `${baseUrl}/updates/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/updates/${post.slug}`,
      images: [
        {
          url: image!,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image!],
    },
  };
}

export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex justify-center py-4 md:py-12">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: `${baseUrl}${post.metadata.image}`,
            url: `${baseUrl}/updates/${post.slug}`,
          }),
        }}
      />

      <Section id={post.slug}>
        <div className="border border-gray-800 bg-black/50 p-8 backdrop-blur">
          <article className="space-y-6">
            <div className="space-y-4">
              <PostStatus status={post.metadata.tag} />
              <h1 className="font-medium text-4xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {post.metadata.title}
              </h1>
              <time className="text-sm text-gray-400 block">
                {new Date(post.metadata.publishedAt).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </time>
            </div>

            <div className="prose prose-invert prose-gray max-w-none">
              {post.metadata.image && (
                <div className="relative rounded-lg overflow-hidden border border-gray-800 flex justify-center">
                  <Image
                    src={post.metadata.image}
                    alt={post.metadata.title}
                    width={680}
                    height={442}
                    className="transition-transform hover:scale-105 duration-500 object-cover"
                  />
                </div>
              )}
              <CustomMDX source={post.content} />
            </div>

            <div className="mt-10 pt-6 border-t border-gray-800">
              <PostAuthor author="alex" />
            </div>
          </article>
        </div>
      </Section>
    </div>
  );
}
