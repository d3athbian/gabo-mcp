#!/usr/bin/env node
import { spawn } from "child_process";
import { Server } from "@modelcontextprotocol/sdk/server/std.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "test-client", version: "1.0.0" },
  { capabilities: {} },
);

async function connectAndTest() {
  console.log("Iniciando conexión MCP...\n");

  const transport = new StdioServerTransport();

  const proc = spawn("node", ["dist/index.js"], {
    cwd: "/Users/gabo/Documents/GitHub/gabo-mcp",
    stdio: ["pipe", "pipe", "pipe"],
  });

  let output = "";
  proc.stdout.on("data", (data) => {
    output += data.toString();
    console.log("STDOUT:", data.toString());
  });

  proc.stderr.on("data", (data) => {
    console.log("STDERR:", data.toString());
  });

  proc.on("close", (code) => {
    console.log("\nProceso cerrado con código:", code);
    console.log("Output completo:", output);
  });

  setTimeout(() => {
    proc.kill();
    console.log("\nTimeout - proceso terminado");
  }, 5000);
}

connectAndTest();
