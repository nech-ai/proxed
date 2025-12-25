"use client";

import { Section } from "@/components/section";
import { siteConfig } from "@/lib/config";
import { Button } from "@proxed/ui/components/button";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Spline from "@splinetool/react-spline";
import { GradientText } from "../gradient-text";

function SplineView() {
	const [isSplineLoaded, setIsSplineLoaded] = useState(false);

	const onSplineLoad = () => {
		setIsSplineLoaded(true);
	};

	return (
		<div
			className={`absolute inset-0 transition-opacity duration-500 ${isSplineLoaded ? "opacity-100" : "opacity-0"}`}
		>
			<Spline
				scene="/cube.splinecode"
				className="w-full h-full origin-top-left"
				onLoad={onSplineLoad}
			/>
		</div>
	);
}

function _HeroPill() {
	return (
		<a
			href="/updates/public-launch"
			className="group flex w-auto items-center space-x-2 bg-primary/20 px-3 py-1.5 ring-1 ring-accent rounded-full hover:bg-primary/30 transition-all duration-300"
		>
			<div className="w-fit bg-accent px-2 py-0.5 rounded-full text-left text-xs font-medium text-primary sm:text-sm">
				🚀 Beta
			</div>
			<span className="font-medium">Early Access Available</span>
			<span className="hidden sm:inline"> · </span>
			<span className="sm:inline">Join now for special pricing</span>
			<svg
				width="12"
				height="12"
				className="ml-1 transition-transform group-hover:translate-x-1"
				viewBox="0 0 12 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M8.78141 5.33312L5.20541 1.75712L6.14808 0.814453L11.3334 5.99979L6.14808 11.1851L5.20541 10.2425L8.78141 6.66645H0.666748V5.33312H8.78141Z"
					fill="hsl(var(--primary))"
				/>
			</svg>
		</a>
	);
}

function HeroTitles() {
	return (
		<div className="flex w-full max-w-3xl flex-col overflow-hidden pt-8">
			<h1 className="text-left text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter mt-4">
				<span className="inline-block text-balance">
					<GradientText as="h1" className="leading-tight">
						{siteConfig.hero.title}
					</GradientText>
				</span>
			</h1>
			<p className="text-left mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed text-balance">
				{siteConfig.hero.description}
			</p>
		</div>
	);
}

function HeroCTA() {
	return (
		<div className="relative mt-8">
			<div className="flex w-full max-w-2xl flex-col items-start justify-start space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
				<Button
					asChild
					className="w-full sm:w-auto h-12 px-8 text-base"
					size="lg"
				>
					<Link href="https://app.proxed.ai/signup">{siteConfig.hero.cta}</Link>
				</Button>
			</div>
			<p className="mt-4 text-sm text-muted-foreground text-left max-w-xl">
				{siteConfig.hero.ctaDescription}{" "}
				<span className="text-primary">Get started in under 5 minutes.</span>
			</p>
		</div>
	);
}

export function Hero() {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const checkMobile = useCallback(() => {
		setIsMobile(window.innerWidth < 1024);
	}, []);

	useEffect(() => {
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, [checkMobile]);

	useEffect(() => {
		const timer = setTimeout(() => setIsLoaded(true), 100);
		return () => clearTimeout(timer);
	}, []);

	return (
		<Section id="hero" className="overflow-hidden">
			<div
				className={`relative grid grid-cols-1 lg:grid-cols-2 gap-x-8 w-full p-6 lg:p-12 transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
			>
				<div className="flex flex-col justify-start items-start lg:col-span-1 z-10">
					<HeroTitles />
					<HeroCTA />
				</div>
				{!isMobile && (
					<div className="relative lg:h-full lg:col-span-1  min-h-[540px]">
						<SplineView />
					</div>
				)}
			</div>
		</Section>
	);
}
