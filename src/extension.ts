// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PythonRunner } from "./pythonRunner";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	const outputChannel = vscode.window.createOutputChannel(
		"Remote Script Execution"
	);

	let checkConfigCommand = vscode.commands.registerCommand('remotescript-exec.checkConfig', async () => {

		outputChannel.clear();
		outputChannel.show();
		outputChannel.appendLine("Checking configuration... ");

		const config = vscode.workspace.getConfiguration("remotescript-exec");

		const requiredSetting = [
			"region",
			"instanceId",
			"accessKeyId",
			"secretAccessKey",
		];

		let missingSetting: string[] = [];


		requiredSetting.forEach(setting => {
			const value = config.get(setting);
			outputChannel.appendLine(`Checking ${setting}...`);


			if (!value) {
				missingSetting.push(setting);
				outputChannel.appendLine(`❌ ${setting} is not configured`);
			} else {
				outputChannel.appendLine(`✅ ${setting} is configured`);
			}
		});

		if (missingSetting.length > 0) {
			const message = `Missing configuration ${missingSetting.join(', ')}`;
			outputChannel.appendLine(`\nError: ${message}`);


			// ask user if they want to open setting 
			const action = await vscode.window.showErrorMessage(
				message,
				'open setting'
			);

			if (action === 'open setting') {
				await vscode.commands.executeCommand(
					'workbench.action.openSettings',
					'remotescript-exec'
				);
			}
		} else {
			outputChannel.appendLine(`\n✓ All settings configured correctly!`);
			vscode.window.showInformationMessage('All settings configured correctly!');
		}
	});

	const pythonRunner = new PythonRunner(outputChannel);
	
    let validateCommand = vscode.commands.registerCommand(
        'remotescript-exec.validateAWS', 
        async () => {
            outputChannel.clear();
            outputChannel.show();
            outputChannel.appendLine('Starting AWS validation using Python...');

            const config = vscode.workspace.getConfiguration('remotescript-exec');
            
            try {
                const result = await pythonRunner.runScript('aws_validator.py', [
                    config.get('region') || '',
                    config.get('accessKeyId') || '',
                    config.get('secretAccessKey') || '',
                    config.get('instanceId') || ''
                ]);

                if (result) {
					vscode.window.showInformationMessage('AWS credentials validated successfully!');
					outputChannel.appendLine('debugging stuffs here ');
                } else {
                    vscode.window.showErrorMessage('AWS validation failed!');
					outputChannel.appendLine('debugging stuffs here ');

                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error}`);
            }
        }
    );


	context.subscriptions.push(checkConfigCommand);
	context.subscriptions.push(validateCommand);
}