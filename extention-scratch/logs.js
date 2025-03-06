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
                    }
                ]
            };
        }

        showLogs() {
            if (!this.popup) {
                this.popup = document.createElement('div');
                this.popup.style.position = 'fixed';
                this.popup.style.top = '50%';
                this.popup.style.left = '50%';
                this.popup.style.transform = 'translate(-50%, -50%)';
                this.popup.style.width = '80%';
                this.popup.style.maxWidth = '600px';
                this.popup.style.height = '70%';
                this.popup.style.backgroundColor = '#1e1e1e';
                this.popup.style.color = '#dcdcdc';
                this.popup.style.border = '1px solid #444';
                this.popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
                this.popup.style.zIndex = '9999';
                this.popup.style.padding = '20px';
                this.popup.style.overflowY = 'auto';
                this.popup.style.display = 'none';

                const closeButton = document.createElement('span');
                closeButton.innerHTML = '&times;';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.fontSize = '24px';
                closeButton.style.color = '#f44336';
                closeButton.style.cursor = 'pointer';
                closeButton.addEventListener('click', () => {
                    this.popup.style.display = 'none';
                });

                this.popupContent = document.createElement('div');
                this.popupContent.style.fontFamily = 'Consolas, monospace';
                this.popupContent.style.fontSize = '14px';
                this.popupContent.style.whiteSpace = 'pre-wrap';

                this.popup.appendChild(closeButton);
                this.popup.appendChild(this.popupContent);
                document.body.appendChild(this.popup);
            }

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
            const timestamp = new Date().toISOString();
            const logEntry = document.createElement('div');
            logEntry.style.padding = '8px';
            logEntry.style.marginBottom = '10px';
            logEntry.style.borderBottom = '1px solid #555';
            logEntry.style.fontFamily = 'Consolas, monospace';
            logEntry.style.color = '#dcdcdc';

            const logType = document.createElement('span');
            logType.style.fontWeight = 'bold';
            logType.style.color = this.getLogColor(type);
            logType.innerText = `[${type}]`;

            const logTime = document.createElement('span');
            logTime.style.color = '#888';
            logTime.style.fontSize = '12px';
            logTime.innerText = ` [${timestamp}]`;

            const logMessage = document.createElement('span');
            logMessage.style.marginLeft = '10px';
            logMessage.innerText = message;

            logEntry.appendChild(logType);
            logEntry.appendChild(logTime);
            logEntry.appendChild(logMessage);
            this.popupContent.appendChild(logEntry);
            this.logs.push({ type, message });

            this.popupContent.scrollTop = this.popupContent.scrollHeight;
        }

        getLogColor(type) {
            switch (type) {
                case 'LOG':
                    return '#2196F3';
                case 'WARNING':
                    return '#FF9800';
                case 'ERROR':
                    return '#F44336';
                default:
                    return '#dcdcdc';
            }
        }

        clearLogs() {
            this.logs = [];
            this.popupContent.innerHTML = '';
        }

        closeLogs() {
            if (this.popup) {
                this.popup.style.display = 'none';
            }
        }
    }

    Scratch.extensions.register(new LogsExtension());

})(Scratch);
