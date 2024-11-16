import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';

export class PythonRunner {
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    public async runScript(scriptName: string, args: string[] = []): Promise<boolean> {
        try {
            // Get extension's directory path for Python scripts
            const extensionPath = vscode.extensions.getExtension('your-publisher.remotescript-exec')?.extensionPath;
            const scriptPath = path.join(extensionPath || '', 'python', scriptName);

            this.outputChannel.appendLine(`Running Python script: ${scriptName}`);
            this.outputChannel.appendLine(`Arguments: ${args.join(' ')}`);

            return new Promise((resolve, reject) => {
                const process = cp.spawn('python', [scriptPath, ...args]);

                process.stdout.on('data', (data) => {
                    this.outputChannel.appendLine(`Output: ${data}`);
                });

                process.stderr.on('data', (data) => {
                    this.outputChannel.appendLine(`Error: ${data}`);
                });

                process.on('close', (code) => {
                    if (code === 0) {
                        resolve(true);
                    } else {
                        reject(new Error(`Python script exited with code ${code}`));
                    }
                });
            });
        } catch (error) {
            this.outputChannel.appendLine(`Failed to run Python script: ${error}`);
            return false;
        }
    }
}