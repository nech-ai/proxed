import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Setup handlers
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
