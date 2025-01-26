import type { Column, RowData } from "@tanstack/react-table";
import { create } from "zustand";

interface ExecutionsState {
	columns: Column<RowData, any>[];
	setColumns: (columns?: Column<RowData, any>[]) => void;
}

export const useExecutionsStore = create<ExecutionsState>()((set) => ({
	columns: [],
	setColumns: (columns) => set({ columns }),
}));
