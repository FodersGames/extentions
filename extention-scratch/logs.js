(function(Scratch) {
    'use strict';

    class LogsExtension {
        constructor() {
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
                        opcode: 'logRepeat',
                        blockType: Scratch.BlockType.CONTROL,
                        text: 'Log Repeat [LOG_TYPE] Title: [TITLE] [TIMES] [STACK]',
                        arguments: {
                            LOG_TYPE: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'logTypes',
                                defaultValue: 'LOG'
                            },
                            TITLE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'My Block Title'
                            },
                            TIMES: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: '1'
                            },
                            STACK: {
                                type: Scratch.ArgumentType.STATEMENT
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
                    logTypes: ['LOG', 'WARNING', 'ERROR']
                }
            };
        }

        showLogs() {
            if (!this.popup) {
                // Create main popup container with a style inspired by Lunar Unity Console v1.8.1
                this.popup = document.createElement('div');
                this.popup.style.position = 'fixed';
                this.popup.style.top = '50%';
                this.popup.style.left = '50%';
                this.popup.style.transform = 'translate(-50%, -50%)';
                this.popup.style.width = '85%';
                this.popup.style.maxWidth = '900px';
                this.popup.style.height = '80%';
                this.popup.style.backgroundColor = '#1b1b1b';
                this.popup.style.border = '1px solid #333';
                this.popup.style.borderRadius = '8px';
                this.popup.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.7)';
                this.popup.style.zIndex = '9999';
                this.popup.style.padding = '20px';
                this.popup.style.overflow = 'hidden';
                this.popup.style.display = 'none';
                this.popup.style.fontFamily = '"Roboto Mono", Consolas, monospace';

                // Close button: repositioned closer to the edge
                const closeButton = document.createElement('span');
                closeButton.innerHTML = '&times;';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.fontSize = '28px';
                closeButton.style.color = '#e74c3c';
                closeButton.style.cursor = 'pointer';
                closeButton.style.transition = 'color 0.2s';
                closeButton.addEventListener('mouseover', () => {
                    closeButton.style.color = '#ff6b6b';
                });
                closeButton.addEventListener('mouseout', () => {
                    closeButton.style.color = '#e74c3c';
                });
                closeButton.addEventListener('click', () => {
                    this.popup.style.display = 'none';
                });
                this.popup.appendChild(closeButton);

                // Control bar: filter, search, and export buttons
                const controlsBar = document.createElement('div');
                controlsBar.style.marginBottom = '15px';
                controlsBar.style.display = 'flex';
                controlsBar.style.alignItems = 'center';
                controlsBar.style.gap = '10px';

                // Filter dropdown
                this.filterSelect = document.createElement('select');
                this.filterSelect.style.padding = '6px';
                this.filterSelect.style.borderRadius = '4px';
                this.filterSelect.style.border = '1px solid #555';
                this.filterSelect.style.backgroundColor = '#2c2c2c';
                this.filterSelect.style.color = '#dcdcdc';
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
                this.searchInput.style.padding = '6px';
                this.searchInput.style.borderRadius = '4px';
                this.searchInput.style.border = '1px solid #555';
                this.searchInput.style.backgroundColor = '#2c2c2c';
                this.searchInput.style.color = '#dcdcdc';
                this.searchInput.addEventListener('input', () => this.applyFilters());

                // Export buttons
                const exportTxtButton = document.createElement('button');
                exportTxtButton.innerText = 'Export TXT';
                exportTxtButton.style.padding = '6px 12px';
                exportTxtButton.style.border = 'none';
                exportTxtButton.style.borderRadius = '4px';
                exportTxtButton.style.backgroundColor = '#27ae60';
                exportTxtButton.style.color = '#fff';
                exportTxtButton.style.cursor = 'pointer';
                exportTxtButton.style.transition = 'background-color 0.2s';
                exportTxtButton.addEventListener('mouseover', () => {
                    exportTxtButton.style.backgroundColor = '#2ecc71';
                });
                exportTxtButton.addEventListener('mouseout', () => {
                    exportTxtButton.style.backgroundColor = '#27ae60';
                });
                exportTxtButton.addEventListener('click', () => this.exportLogsTxt());

                const exportJsonButton = document.createElement('button');
                exportJsonButton.innerText = 'Export JSON';
                exportJsonButton.style.padding = '6px 12px';
                exportJsonButton.style.border = 'none';
                exportJsonButton.style.borderRadius = '4px';
                exportJsonButton.style.backgroundColor = '#27ae60';
                exportJsonButton.style.color = '#fff';
                exportJsonButton.style.cursor = 'pointer';
                exportJsonButton.style.transition = 'background-color 0.2s';
                exportJsonButton.addEventListener('mouseover', () => {
                    exportJsonButton.style.backgroundColor = '#2ecc71';
                });
                exportJsonButton.addEventListener('mouseout', () => {
                    exportJsonButton.style.backgroundColor = '#27ae60';
                });
                exportJsonButton.addEventListener('click', () => this.exportLogsJson());

                controlsBar.appendChild(this.filterSelect);
                controlsBar.appendChild(this.searchInput);
                controlsBar.appendChild(exportTxtButton);
                controlsBar.appendChild(exportJsonButton);
                this.popup.appendChild(controlsBar);

                // Logs container
                this.popupContent = document.createElement('div');
                this.popupContent.style.overflowY = 'auto';
                this.popupContent.style.height = 'calc(100% - 80px)';
                this.popupContent.style.paddingRight = '10px';
                this.popup.appendChild(this.popupContent);

                document.body.appendChild(this.popup);
            }
            this.popup.style.display = 'block';
            this.applyFilters();
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

        logRepeat(args, util) {
            const logType = args.LOG_TYPE;
            const title = args.TITLE;
            const times = Math.floor(Scratch.Cast.toNumber(args.TIMES)); // Ensure integer
            if (times <= 0) return; // Don't repeat zero or negative times

            for (let i = 0; i < times; i++) {
                // Execute the stack of blocks within the loop
                if (util.stackFrame.childBlocks) {
                    // Extract block info from the blocks in the stack and add the log
                     this.extractBlockInfo(util.stackFrame.childBlocks)
                }

                this.addLog(logType, title, `Repetition ${i + 1}`);
                Scratch.vm.runtime.startHats(
                    'control_start',
                    {
                        SOURCE_BLOCK: util.stackFrame.parentKey
                    },
                    util.target
                );

            }
        }


        extractBlockInfo(blocks) {
            for (const block of blocks) {
                if (block.opcode === 'motion_movesteps') {
                    // Example for "move steps" block
                    const steps = Scratch.Cast.toNumber(block.inputs.STEPS.shadow.fields.NUM.value);
                    console.log('move steps ' + steps)
                    // return steps;
                } else if (block.opcode === 'control_if') {
                    // Example for "if" block
                    console.log('if condition');
                    if (block.inputs.CONDITION.block) {
                        // this.extractBlockInfo([block.inputs.CONDITION.block]); // Condition
                        // return 'if';
                    }
                } else if(block.opcode === 'sound_playuntildone'){
                    console.log('play sound')
                }

                if(block.next){
                    // this.extractBlockInfo([block.next])
                }
            }

        }

        addLog(type, title, description) {
            const timestamp = new Date().toISOString();
            const logEntry = document.createElement('div');
            logEntry.style.padding = '12px';
            logEntry.style.marginBottom = '12px';
            logEntry.style.borderRadius = '4px';
            logEntry.style.backgroundColor = '#2c2c2c';
            logEntry.style.borderLeft = `4px solid ${this.getLogColor(type)}`;
            logEntry.dataset.type = type;

            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.cursor = description && description.trim() !== '' ? 'pointer' : 'default';

            const headerLeft = document.createElement('div');
            headerLeft.style.display = 'flex';
            headerLeft.style.alignItems = 'center';

            const logType = document.createElement('span');
            logType.style.fontWeight = 'bold';
            logType.style.color = this.getLogColor(type);
            logType.innerText = `[${type}]`;
            headerLeft.appendChild(logType);

            const logTime = document.createElement('span');
            logTime.style.color = '#aaa';
            logTime.style.fontSize = '12px';
            logTime.style.marginLeft = '10px';
            logTime.innerText = ` [${timestamp}]`;
            headerLeft.appendChild(logTime);

            const logTitle = document.createElement('span');
            logTitle.style.marginLeft = '10px';
            // Set title text color explicitly to white
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
            copyButton.style.backgroundColor = '#2980b9';
            copyButton.style.color = '#fff';
            copyButton.style.cursor = 'pointer';
            copyButton.style.transition = 'background-color 0.2s';
            copyButton.addEventListener('mouseover', () => {
                copyButton.style.backgroundColor = '#3498db';
            });
            copyButton.addEventListener('mouseout', () => {
                copyButton.style.backgroundColor = '#2980b9';
            });
            copyButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const textToCopy = `[${type}] ${title}\n${description}`;
                navigator.clipboard.writeText(textToCopy);
            });
            headerDiv.appendChild(copyButton);

            logEntry.appendChild(headerDiv);

            let contentDiv = null;
            if (description && description.trim() !== '') {
                contentDiv = document.createElement('div');
                contentDiv.style.marginTop = '8px';
                contentDiv.style.paddingLeft = '20px';
                contentDiv.style.display = 'none';
                contentDiv.style.color = '#ccc';
                contentDiv.innerText = description;
                logEntry.appendChild(contentDiv);

                headerDiv.addEventListener('click', () => {
                    contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
                });
            }

            this.popupContent.appendChild(logEntry);
            this.logs.push({ type, title, description, timestamp });
            this.popupContent.scrollTop = this.popupContent.scrollHeight;
            this.applyFilters();
        }

        getLogColor(type) {
            switch (type) {
                case 'LOG':
                    return '#3498db';
                case 'WARNING':
                    return '#f39c12';
                case 'ERROR':
                    return '#e74c3c';
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
                content += `[${log.type}] ${log.title} ${log.timestamp}\n${log.description}\n\n`;
            });
            this.downloadFile('logs.txt', content);
        }

        exportLogsJson() {
            const json = JSON.stringify(this.logs, null, 2);
            this.downloadFile('logs.json', json);
        }

        downloadFile(filename, content) {
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

        applyFilters() {
            const filterValue = this.filterSelect.value;
            const searchTerm = this.searchInput.value.toLowerCase();

            Array.from(this.popupContent.children).forEach(logEntry => {
                const logType = logEntry.dataset.type;
                const logText = logEntry.innerText.toLowerCase();

                const typeMatch = filterValue === 'all' || logType === filterValue;
                const searchMatch = searchTerm === '' || logText.includes(searchTerm);

                if (typeMatch && searchMatch) {
                    logEntry.style.display = 'block';
                } else {
                    logEntry.style.display = 'none';
                }
            });
        }
    }

    Scratch.extensions.register(new LogsExtension());
}(Scratch));
