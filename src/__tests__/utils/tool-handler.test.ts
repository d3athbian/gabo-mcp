/**
 * Tool Handler Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleToolError,
  successResponse,
  withErrorHandler,
} from "../../utils/tool-handler/index.js";

describe("handleToolError", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles Error objects", () => {
    const error = new Error("Test error message");
    const result = handleToolError(error, "TestOperation");
    expect(result.isError).toBe(true);
    const content = JSON.parse(result.content[0].text);
    expect(content.success).toBe(false);
    expect(content.error).toBe("Test error message");
  });

  it("handles string errors", () => {
    const result = handleToolError("String error", "TestOperation");
    expect(result.isError).toBe(true);
    const content = JSON.parse(result.content[0].text);
    expect(content.error).toBe("String error");
  });

  it("handles unknown error types", () => {
    const result = handleToolError(null, "TestOperation");
    expect(result.isError).toBe(true);
    const content = JSON.parse(result.content[0].text);
    expect(content.error).toBe("null");
  });

  it("accepts custom message", () => {
    const error = new Error("Original error");
    const result = handleToolError(error, "TestOperation", {
      customMessage: "Custom error message",
    });
    const content = JSON.parse(result.content[0].text);
    expect(content.error).toBe("Custom error message");
  });

  it("respects warn log level", () => {
    const error = new Error("Warning error");
    const result = handleToolError(error, "TestOperation", {
      logLevel: "warn",
    });
    expect(result.isError).toBe(true);
  });
});

describe("successResponse", () => {
  it("creates success response with data", () => {
    const result = successResponse({ message: "Hello", count: 5 });
    expect(result.isError).toBeUndefined();
    const content = JSON.parse(result.content[0].text);
    expect(content.success).toBe(true);
    expect(content.message).toBe("Hello");
    expect(content.count).toBe(5);
  });

  it("handles empty data object", () => {
    const result = successResponse({});
    expect(result.isError).toBeUndefined();
    const content = JSON.parse(result.content[0].text);
    expect(content.success).toBe(true);
  });

  it("handles nested objects", () => {
    const data = {
      user: { id: 1, name: "Test" },
      metadata: { version: "1.0" },
    };
    const result = successResponse(data);
    const content = JSON.parse(result.content[0].text);
    expect(content.user.name).toBe("Test");
    expect(content.metadata.version).toBe("1.0");
  });

  it("handles arrays", () => {
    const data = { items: [1, 2, 3] };
    const result = successResponse(data);
    const content = JSON.parse(result.content[0].text);
    expect(content.items).toEqual([1, 2, 3]);
  });

  it("returns content as array with single text block", () => {
    const result = successResponse({ test: true });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
  });

  it("formats JSON with indentation", () => {
    const result = successResponse({ nested: { value: "test" } });
    const content = result.content[0].text;
    expect(content).toContain("\n");
  });
});

describe("withErrorHandler", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("wraps successful handler", async () => {
    const handler = vi
      .fn()
      .mockResolvedValue(successResponse({ result: "success" }));
    const wrapped = withErrorHandler("TestTool", handler);

    const args = { query: "test" };
    const result = await wrapped(args);

    expect(handler).toHaveBeenCalledWith(args);
    expect(result.isError).toBeUndefined();
  });

  it("catches and formats errors", async () => {
    const error = new Error("Handler failed");
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = withErrorHandler("TestTool", handler);

    const result = await wrapped({});

    expect(result.isError).toBe(true);
    const content = JSON.parse(result.content[0].text);
    expect(content.error).toBe("Handler failed");
  });

  it("preserves error message for different error types", async () => {
    const handler = vi.fn().mockRejectedValue("String error");
    const wrapped = withErrorHandler("TestTool", handler);

    const result = await wrapped({});

    const content = JSON.parse(result.content[0].text);
    expect(content.error).toBe("String error");
  });

  it("calls handler only once even on error", async () => {
    const handler = vi.fn().mockRejectedValue(new Error("Fail"));
    const wrapped = withErrorHandler("TestTool", handler);

    await wrapped({});
    await wrapped({});

    expect(handler).toHaveBeenCalledTimes(2);
  });
});
