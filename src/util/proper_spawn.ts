import { ChildProcess } from "child_process";
import child_process from "nwts-tools/lib/node/child_process";
import os from "nwts-tools/lib/node/os";
import path from "nwts-tools/lib/node/path";
import { Readable } from "stream";

export type ProperChildProcess = Promise<{ stdout: string, stderr: string }>
    & { child:ChildProcess };

export function proper_exec(command: string, cwd = process.cwd(),
    shell = os.platform() === "win32" ? "powershell"
        : "bash") {
    console.info(`\n$ \x1b[33m${command}\x1b[0m\n`);

    const [cmd, ...args] = command.replaceAll("\\ ", "\n").split(" ");

    const child
        = child_process.spawn(cmd,
            args.map(function callbackfn(
                value) { return value.replaceAll("\n", " "); }),
            {
                shell,
                cwd,
                env: process.env,
                stdio: ["pipe", "pipe", "pipe"],
            });


    let stdout = '';
    child.stdout.on('data', function (chunk) {
        stdout += chunk.toString();
    });

    let stderr = '';
    child.stderr.on('data', function (chunk) {
        stderr += chunk.toString();
    });

    const promise
        = new Promise<{ stdout: string, stderr: string }>(function (resolve, reject) {
            child.on("close", (code) => {
                resolve({ stdout, stderr });
            });
        }) as ProperChildProcess;

        promise.child = child;


    return promise;
}

export function proper_spawn(command: string, cwd = process.cwd(),
    shell = os.platform() === "win32" ? "powershell"
        : "bash") {

    // print command to console after parsing the command out of the command string to replace the absolute path with just the basename using regex
    const [cmd, ...args] = command.replaceAll("\\ ", "\n").split(" ");
    const basename = cmd.match(/^.*?[\\/]([^\\/]+)$/)?.[1];
    console.info(`\n$ \x1b[33m${basename} ${args.join(" ")}\x1b[0m\n`);

    return child_process.spawn(cmd,
        args.map(function callbackfn(
            value) { return value.replaceAll("\n", " "); }),
        {
            shell,
            cwd,
            env: process.env,
            stdio: ["inherit", "pipe", "inherit"],
        });
}

export function escape_path(...paths: string[]) {
    return path.join(...paths.map(function callbackfn(value) {
        return value.split(path.sep)
            .map(function callbackfn(
                v) { return v.includes(" ") ? JSON.stringify(v) : v; })
            .join(path.sep);
    }));
}
