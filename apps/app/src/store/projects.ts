import type { Column, RowData } from "@tanstack/react-table";
import { create } from "zustand";

interface ProjectsState {
  columns: Column<RowData, any>[];
  setColumns: (columns?: Column<RowData, any>[]) => void;
}

export const useProjectsStore = create<ProjectsState>()((set) => ({
  columns: [],
  setColumns: (columns) => set({ columns }),
}));
