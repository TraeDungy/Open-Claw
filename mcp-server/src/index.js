#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const execAsync = promisify(exec);

// ── Config ──────────────────────────────────────────────────────────────────
const PAPERCLIP_DIR = process.env.PAPERCLIP_DIR || "";
const PAPERCLIP_URL = process.env.PAPERCLIP_URL || "http://localhost:3000";

// ── Server ──────────────────────────────────────────────────────────────────
const server = new McpServer({
  name: "openclaw",
  version: "0.1.0",
});

// ── Tool: paperclip_status ──────────────────────────────────────────────────
server.tool(
  "paperclip_status",
  "Check if the Paper Clip dashboard is running and return its status",
  {},
  async () => {
    try {
      const resp = await fetch(PAPERCLIP_URL);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                running: true,
                url: PAPERCLIP_URL,
                status: resp.status,
                statusText: resp.statusText,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                running: false,
                url: PAPERCLIP_URL,
                error: err.message,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
);

// ── Tool: paperclip_api ─────────────────────────────────────────────────────
server.tool(
  "paperclip_api",
  "Make an HTTP request to the Paper Clip dashboard API",
  {
    method: z
      .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
      .default("GET")
      .describe("HTTP method"),
    path: z.string().describe("API path (e.g. /api/projects)"),
    body: z
      .string()
      .optional()
      .describe("JSON request body for POST/PUT/PATCH"),
  },
  async ({ method, path, body }) => {
    try {
      const url = `${PAPERCLIP_URL}${path}`;
      const opts = {
        method,
        headers: { "Content-Type": "application/json" },
      };
      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        opts.body = body;
      }
      const resp = await fetch(url, opts);
      const text = await resp.text();

      // Try to pretty-print JSON responses
      let output;
      try {
        output = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        output = text;
      }

      return {
        content: [
          {
            type: "text",
            text: `${resp.status} ${resp.statusText}\n\n${output}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// ── Tool: paperclip_logs ────────────────────────────────────────────────────
server.tool(
  "paperclip_logs",
  "View recent logs from the Paper Clip dashboard process",
  {
    lines: z
      .number()
      .default(50)
      .describe("Number of recent log lines to return"),
  },
  async ({ lines }) => {
    try {
      // Try common log locations
      const logPaths = [
        PAPERCLIP_DIR && join(PAPERCLIP_DIR, "logs", "app.log"),
        PAPERCLIP_DIR && join(PAPERCLIP_DIR, ".next", "trace"),
        "/tmp/paperclip.log",
      ].filter(Boolean);

      for (const logPath of logPaths) {
        try {
          const content = await readFile(logPath, "utf-8");
          const logLines = content.trim().split("\n").slice(-lines).join("\n");
          return {
            content: [
              { type: "text", text: `Logs from ${logPath}:\n\n${logLines}` },
            ],
          };
        } catch {
          continue;
        }
      }

      // Fallback: check running processes
      const { stdout } = await execAsync(
        "ps aux | grep -i paper | grep -v grep"
      );
      return {
        content: [
          {
            type: "text",
            text: `No log files found. Running Paper Clip processes:\n\n${stdout || "None found"}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// ── Tool: paperclip_start ───────────────────────────────────────────────────
server.tool(
  "paperclip_start",
  "Start the Paper Clip dashboard",
  {
    command: z
      .string()
      .optional()
      .describe(
        "Custom start command (defaults to npm start in PAPERCLIP_DIR)"
      ),
  },
  async ({ command }) => {
    if (!PAPERCLIP_DIR && !command) {
      return {
        content: [
          {
            type: "text",
            text: "Error: PAPERCLIP_DIR env var not set and no custom command provided. Set PAPERCLIP_DIR to the Paper Clip project root.",
          },
        ],
        isError: true,
      };
    }

    const cmd = command || `cd "${PAPERCLIP_DIR}" && npm start`;
    try {
      // Start in background
      const { stdout, stderr } = await execAsync(
        `nohup bash -c '${cmd}' > /tmp/paperclip.log 2>&1 & echo $!`
      );
      const pid = stdout.trim();
      return {
        content: [
          {
            type: "text",
            text: `Paper Clip started with PID ${pid}\nLogs: /tmp/paperclip.log\nURL: ${PAPERCLIP_URL}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error starting: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// ── Tool: paperclip_stop ────────────────────────────────────────────────────
server.tool(
  "paperclip_stop",
  "Stop the Paper Clip dashboard",
  {},
  async () => {
    try {
      const { stdout } = await execAsync(
        "pgrep -f paperclip || pgrep -f 'next dev' || pgrep -f 'next start' || echo ''"
      );
      const pids = stdout
        .trim()
        .split("\n")
        .filter((p) => p);

      if (pids.length === 0) {
        return {
          content: [
            { type: "text", text: "No Paper Clip processes found running." },
          ],
        };
      }

      await execAsync(`kill ${pids.join(" ")}`);
      return {
        content: [
          {
            type: "text",
            text: `Stopped Paper Clip processes: ${pids.join(", ")}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// ── Tool: paperclip_files ───────────────────────────────────────────────────
server.tool(
  "paperclip_files",
  "List files in the Paper Clip project directory",
  {
    path: z
      .string()
      .default("")
      .describe("Relative path within the project (default: root)"),
  },
  async ({ path: relPath }) => {
    if (!PAPERCLIP_DIR) {
      return {
        content: [
          {
            type: "text",
            text: "Error: PAPERCLIP_DIR env var not set.",
          },
        ],
        isError: true,
      };
    }

    const targetDir = join(PAPERCLIP_DIR, relPath);
    try {
      const entries = await readdir(targetDir, { withFileTypes: true });
      const listing = entries.map((e) => {
        const prefix = e.isDirectory() ? "📁" : "📄";
        return `${prefix} ${e.name}`;
      });
      return {
        content: [
          {
            type: "text",
            text: `${targetDir}\n\n${listing.join("\n")}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// ── Tool: run_command ───────────────────────────────────────────────────────
server.tool(
  "run_command",
  "Run a shell command on the host machine (use for managing local services, VPN, etc.)",
  {
    command: z.string().describe("Shell command to execute"),
    cwd: z
      .string()
      .optional()
      .describe("Working directory (defaults to PAPERCLIP_DIR)"),
    timeout: z
      .number()
      .default(30000)
      .describe("Timeout in milliseconds (default: 30s)"),
  },
  async ({ command, cwd, timeout }) => {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: cwd || PAPERCLIP_DIR || undefined,
        timeout,
      });
      return {
        content: [
          {
            type: "text",
            text: [stdout && `stdout:\n${stdout}`, stderr && `stderr:\n${stderr}`]
              .filter(Boolean)
              .join("\n\n") || "(no output)",
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Exit code: ${err.code || "unknown"}\n${err.stderr || err.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ── Tool: vpn_status ────────────────────────────────────────────────────────
server.tool(
  "vpn_status",
  "Check VPN connection status on the host machine",
  {},
  async () => {
    try {
      // Check common VPN interfaces and processes
      const checks = await Promise.allSettled([
        execAsync("ip addr show tun0 2>/dev/null || ifconfig tun0 2>/dev/null"),
        execAsync(
          "pgrep -a openvpn || pgrep -a wireguard || pgrep -a wg-quick || echo 'No VPN processes'"
        ),
        execAsync("curl -s --max-time 5 https://ifconfig.me"),
      ]);

      const [iface, procs, ip] = checks.map((r) =>
        r.status === "fulfilled" ? r.value.stdout.trim() : r.reason.message
      );

      return {
        content: [
          {
            type: "text",
            text: `VPN Interface (tun0):\n${iface}\n\nVPN Processes:\n${procs}\n\nPublic IP:\n${ip}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  }
);

// ── Start ───────────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OpenClaw MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
