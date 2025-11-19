import child_process from "nwts-tools/lib/node/child_process";
import os from "nwts-tools/lib/node/os";
import path from "nwts-tools/lib/node/path";

/**
 * Spawns a child process with the given command, working directory, and shell.
 * The command is printed to the console before execution.
 *
 * @param {string} command - The command to execute.
 * @param {string} [cwd=process.cwd()] - The working directory for the command.
 * @param {string} [shell=os.platform() === "win32" ? "powershell" : "bash"] - The shell to use for executing the command.
 * @returns {Promise<string>} A promise that resolves with the standard output of the command.
 */

export function proper_spawn(command: string, cwd = process.cwd(),
    shell = os.platform() === "win32" ? "powershell"
        : "bash") {
    console.log(`\n$ \x1b[33m${command}\x1b[0m\n`);

    const [cmd, ...args] = command.replaceAll("\\ ", "\n").split(" ");

    const child
        = child_process.spawn(cmd,
            args.map(function callbackfn(
                value) { return value.replaceAll("\n", " "); }),
            {
                shell,
                cwd,
                env: process.env,
                stdio: ["inherit", "pipe", "inherit"],
            });

    let stdout = '';
    child.stdout.on('data', function (chunk) {
        stdout += chunk.toString();
    });

    const p
        = new Promise<string>(function (resolve, reject) {
            child.on("close", (code) => {
                resolve(stdout);
            });
        }) as
        Promise<string>
        & { kill(): Boolean };

    p.kill = function () {
        if (!child.kill()) {
            if (child.pid) { return process.kill(child.pid); }
        }
        return true;
    };

    return p;
}

export function escape_path(...paths: string[]) {
    return path.join(...paths.map(function callbackfn(value) {
        return value.split(path.sep)
            .map(function callbackfn(
                v) { return v.includes(" ") ? JSON.stringify(v) : v; })
            .join(path.sep);
    }));
}
