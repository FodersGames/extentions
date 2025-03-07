(function(Scratch) {
    'use strict';

    class LogsExtension {
        constructor() {
            this.logs = [];
            this.popup = null;
            this.popupContent = null;
            this.filterSelect = null;
            this.searchInput = null;
            this.theme = 'dark';
        }

        getInfo() {
            return {
                id: 'logsExtension',
                name: 'Logs Extension',
                blocks: [
                    {
                        opcode: 'showLogs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Show logs popup'
                    },
                    {
                        opcode: 'log',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Log [TITLE] [DESCRIPTION]',
                        arguments: {
                            TITLE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Log Title'
                            },
                            DESCRIPTION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Log Description'
                            }
                        }
                    },
                    {
                        opcode: 'warn',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Warn [TITLE] [DESCRIPTION]',
                        arguments: {
                            TITLE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Warning Title'
                            },
                            DESCRIPTION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Warning Description'
                            }
                        }
                    },
                    {
                        opcode: 'error',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Error [TITLE] [DESCRIPTION]',
                        arguments: {
                            TITLE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Error Title'
                            },
                            DESCRIPTION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Error Description'
                            }
                        }
                    },
                    {
                        opcode: 'addCustomLog',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Add Custom Log [MESSAGE]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Custom Log Message'
                            }
                        }
                    },
                    {
                        opcode: 'extractAndLogBlocks',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Extract and Log Blocks [TITLE] [LOG_TYPE]',
                        arguments: {
                            TITLE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Script Blocks'
                            },
                            LOG_TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'logTypes',
                                defaultValue: 'log'
                            }
                        }
                    },
                    {
                        opcode: 'clearLogs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Clear logs'
                    },
                    {
                        opcode: 'closeLogs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Close logs popup'
                    },
                    {
                        opcode: 'exportLogsTxt',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Export logs as TXT'
                    },
                    {
                        opcode: 'exportLogsJson',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Export logs as JSON'
                    }
                ],
                menus: {
                    logTypes: {
                        acceptReporters: true,
                        items: ['log', 'warn', 'error']
                    }
                }
            };
        }

        extractAndLogBlocks(args, util) {
            const topBlock = util.thread.topBlock;

            if (!topBlock) {
                return; // Exit if there's no script running this block
            }

            const blockIds = [];
            let currentBlockId = topBlock;

            while (currentBlockId) {
                const block = util.runtime.blocks.getBlock(currentBlockId);
                if (!block) break;  // Important: Stop if block doesn't exist

                blockIds.push(block.opcode); // Store the opcode

                currentBlockId = block.next;  // Move to the next block
            }

            const logMessage = blockIds.join(', ');
            const logType = args.LOG_TYPE.toUpperCase();

            switch (logType) {
                case 'WARN':
                    this.warn({ TITLE: args.TITLE, DESCRIPTION: logMessage });
                    break;
                case 'ERROR':
                    this.error({ TITLE: args.TITLE, DESCRIPTION: logMessage });
                    break;
                default:
                    this.log({ TITLE: args.TITLE, DESCRIPTION: logMessage });
                    break;
            }
        }

        showLogs() {
            if (!this.popup) {
                this.createPopup();  // Call the popup creation function
            }
            this.popup.style.display = 'block';
            this.applyFilters();
        }

        createPopup() {
            // Create main popup container
            this.popup = document.createElement('div');
            this.popup.style.position = 'fixed';
            this.popup.style.top = '50%';
            this.popup.style.left = '50%';
            this.popup.style.transform = 'translate(-50%, -50%)';
            this.popup.style.width = '80%';
            this.popup.style.maxWidth = '800px';
            this.popup.style.height = '70%';
            this.popup.style.backgroundColor = '#282c34'; // Dark background
            this.popup.style.border = '1px solid #44475a'; // Subtle border
            this.popup.style.borderRadius = '10px'; // Rounded corners
            this.popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)'; // Soft shadow
            this.popup.style.zIndex = '9999';
            this.popup.style.padding = '20px';
            this.popup.style.overflow = 'hidden';
            this.popup.style.display = 'none';
            this.popup.style.fontFamily = 'sans-serif'; // Modern font
            this.popup.style.color = '#abb2bf'; // Muted text color... // Close button
            const closeButton = document.createElement('span');
            closeButton.innerHTML = '&times;';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.fontSize = '24px';
            closeButton.style.color = '#e06c75'; // Reddish close color
            closeButton.style.cursor = 'pointer';
            closeButton.addEventListener('click', () => {
                this.popup.style.display = 'none';
            });
            this.popup.appendChild(closeButton);

            // Controls bar
            const controlsBar = document.createElement('div');
            controlsBar.style.marginBottom = '15px';
            controlsBar.style.display = 'flex';
            controlsBar.style.alignItems = 'center';
            controlsBar.style.gap = '10px';

            // Filter dropdown
            this.filterSelect = document.createElement('select');
            this.filterSelect.style.padding = '8px 12px';
            this.filterSelect.style.borderRadius = '5px';
            this.filterSelect.style.border = '1px solid #44475a';
            this.filterSelect.style.backgroundColor = '#3e4451';
            this.filterSelect.style.color = '#abb2bf';
            const options = [
                { value: 'all', text: 'All' },
                { value: 'LOG', text: 'Logs' },
                { value: 'WARNING', text: 'Warn' },
                { value: 'ERROR', text: 'Error' }
            ];
            options.forEach(opt => {
                const optionElem = document.createElement('option');
                optionElem.value = opt.value;
                optionElem.text = opt.text;
                this.filterSelect.appendChild(optionElem);
            });
            this.filterSelect.addEventListener('change', () => this.applyFilters());
            controlsBar.appendChild(this.filterSelect);

            // Search bar
            this.searchInput = document.createElement('input');
            this.searchInput.type = 'text';
            this.searchInput.placeholder = 'Search...';
            this.searchInput.style.padding = '8px';
            this.searchInput.style.borderRadius = '5px';
            this.searchInput.style.border = '1px solid #44475a';
            this.searchInput.style.backgroundColor = '#3e4451';
            this.searchInput.style.color = '#abb2bf';
            this.searchInput.addEventListener('input', () => this.applyFilters());
            controlsBar.appendChild(this.searchInput);

            // Export buttons with modern styling
            const exportButtonStyle = `
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                background-color: #61afef; /* Blue-ish */
                color: #fff;
                cursor: pointer;
                transition: background-color 0.2s;
            `;

            const exportTxtButton = document.createElement('button');
            exportTxtButton.innerText = 'Export TXT';
            exportTxtButton.style.cssText = exportButtonStyle;
            exportTxtButton.addEventListener('mouseover', () => {
                exportTxtButton.style.backgroundColor = '#98c379';
            });
            exportTxtButton.addEventListener('mouseout', () => {
                exportTxtButton.style.backgroundColor = '#61afef';
            });
            exportTxtButton.addEventListener('click', () => this.exportLogsTxt());
            controlsBar.appendChild(exportTxtButton);

            const exportJsonButton = document.createElement('button');
            exportJsonButton.innerText = 'Export JSON';
            exportJsonButton.style.cssText = exportButtonStyle;
            exportJsonButton.addEventListener('mouseover', () => {
                exportJsonButton.style.backgroundColor = '#98c379';
            });
            exportJsonButton.addEventListener('mouseout', () => {
                exportJsonButton.style.backgroundColor = '#61afef';
            });
            exportJsonButton.addEventListener('click', () => this.exportLogsJson());
            controlsBar.appendChild(exportJsonButton);

            this.popup.appendChild(controlsBar);

            // Logs container
            this.popupContent = document.createElement('div');
            this.popupContent.style.overflowY = 'auto';
            this.popupContent.style.maxHeight = 'calc(100% - 100px)'; // Adjusted height
            this.popupContent.style.paddingRight = '10px';
            this.popup.appendChild(this.popupContent);

            document.body.appendChild(this.popup);
        }

        log(args) {
            this.addLog('LOG', args.TITLE, args.DESCRIPTION);
        }

        warn(args) {
            this.addLog('WARNING', args.TITLE, args.DESCRIPTION);
        }

        error(args) {
            this.addLog('ERROR', args.TITLE, args.DESCRIPTION);
        }

        addCustomLog(args) {
            this.addLog('LOG', 'Custom Log', args.MESSAGE);
        }

        addLog(type, title, description) {
            const timestamp = new Date().toISOString();
            const logEntry = document.createElement('div');
            logEntry.style.padding = '12px';
            logEntry.style.marginBottom = '12px';
            logEntry.style.borderRadius = '5px';
            logEntry.style.backgroundColor = '#3e4451'; // Darker log entry background
            logEntry.style.borderLeft = `4px solid ${this.getLogColor(type)}`;
            logEntry.dataset.type = type;
            logEntry.style.wordBreak = 'break-word'; // Prevent overflow

            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.cursor = description && description.trim() !== '' ? 'pointer' : 'default';

            const headerLeft = document.createElement('div');
            headerLeft.style.display = 'flex';
            headerLeft.style.alignItems = 'center';

            const logTypeSpan = document.createElement('span');
            logTypeSpan.style.fontWeight = 'bold';
            logTypeSpan.style.color = this.getLogColor(type);
            logTypeSpan.innerText = `[${type}]`;
            headerLeft.appendChild(logTypeSpan);

            const logTime = document.createElement('span');
            logTime.style.color = '#6b7280'; // Muted timestamp color
            logTime.style.fontSize = '12px';
            logTime.style.marginLeft = '10px';
            logTime.innerText = ` [${timestamp}]`;
            headerLeft.appendChild(logTime);

            const logTitle = document.createElement('span');
            logTitle.style.marginLeft = '10px';
            logTitle.style.color = '#fff';
            logTitle.innerText = title;
            headerLeft.appendChild(logTitle);

            headerDiv.appendChild(headerLeft);

            // Copy button
            const copyButton = document.createElement('button');
            copyButton.innerText = 'Copy';
            copyButton.style.fontSize = '12px';
            copyButton.style.padding = '4px 8px';
            copyButton.style.border = 'none';
            copyButton.style.borderRadius = '4px';
            copyButton.style.backgroundColor = '#5c6370';
            copyButton.style.color = '#abb2bf';
            copyButton.style.cursor = 'pointer';
            copyButton.style.transition = 'background-color 0.2s';
            copyButton.addEventListener('mouseover', () => {
                copyButton.style.backgroundColor = '#6b7280';
            });
            copyButton.addEventListener('mouseout', () => {
                copyButton.style.backgroundColor = '#5c6370';
            });
            copyButton.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(description).then(() => {
                    console.log('Description copied to clipboard');
                }).catch(err => {
                    console.error('Failed to copy description: ', err);
                });
            });
            headerDiv.appendChild(copyButton);

            logEntry.appendChild(headerDiv);

            if (description && description.trim() !== '') {
                const descriptionDiv = document.createElement('div');
                descriptionDiv.style.marginTop = '8px';
                descriptionDiv.style.color = '#abb2bf';
                descriptionDiv.style.fontSize = '14px';
                descriptionDiv.style.display = 'none'; // Initially hidden
                descriptionDiv.innerText = description;

                logEntry.appendChild(descriptionDiv);

                headerDiv.addEventListener('click', () => {
                    descriptionDiv.style.display = descriptionDiv.style.display === 'none' ? 'block' : 'none';
                });
            }

            this.logs.push({ type, title, description, timestamp });
            this.popupContent.appendChild(logEntry);
            this.popupContent.scrollTop = this.popupContent.scrollHeight;
            this.applyFilters();
        }

        getLogColor(type) {
            switch (type) {
                case 'WARNING':
                    return '#e2b443'; // Yellowish for warnings
                case 'ERROR':
                    return '#e06c75'; // Reddish for errors
                default:
                    return '#61afef'; // Blueish for general logs
            }
        }

        applyFilters() {
            if (!this.popupContent) return;

            const filterValue = this.filterSelect.value;
            const searchTerm = this.searchInput.value.toLowerCase();

            Array.from(this.popupContent.children).forEach(logEntry => {
                const logType = logEntry.dataset.type;
                const logText = logEntry.innerText.toLowerCase();

                const typeMatch = filterValue === 'all' || logType === filterValue;
                const searchMatch = searchTerm === '' || logText.includes(searchTerm);

                logEntry.style.display = typeMatch && searchMatch ? 'block' : 'none';
            });
        }

        clearLogs() {
            this.logs = [];
            if (this.popupContent) {
                this.popupContent.innerHTML = '';
            }
        }

        closeLogs() {
            if (this.popup) {
                this.popup.style.display = 'none';
            }
        }

        exportLogsTxt() {
            const logContent = this.logs.map(log => `[${log.type}] ${log.timestamp} - ${log.title}: ${log.description}`).join('\n');
            this.downloadFile('logs.txt', logContent, 'text/plain');
        }

        exportLogsJson() {
            const jsonContent = JSON.stringify(this.logs, null, 2);
            this.downloadFile('logs.json', jsonContent, 'application/json');
        }

        downloadFile(filename, content, type) {
            const blob = new Blob([content], { type: type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    Scratch.extensions.register(new LogsExtension());
})(Scratch);
