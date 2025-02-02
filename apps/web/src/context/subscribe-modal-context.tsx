"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SubscribeModalContextType {
	isOpen: boolean;
	openModal: () => void;
	closeModal: () => void;
}

const SubscribeModalContext = createContext<
	SubscribeModalContextType | undefined
>(undefined);

export function SubscribeModalProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const openModal = () => setIsOpen(true);
	const closeModal = () => setIsOpen(false);

	return (
		<SubscribeModalContext.Provider value={{ isOpen, openModal, closeModal }}>
			{children}
		</SubscribeModalContext.Provider>
	);
}

export function useSubscribeModal(): SubscribeModalContextType {
	const context = useContext(SubscribeModalContext);
	if (!context)
		throw new Error(
			"useSubscribeModal must be used within a SubscribeModalProvider",
		);
	return context;
}
