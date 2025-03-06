(function(Scratch) {
    'use strict';

    class LogsExtension {
        constructor() {
            // Store logs as objects { type, title, description, timestamp }
            this.logs = [];
            this.popup = null;
            this.popupContent = null;
            this.filterSelect = null;
            this.searchInput = null;
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
                ]
            };
        }

        showLogs() {
            if (!this.popup) {
                // Create main popup container with an improved console design
                this.popup = document.createElement('div');
                this.popup.style.position = 'fixed';
                this.popup.style.top = '50%';
                this.popup.style.left = '50%';
                this.popup.style.transform = 'translate(-50%, -50%)';
                this.popup.style.width = '80%';
                this.popup.style.maxWidth = '800px';
                this.popup.style.height = '80%';
                this.popup.style.background = 'linear-gradient(135deg, #2e2e2e, #1e1e1e)';
                this.popup.style.color = '#dcdcdc';
                this.popup.style.border = '1px solid #444';
                this.popup.style.borderRadius = '8px';
                this.popup.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.6)';
                this.popup.style.zIndex = '9999';
                this.popup.style.padding = '20px';
                this.popup.style.overflow = 'hidden';
                this.popup.style.display = 'none';

                // Close button
                const closeButton = document.createElement('span');
                closeButton.innerHTML = '&times;';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.fontSize = '24px';
                closeButton.style.color = '#f44336';
                closeButton.style.cursor = 'pointer';
                closeButton.style.transition = 'color 0.2s';
                closeButton.addEventListener('mouseover', () => {
                    closeButton.style.color = '#ff7961';
                });
                closeButton.addEventListener('mouseout', () => {
                    closeButton.style.color = '#f44336';
                });
                closeButton.addEventListener('click', () => {
                    this.popup.style.display = 'none';
                });
                this.popup.appendChild(closeButton);

                // Control bar: filter, search, and export buttons
                const controlsBar = document.createElement('div');
                controlsBar.style.marginBottom = '10px';
                controlsBar.style.display = 'flex';
                controlsBar.style.alignItems = 'center';
                controlsBar.style.gap = '10px';

                // Filter dropdown
                this.filterSelect = document.createElement('select');
                this.filterSelect.style.padding = '5px';
                this.filterSelect.style.borderRadius = '4px';
                this.filterSelect.style.border = '1px solid #555';
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

                // Search bar
                this.searchInput = document.createElement('input');
                this.searchInput.type = 'text';
                this.searchInput.placeholder = 'Search...';
                this.searchInput.style.flex = '1';
                this.searchInput.style.padding = '5px';
                this.searchInput.style.borderRadius = '4px';
                this.searchInput.style.border = '1px solid #555';
                this.searchInput.addEventListener('input', () => this.applyFilters());

                // Export buttons
                const exportTxtButton = document.createElement('button');
                exportTxtButton.innerText = 'Export TXT';
                exportTxtButton.style.padding = '5px 10px';
                exportTxtButton.style.border = 'none';
                exportTxtButton.style.borderRadius = '4px';
                exportTxtButton.style.backgroundColor = '#4caf50';
                exportTxtButton.style.color = '#fff';
                exportTxtButton.style.cursor = 'pointer';
                exportTxtButton.style.transition = 'background-color 0.2s';
                exportTxtButton.addEventListener('mouseover', () => {
                    exportTxtButton.style.backgroundColor = '#66bb6a';
                });
                exportTxtButton.addEventListener('mouseout', () => {
                    exportTxtButton.style.backgroundColor = '#4caf50';
                });
                exportTxtButton.addEventListener('click', () => this.exportLogsTxt());

                const exportJsonButton = document.createElement('button');
                exportJsonButton.innerText = 'Export JSON';
                exportJsonButton.style.padding = '5px 10px';
                exportJsonButton.style.border = 'none';
                exportJsonButton.style.borderRadius = '4px';
                exportJsonButton.style.backgroundColor = '#4caf50';
                exportJsonButton.style.color = '#fff';
                exportJsonButton.style.cursor = 'pointer';
                exportJsonButton.style.transition = 'background-color 0.2s';
                exportJsonButton.addEventListener('mouseover', () => {
                    exportJsonButton.style.backgroundColor = '#66bb6a';
                });
                exportJsonButton.addEventListener('mouseout', () => {
                    exportJsonButton.style.backgroundColor = '#4caf50';
                });
                exportJsonButton.addEventListener('click', () => this.exportLogsJson());

                controlsBar.appendChild(this.filterSelect);
                controlsBar.appendChild(this.searchInput);
                controlsBar.appendChild(exportTxtButton);
                controlsBar.appendChild(exportJsonButton);
                this.popup.appendChild(controlsBar);

                // Logs container
                this.popupContent = document.createElement('div');
                this.popupContent.style.fontFamily = 'Consolas, monospace';
                this.popupContent.style.fontSize = '14px';
                this.popupContent.style.whiteSpace = 'pre-wrap';
                this.popupContent.style.overflowY = 'auto';
                this.popupContent.style.height = 'calc(100% - 60px)';
                this.popup.appendChild(this.popupContent);

                document.body.appendChild(this.popup);
            }
            this.popup.style.display = 'block';
            this.applyFilters();
        }

        // Blocks log, warn, and error modified to receive TITLE and DESCRIPTION
        log(args) {
            this.addLog('LOG', args.TITLE, args.DESCRIPTION);
        }

        warn(args) {
            this.addLog('WARNING', args.TITLE, args.DESCRIPTION);
        }

        error(args) {
            this.addLog('ERROR', args.TITLE, args.DESCRIPTION);
        }

        addLog(type, title, description) {
            const timestamp = new Date().toISOString();
            // Log entry container
            const logEntry = document.createElement('div');
            logEntry.style.padding = '10px';
            logEntry.style.marginBottom = '10px';
            logEntry.style.border = '1px solid #555';
            logEntry.style.borderRadius = '4px';
            logEntry.style.backgroundColor = '#262626';
            logEntry.dataset.type = type; // for filtering

            // Log header
            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.cursor = description && description.trim() !== '' ? 'pointer' : 'default';

            // Left part: type, timestamp, and title
            const headerLeft = document.createElement('div');
            headerLeft.style.display = 'flex';
            headerLeft.style.alignItems = 'center';

            const logType = document.createElement('span');
            logType.style.fontWeight = 'bold';
            logType.style.color = this.getLogColor(type);
            logType.innerText = `[${type}]`;
            headerLeft.appendChild(logType);

            const logTime = document.createElement('span');
            logTime.style.color = '#888';
            logTime.style.fontSize = '12px';
            logTime.style.marginLeft = '8px';
            logTime.innerText = ` [${timestamp}]`;
            headerLeft.appendChild(logTime);

            const logTitle = document.createElement('span');
            logTitle.style.marginLeft = '10px';
            logTitle.innerText = title;
            headerLeft.appendChild(logTitle);

            headerDiv.appendChild(headerLeft);

            // Copy button with improved style
            const copyButton = document.createElement('button');
            copyButton.innerText = 'Copy';
            copyButton.style.fontSize = '12px';
            copyButton.style.padding = '3px 6px';
            copyButton.style.border = 'none';
            copyButton.style.borderRadius = '4px';
            copyButton.style.backgroundColor = '#2196F3';
            copyButton.style.color = '#fff';
            copyButton.style.cursor = 'pointer';
            copyButton.style.transition = 'background-color 0.2s';
            copyButton.addEventListener('mouseover', () => {
                copyButton.style.backgroundColor = '#64b5f6';
            });
            copyButton.addEventListener('mouseout', () => {
                copyButton.style.backgroundColor = '#2196F3';
            });
            copyButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const textToCopy = `[${type}] ${title}\n${description}`;
                navigator.clipboard.writeText(textToCopy);
            });
            headerDiv.appendChild(copyButton);
            logEntry.appendChild(headerDiv);

            // Collapsible description area (if provided)
            let contentDiv = null;
            if (description && description.trim() !== '') {
                contentDiv = document.createElement('div');
                contentDiv.style.marginTop = '5px';
                contentDiv.style.paddingLeft = '20px';
                contentDiv.style.display = 'none';
                contentDiv.innerText = description;
                logEntry.appendChild(contentDiv);

                // Toggle description on header click
                headerDiv.addEventListener('click', () => {
                    contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
                });
            }

            this.popupContent.appendChild(logEntry);
            // Save log for export
            this.logs.push({ type, title, description, timestamp });
            this.popupContent.scrollTop = this.popupContent.scrollHeight;
            this.applyFilters();
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

        exportLogsTxt() {
            let content = '';
            this.logs.forEach(log => {
                content += `[${log.type}] [${log.timestamp}] ${log.title}\n${log.description}\n\n`;
            });
            const blob = new Blob([content], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'logs.txt';
            a.click();
        }

        exportLogsJson() {
            const content = JSON.stringify(this.logs, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'logs.json';
            a.click();
        }

        applyFilters() {
            const filterValue = this.filterSelect.value;
            const searchValue = this.searchInput.value.toLowerCase();

            Array.from(this.popupContent.children).forEach(logEntry => {
                const logType = logEntry.dataset.type;
                // Filter by type
                const matchesFilter = filterValue === 'all' || filterValue === logType;
                // Search in the entire text (title and description)
                const textContent = logEntry.innerText.toLowerCase();
                const matchesSearch = textContent.indexOf(searchValue) !== -1;
                logEntry.style.display = matchesFilter && matchesSearch ? '' : 'none';
            });
        }
    }

    Scratch.extensions.register(new LogsExtension());

})(Scratch);
