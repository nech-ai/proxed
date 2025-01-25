import { cleanup } from "@testing-library/react";
import { afterEach } from "bun:test";

// Setup handlers
afterEach(() => {
	cleanup();
});
