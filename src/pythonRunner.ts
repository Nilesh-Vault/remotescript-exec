import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import * as fs from 'fs';

export class PythonRunner {
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public async runScript(scriptName: string, args: string[] = []): Promise<boolean> {
        try {
            console.log("Function runScript (used to call Python file) reached!");
            
            // Get the extension's root directory
            const extensionPath = vscode.extensions.getExtension('nilesh-kumar.remotescript-exec')?.extensionPath;
            if (!extensionPath) {
                throw new Error("Extension path not found. Ensure the extension ID is correct.");
            }

            // Construct the full script path
            const scriptPath = path.join(extensionPath, 'python', scriptName);
            if (!fs.existsSync(scriptPath)) {
                throw new Error(`Script not found at path: ${scriptPath}`);
            }

            this.outputChannel.appendLine(`Running Python script: ${scriptName}`);
            this.outputChannel.appendLine(`Arguments: ${args.join(' ')}`);
            console.log(`Extension Path: ${extensionPath}`);
            console.log(`Script Path: ${scriptPath}`);

            // Run the Python script in a separate process
            return new Promise((resolve, reject) => {
                const process = cp.spawn('python3', [scriptPath, ...args]);

                // Handle standard output
                process.stdout.on('data', (data) => {
                    const output = data.toString().trim();
                    this.outputChannel.appendLine(` Output: ${output}`);
                    console.log(`Output: ${output}`);
                });

                // Handle standard error
                process.stderr.on('data', (data) => {
                    const errorOutput = data.toString().trim();
                    const timestamp = new Date().toISOString();
                    this.outputChannel.appendLine(`[${timestamp}] Error: ${errorOutput}`);
                    console.error(`Error: ${errorOutput}`);
                });

                // Handle process errors
                process.on('error', (err) => {
                    this.outputChannel.appendLine(`Failed to start process: ${err.message}`);
                    console.error(err);
                    reject(err);
                });

                // Handle process exit
                process.on('close', (code) => {
                    this.outputChannel.appendLine(`Process exited with code ${code}`);
                    if (code === 0) {
                        resolve(true);
                    } else {
                        reject(new Error(`Python script exited with non-zero code: ${code}`));
                    }
                });
            });
        } catch (error) {
            const e = error as Error;
            this.outputChannel.appendLine(`Failed to run Python script: ${e.message}`);
            console.log(e);
            return false;
        }
    }
}
