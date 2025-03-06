(function(Scratch) {
    'use strict';

    class LogsExtension {
        constructor() {
            this.logs = [];
            this.popup = null;
            this.popupContent = null;
        }

        getInfo() {
            return {
                id: 'logsExtension',
                name: 'Logs Extension',
                blocks: [
                    {
                        opcode: 'showLogs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Show logs popup',
                    },
                    {
                        opcode: 'log',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Log [MESSAGE]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'This is a log message'
                            }
                        }
                    },
                    {
                        opcode: 'warn',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Warn [MESSAGE]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'This is a warning message'
                            }
                        }
                    },
                    {
                        opcode: 'error',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Error [MESSAGE]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'This is an error message'
                            }
                        }
                    },
                    {
                        opcode: 'clearLogs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Clear logs',
                    },
                    {
                        opcode: 'closeLogs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Close logs popup',
                    },
                    {
                        opcode: 'logLogic',
                        blockType: Scratch.BlockType.CAP,
                        text: 'Execute and log [LOGIC] with level [LEVEL]',
                        arguments: {
                            LOGIC: {
                                type: Scratch.ArgumentType.BLOCK,
                                defaultValue: null
                            },
                            LEVEL: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'logLevels',
                                defaultValue: 'LOG'
                            }
                        }
                    }
                ],
                menus: {
                    logLevels: ['LOG', 'WARNING', 'ERROR']
                }
            };
        }

        showLogs() {
            // Create the popup if it doesn't exist
            if (!this.popup) {
                this.popup = document.createElement('div');
                this.popup.style.position = 'fixed';
                this.popup.style.top = '50%';
                this.popup.style.left = '50%';
                this.popup.style.transform = 'translate(-50%, -50%)';
                this.popup.style.width = '80%';
                this.popup.style.maxWidth = '600px';
                this.popup.style.height = '70%';
                this.popup.style.backgroundColor = '#fff';
                this.popup.style.border = '1px solid #ccc';
                this.popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                this.popup.style.zIndex = '9999';
                this.popup.style.padding = '20px';
                this.popup.style.overflowY = 'auto';
                this.popup.style.display = 'none'; // Initially hidden

                // Close button
                const closeButton = document.createElement('span');
                closeButton.innerHTML = '&times;';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.fontSize = '24px';
                closeButton.style.cursor = 'pointer';
                closeButton.addEventListener('click', () => {
                    this.popup.style.display = 'none'; // Hide the popup when close is clicked
                });

                // Create the content container for logs
                this.popupContent = document.createElement('div');
                this.popupContent.style.fontFamily = 'Arial, sans-serif';
                this.popupContent.style.fontSize = '16px';

                // Add the close button and content to the popup
                this.popup.appendChild(closeButton);
                this.popup.appendChild(this.popupContent);
                document.body.appendChild(this.popup);
            }

            // Show the popup
            this.popup.style.display = 'block';
        }

        log(args) {
            this.addLog('LOG', args.MESSAGE);
        }

        warn(args) {
            this.addLog('WARNING', args.MESSAGE);
        }

        error(args) {
            this.addLog('ERROR', args.MESSAGE);
        }

        addLog(type, message) {
            const logEntry = document.createElement('div');
            logEntry.style.padding = '5px';
            logEntry.style.marginBottom = '10px';
            logEntry.style.borderBottom = '1px solid #eee';

            const logType = document.createElement('span');
            logType.style.fontWeight = 'bold';
            logType.style.color = this.getLogColor(type);
            logType.innerText = `[${type}]`;

            const logMessage = document.createElement('span');
            logMessage.style.marginLeft = '10px';
            logMessage.innerText = message;

            logEntry.appendChild(logType);
            logEntry.appendChild(logMessage);
            this.popupContent.appendChild(logEntry);
            this.logs.push({ type, message });

            // Auto scroll to bottom to show the latest log
            this.popupContent.scrollTop = this.popupContent.scrollHeight;
        }

        getLogColor(type) {
            switch (type) {
                case 'LOG':
                    return 'blue';
                case 'WARNING':
                    return 'orange';
                case 'ERROR':
                    return 'red';
                default:
                    return 'black';
            }
        }

        clearLogs() {
            this.logs = [];
            this.popupContent.innerHTML = ''; // Clear all logs in the popup
        }

        closeLogs() {
            if (this.popup) {
                this.popup.style.display = 'none'; // Hide the popup
            }
        }

        logLogic(args) {
            const logicCode = this.getLogicCode(args.LOGIC);
            const level = args.LEVEL;
            const logMessage = `Executed Logic: ${logicCode}`;
            this.addLog(level, logMessage);
        }

        getLogicCode(block) {
            // Extract the logic from the blocks inside the custom block
            // This will just be a placeholder logic for now
            return block ? block.toString() : 'No logic provided';
        }
    }

    // Register the extension
    Scratch.extensions.register(new LogsExtension());

})(Scratch);
