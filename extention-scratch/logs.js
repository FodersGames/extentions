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
            this.searchHistory = [];
            this.isSearchHistoryVisible = false;
            this.variableStats = {}; // Store statistics for monitored variables
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
                            TITLE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Log Title' },
                            DESCRIPTION: { type: Scratch.ArgumentType.STRING, defaultValue: 'Log Description' }
                        }
                    },
                    {
                        opcode: 'warn',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Warn [TITLE] [DESCRIPTION]',
                        arguments: {
                            TITLE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Warning Title' },
                            DESCRIPTION: { type: Scratch.ArgumentType.STRING, defaultValue: 'Warning Description' }
                        }
                    },
                    {
                        opcode: 'error',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Error [TITLE] [DESCRIPTION]',
                        arguments: {
                            TITLE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Error Title' },
                            DESCRIPTION: { type: Scratch.ArgumentType.STRING, defaultValue: 'Error Description' }
                        }
                    },
                    {
                        opcode: 'conditionalLog',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Conditional Log If [CONDITION] Then Log [MESSAGE]',
                        arguments: {
                            CONDITION: { type: Scratch.ArgumentType.BOOLEAN },
                            MESSAGE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Condition Met!' }
                        }
                    },
                    {
                        opcode: 'monitorVariable',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Monitor Variable [VARIABLE]',
                        arguments: {
                            VARIABLE: { type: Scratch.ArgumentType.STRING, defaultValue: 'myVariable' }
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
                    logTypes: ['LOG', 'WARNING', 'ERROR'],
                    iconTypes: ['info', 'warning', 'error'] // Example icon types
                }
            };
        }

        showLogs() {
            if (!this.popup) {
                this.popup = document.createElement('div');
                this.popup.style.position = 'fixed';
                this.popup.style.top = '50%';
                this.popup.style.left = '50%';
                this.popup.style.transform = 'translate(-50%, -50%)';
                this.popup.style.width = '85%';
                this.popup.style.maxWidth = '900px';
                this.popup.style.height = '80%';
                this.applyTheme();
                this.popup.style.zIndex = '9999';
                this.popup.style.padding = '20px';
                this.popup.style.overflow = 'hidden';
                this.popup.style.display = 'none';
                this.popup.style.fontFamily = '"Roboto Mono", Consolas, monospace';

                const closeButton = document.createElement('span');
                closeButton.innerHTML = '&times;';
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px';
                closeButton.style.right = '10px';
                closeButton.style.fontSize = '28px';
                closeButton.style.color = '#e74c3c';
                closeButton.style.cursor = 'pointer';
                closeButton.addEventListener('click', () => {
                    this.popup.style.display = 'none';
                    this.hideSearchHistory();
                });
                this.popup.appendChild(closeButton);

                const controlsBar = document.createElement('div');
                controlsBar.style.marginBottom = '15px';
                controlsBar.style.display = 'flex';
                controlsBar.style.alignItems = 'center';
                controlsBar.style.gap = '10px';

                const themeSelect = document.createElement('select');
                themeSelect.style.padding = '6px';
                themeSelect.style.borderRadius = '4px';
                themeSelect.style.border = '1px solid #555';
                themeSelect.style.backgroundColor = '#2c2c2c';
                themeSelect.style.color = '#dcdcdc';
                const themeOptions = [
                    { value: 'dark', text: 'Dark' },
                    { value: 'light', text: 'Light' },
                    { value: 'highContrast', text: 'High Contrast' }
                ];
                themeOptions.forEach(opt => {
                    const optionElem = document.createElement('option');
                    optionElem.value = opt.value;
                    optionElem.text = opt.text;
                    themeSelect.appendChild(optionElem);
                });
                themeSelect.value = this.theme;
                themeSelect.addEventListener('change', () => {
                    this.theme = themeSelect.value;
                    this.applyTheme();
                });
                controlsBar.appendChild(themeSelect);

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
                controlsBar.appendChild(this.filterSelect);

                const searchContainer = document.createElement('div');
                searchContainer.style.position = 'relative';

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
                this.searchInput.addEventListener('focus', () => this.showSearchHistory());
                this.searchInput.addEventListener('blur', () => setTimeout(() => this.hideSearchHistory(), 100));
                searchContainer.appendChild(this.searchInput);

                this.searchHistoryList = document.createElement('ul');
                this.searchHistoryList.style.position = 'absolute';
                this.searchHistoryList.style.top = '100%';
                this.searchHistoryList.style.left = '0';
                this.searchHistoryList.style.width = '100%';
                this.searchHistoryList.style.listStyleType = 'none';
                this.searchHistoryList.style.padding = '0';
                this.searchHistoryList.style.margin = '0';
                this.searchHistoryList.style.backgroundColor = '#333';
                this.searchHistoryList.style.color = '#fff';
                this.searchHistoryList.style.borderRadius = '4px';
                this.searchHistoryList.style.border = '1px solid #555';
                this.searchHistoryList.style.display = 'none';
                searchContainer.appendChild(this.searchHistoryList);

                controlsBar.appendChild(searchContainer);

                const regexCheckbox = document.createElement('input');
                regexCheckbox.type = 'checkbox';
                regexCheckbox.id = 'regexCheckbox';
                const regexLabel = document.createElement('label');
                regexLabel.htmlFor = 'regexCheckbox';
                regexLabel.innerText = 'Regex';
                regexLabel.style.color = '#eee';
                regexLabel.style.marginLeft = '5px';
                controlsBar.appendChild(regexCheckbox);
                controlsBar.appendChild(regexLabel);

                const exportTxtButton = document.createElement('button');
                exportTxtButton.innerText = 'Export TXT';
                exportTxtButton.style.padding = '6px 12px';
                exportTxtButton.style.border = 'none';
                exportTxtButton.style.borderRadius = '4px';
                exportTxtButton.style.backgroundColor = '#27ae60';
                exportTxtButton.style.color = '#fff';
                exportTxtButton.style.cursor = 'pointer';
                exportTxtButton.addEventListener('click', () => this.exportLogsTxt());

                const exportJsonButton = document.createElement('button');
                exportJsonButton.innerText = 'Export JSON';
                exportJsonButton.style.padding = '6px 12px';
                exportJsonButton.style.border = 'none';
                exportJsonButton.style.borderRadius = '4px';
                exportJsonButton.style.backgroundColor = '#27ae60';
                exportJsonButton.style.color = '#fff';
                exportJsonButton.style.cursor = 'pointer';
                exportJsonButton.addEventListener('click', () => this.exportLogsJson());

                controlsBar.appendChild(exportTxtButton);
                controlsBar.appendChild(exportJsonButton);

                this.popup.appendChild(controlsBar);

                this.variableStatsDiv = document.createElement('div'); // Variable stats display
                this.variableStatsDiv.style.marginTop = '10px';
                this.variableStatsDiv.style.color = this.getTextColor();
                this.popup.appendChild(this.variableStatsDiv);

                this.popupContent = document.createElement('div');
                this.popupContent.style.overflowY = 'auto';
                this.popupContent.style.height = 'calc(100% - 150px)'; // Adjusted height
                this.popupContent.style.paddingRight = '10px';
                this.popup.appendChild(this.popupContent);

                document.body.appendChild(this.popup);
            }
            this.popup.style.display = 'block';
            this.applyFilters();
            this.updateVariableStatsDisplay();
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

        conditionalLog(args) {
            if (args.CONDITION) {
                this.addLog('LOG', 'Conditional Log', args.MESSAGE);
            }
        }

        monitorVariable(args) {
            const variableName = args.VARIABLE;
            if (!this.variableStats[variableName]) {
                this.variableStats[variableName] = {
                    min: Infinity,
                    max: -Infinity,
                    sum: 0,
                    count: 0,
                    latest: null
                };
            }
            this.updateVariableStats(variableName);
        }

        updateVariableStats(variableName) {
            const variable = Scratch.vm.runtime.getVariable(variableName);
            if (variable) {
                const value = Scratch.Cast.toNumber(variable.value);
                const stats = this.variableStats[variableName];

                stats.latest = value;
                stats.min = Math.min(stats.min, value);
                stats.max = Math.max(stats.max, value);
                stats.sum += value;
                stats.count++;

                this.updateVariableStatsDisplay();
            }
        }

        updateVariableStatsDisplay() {
            this.variableStatsDiv.innerHTML = '';
            for (const variableName in this.variableStats) {
                const stats = this.variableStats[variableName];
                const variableDiv = document.createElement('div');
                variableDiv.style.marginBottom = '5px';
                variableDiv.style.color = this.getTextColor();
                variableDiv.innerHTML = `
                    <b>${variableName}:</b><br>
                    Latest: ${stats.latest}<br>
                    Min: ${stats.min === Infinity ? 'N/A' : stats.min}, 
                    Max: ${stats.max === -Infinity ? 'N/A' : stats.max}, 
                    Avg: ${stats.count === 0 ? 'N/A' : (stats.sum / stats.count).toFixed(2)}
                `;
                this.variableStatsDiv.appendChild(variableDiv);
            }
        }

        addLog(type, title, description, icon = 'info') {
            const timestamp = new Date().toISOString();
            const logEntry = document.createElement('div');
            logEntry.style.padding = '12px';
            logEntry.style.marginBottom = '12px';
            logEntry.style.borderRadius = '4px';
            this.applyThemeToLogEntry(logEntry);
            logEntry.style.borderLeft = `4px solid ${this.getLogColor(type)}`;
            logEntry.dataset.type = type;
            logEntry.dataset.icon = icon; // Store the icon type

            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.cursor = description && description.trim() !== '' ? 'pointer' : 'default';

            const headerLeft = document.createElement('div');
            headerLeft.style.display = 'flex';
            headerLeft.style.alignItems = 'center';

            const iconSpan = document.createElement('span');
            iconSpan.innerHTML = this.getIconHTML(icon); // Insert the icon
            iconSpan.style.marginRight = '5px';
            headerLeft.appendChild(iconSpan);

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
            logTitle.style.color = this.getTextColor();
            logTitle.innerText = title;
            headerLeft.appendChild(logTitle);

            headerDiv.appendChild(headerLeft);

            const copyButton = document.createElement('button');
            copyButton.innerText = 'Copy';
            copyButton.style.fontSize = '12px';
            copyButton.style.padding = '4px 8px';
            copyButton.style.border = 'none';
            copyButton.style.borderRadius = '4px';
            copyButton.style.backgroundColor = '#2980b9';
            copyButton.style.color = '#fff';
            copyButton.style.cursor = 'pointer';
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
            this.applyFilters();
        }

        applyTheme() {
            const bgColor = this.theme === 'dark' ? '#222' : this.theme === 'light' ? '#eee' : '#000';
            const textColor = this.theme === 'dark' ? '#eee' : this.theme === 'light' ? '#222' : '#ff0';

            this.popup.style.backgroundColor = bgColor;
            this.popup.style.color = textColor;
            if (this.variableStatsDiv) this.variableStatsDiv.style.color = textColor;

            if (this.popupContent) {
                Array.from(this.popupContent.children).forEach(logEntry => {
                    this.applyThemeToLogEntry(logEntry);
                });
            }
        }

        applyThemeToLogEntry(logEntry) {
            const bgColor = this.theme === 'dark' ? '#333' : this.theme === 'light' ? '#ddd' : '#111';
            logEntry.style.backgroundColor = bgColor;
            logEntry.style.color = this.getTextColor();
        }

        getTextColor() {
            return this.theme === 'dark' ? '#eee' : this.theme === 'light' ? '#222' : '#ff0';
        }

        getLogColor(type) {
            switch (type) {
                case 'LOG': return '#3498db';
                case 'WARNING': return '#f39c12';
                case 'ERROR': return '#e74c3c';
                default: return '#dcdcdc';
            }
        }

        getIconHTML(icon) {
            switch (icon) {
                case 'warning': return '⚠️';
                case 'error': return '❌';
                default: return 'ℹ️'; // Info icon
            }
        }

        clearLogs() {
            this.logs = [];
            this.popupContent.innerHTML = '';
        }

        closeLogs() {
            if (this.popup) {
                this.popup.style.display = 'none';
                this.hideSearchHistory();
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
            const useRegex = document.getElementById('regexCheckbox').checked;

            if (searchTerm) {
                this.addSearchTermToHistory(searchTerm);
            }

            Array.from(this.popupContent.children).forEach(logEntry => {
                const logType = logEntry.dataset.type;
                const logText = logEntry.innerText.toLowerCase();

                let searchMatch = true;
                if (searchTerm) {
                    try {
                        if (useRegex) {
                            const regex = new RegExp(searchTerm, 'i');
                            searchMatch = regex.test(logText);
                        } else {
                            searchMatch = logText.includes(searchTerm);
                        }
                    } catch (error) {
                        console.error('Invalid regex:', error);
                        searchMatch = false;
                    }
                }

                const typeMatch = filterValue === 'all' || logType === filterValue;
                logEntry.style.display = (typeMatch && searchMatch) ? 'block' : 'none';
            });
        }

        addSearchTermToHistory(term) {
            if (!this.searchHistory.includes(term)) {
                this.searchHistory.push(term);
                if (this.searchHistory.length > 10) {
                    this.searchHistory.shift();
                }
                this.updateSearchHistoryList();
            }
        }

        showSearchHistory() {
            this.isSearchHistoryVisible = true;
            this.updateSearchHistoryList();
            this.searchHistoryList.style.display = 'block';
        }

        hideSearchHistory() {
            this.isSearchHistoryVisible = false;
            this.searchHistoryList.style.display = 'none';
        }

        updateSearchHistoryList() {
            this.searchHistoryList.innerHTML = '';
            this.searchHistory.forEach(term => {
                const listItem = document.createElement('li');
                listItem.style.padding = '5px';
                listItem.style.cursor = 'pointer';
                listItem.textContent = term;
                listItem.addEventListener('click', () => {
                    this.searchInput.value = term;
                    this.applyFilters();
                    this.hideSearchHistory();
                });
                this.searchHistoryList.appendChild(listItem);
            });
        }
    }
    Scratch.extensions.register(new LogsExtension());
}(Scratch));
