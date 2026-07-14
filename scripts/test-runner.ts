import { spawn } from "node:child_process";
import { createServer } from "node:net";

const PORT = 3000;
const targetUrl = `http://localhost:${PORT}`;

// Check if port is already in use
function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => {
      resolve(true); // Port in use
    });
    server.once("listening", () => {
      server.close();
      resolve(false); // Port free
    });
    server.listen(port);
  });
}

// Poll target URL until it returns 200/401/404 or fails
async function waitForServer(url: string, retries = 30, delay = 1000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      await fetch(url);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return false;
}

async function main() {
  const isPortInUse = await checkPort(PORT);
  let nextProcess: any = null;

  if (!isPortInUse) {
    console.log(`Port ${PORT} is free. Spawning 'npm run start' as background process...`);
    
    // Use shell: true for cross-platform compatibility
    nextProcess = spawn("npm", ["run", "start"], {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, PORT: String(PORT) },
    });

    nextProcess.on("error", (err: any) => {
      console.error("Failed to start Next.js process:", err);
      process.exit(1);
    });
  } else {
    console.log(`Port ${PORT} is already in use. Assuming server is running.`);
  }

  console.log("Waiting for Next.js server to be responsive...");
  const isReady = await waitForServer(targetUrl);

  if (!isReady) {
    console.error("Next.js server did not become ready in time.");
    if (nextProcess) nextProcess.kill();
    process.exit(1);
  }

  console.log("Next.js server is ready. Running integration tests...");

  const testProcess = spawn("node", ["--import", "jiti/register", "--test", "tests/integration.test.ts"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, TEST_TARGET_URL: targetUrl },
  });

  testProcess.on("close", (code) => {
    console.log(`Tests exited with code ${code}`);
    if (nextProcess) {
      console.log("Stopping Next.js server...");
      
      // On Windows, taskkill might be needed to clean up spawned process trees
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", String(nextProcess.pid), "/f", "/t"], { stdio: "ignore" });
      } else {
        nextProcess.kill("SIGTERM");
      }
    }
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error("Unhandle test runner error:", err);
  process.exit(1);
});
