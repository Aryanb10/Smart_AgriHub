const { spawn } = require("node:child_process");

const [, , envKey, envValue, command, ...args] = process.argv;

if (!envKey || !envValue || !command) {
  console.error(
    "Usage: node script/run-with-env.cjs <ENV_KEY> <ENV_VALUE> <command> [...args]",
  );
  process.exit(1);
}

const spawnOptions = {
  stdio: "inherit",
  env: {
    ...process.env,
    [envKey]: envValue,
  },
};

const child =
  process.platform === "win32"
    ? spawn("cmd.exe", ["/d", "/s", "/c", command, ...args], spawnOptions)
    : spawn(command, args, spawnOptions);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
