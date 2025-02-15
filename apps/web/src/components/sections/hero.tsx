"use client";

import { Section } from "@/components/section";
import { siteConfig } from "@/lib/config";
import { Button } from "@proxed/ui/components/button";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useSubscribeModal } from "@/context/subscribe-modal-context";
// @ts-ignore
import Spline from "@splinetool/react-spline";
import { GradientText } from "../gradient-text";

const ANIMATION_CONFIG = {
	ease: [0.16, 1, 0.3, 1],
	duration: 0.8,
} as const;

function HeroPill() {
	return (
		<motion.a
			href="/updates/starting"
			className="group flex w-auto items-center space-x-2 bg-primary/20 px-3 py-1.5 ring-1 ring-accent rounded-full hover:bg-primary/30 transition-colors"
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={ANIMATION_CONFIG}
		>
			<div className="w-fit bg-accent px-2 py-0.5 rounded-full text-left text-xs font-medium text-primary sm:text-sm">
				🛠️ New
			</div>
			<p className="text-xs font-medium text-primary sm:text-sm">
				Starting Proxed
			</p>
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
		</motion.a>
	);
}

function HeroTitles() {
	return (
		<div className="flex w-full max-w-3xl flex-col overflow-hidden pt-8">
			<motion.h1
				className="text-left text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl tracking-tighter"
				initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
				animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
				transition={{
					duration: ANIMATION_CONFIG.duration,
					ease: ANIMATION_CONFIG.ease,
				}}
			>
				<motion.span
					className="inline-block text-balance"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						...ANIMATION_CONFIG,
						delay: 0.5,
					}}
				>
					<GradientText as="h1" className="leading-tight">
						{siteConfig.hero.title}
					</GradientText>
				</motion.span>
			</motion.h1>
			<motion.p
				className="text-left mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed text-balance"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{
					...ANIMATION_CONFIG,
					delay: 0.6,
				}}
			>
				{siteConfig.hero.description}
			</motion.p>
		</div>
	);
}

function HeroCTA() {
	const { openModal } = useSubscribeModal();

	return (
		<div className="relative mt-8">
			<motion.div
				className="flex w-full max-w-2xl flex-col items-start justify-start space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ ...ANIMATION_CONFIG, delay: 0.8 }}
			>
				<Button
					onClick={openModal}
					className="w-full sm:w-auto h-12 px-8 text-base"
					size="lg"
				>
					{siteConfig.hero.cta}
				</Button>
			</motion.div>
			<motion.p
				className="mt-4 text-sm text-muted-foreground text-left max-w-xl"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ ...ANIMATION_CONFIG, delay: 1.0 }}
			>
				{siteConfig.hero.ctaDescription}
			</motion.p>
		</div>
	);
}

export function Hero() {
	const [showSpline, setShowSpline] = useState(false);
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
		if (!isMobile) {
			const timer = setTimeout(() => setShowSpline(true), 1000);
			return () => clearTimeout(timer);
		}
	}, [isMobile]);

	return (
		<Section id="hero" className="overflow-hidden">
			<div className="relative grid grid-cols-1 lg:grid-cols-2 gap-x-8 w-full p-6 lg:p-12">
				<div className="flex flex-col justify-start items-start lg:col-span-1 z-10">
					<HeroPill />
					<HeroTitles />
					<HeroCTA />
				</div>
				{!isMobile && (
					<div className="relative lg:h-full lg:col-span-1">
						{showSpline && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.8, delay: 1 }}
								className="absolute inset-0"
							>
								<Spline
									scene="/cube.splinecode"
									className="w-full h-full origin-top-left"
								/>
							</motion.div>
						)}
					</div>
				)}
			</div>
		</Section>
	);
}
