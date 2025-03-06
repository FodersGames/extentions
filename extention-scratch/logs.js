(function(Scratch) {
    'use strict';

    class LogExtension {
        constructor() {
            this.logs = [];
            this.logWindow = null;
        }

        getInfo() {
            return {
                id: 'logExtension',
                name: 'Logs',
                blocks: [
                    { opcode: 'showLogs', blockType: Scratch.BlockType.COMMAND, text: 'Show Logs' },
                    { opcode: 'addLog', blockType: Scratch.BlockType.COMMAND, text: 'Log [MESSAGE]', arguments: { MESSAGE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Hello World' } } },
                    { opcode: 'addWarn', blockType: Scratch.BlockType.COMMAND, text: 'Warn [MESSAGE]', arguments: { MESSAGE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Warning message' } } },
                    { opcode: 'addError', blockType: Scratch.BlockType.COMMAND, text: 'Error [MESSAGE]', arguments: { MESSAGE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Error message' } } },
                    { opcode: 'clearLogs', blockType: Scratch.BlockType.COMMAND, text: 'Clear Logs' },
                    { opcode: 'closeLogs', blockType: Scratch.BlockType.COMMAND, text: 'Close Logs' },
                    { opcode: 'exportLogs', blockType: Scratch.BlockType.COMMAND, text: 'Export Logs as [FORMAT]', arguments: { FORMAT: { type: Scratch.ArgumentType.STRING, menu: 'logFormats' } } },
                    { opcode: 'filterLogs', blockType: Scratch.BlockType.COMMAND, text: 'Filter logs by [TYPE]', arguments: { TYPE: { type: Scratch.ArgumentType.STRING, menu: 'logTypes' } } },
                    { opcode: 'searchLogs', blockType: Scratch.BlockType.COMMAND, text: 'Search logs for [QUERY]', arguments: { QUERY: { type: Scratch.ArgumentType.STRING, defaultValue: 'keyword' } } }
                ],
                menus: {
                    logFormats: { acceptReporters: false, items: ['txt', 'json'] },
                    logTypes: { acceptReporters: false, items: ['all', 'log', 'warn', 'error'] }
                }
            };
        }

        addLog(args) { this.addToLogs('log', args.MESSAGE); }
        addWarn(args) { this.addToLogs('warn', args.MESSAGE); }
        addError(args) { this.addToLogs('error', args.MESSAGE); }

        addToLogs(type, message) {
            const timestamp = new Date().toLocaleTimeString();
            this.logs.push({ type, message, timestamp });
            console[type](message);
        }

        showLogs() {
            if (this.logWindow) return;
            this.logWindow = document.createElement('div');
            this.logWindow.style = 'position: fixed; bottom: 10px; right: 10px; width: 300px; height: 400px; background: white; border: 1px solid black; overflow-y: auto; padding: 10px; z-index: 9999;';
            
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style = 'position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; cursor: pointer;';
            closeButton.onclick = () => this.closeLogs();
            
            const searchBar = document.createElement('input');
            searchBar.type = 'text';
            searchBar.placeholder = 'Search logs...';
            searchBar.style = 'width: 100%; margin-bottom: 5px;';
            searchBar.oninput = () => this.updateLogsDisplay(searchBar.value);
            
            this.logWindow.appendChild(closeButton);
            this.logWindow.appendChild(searchBar);
            document.body.appendChild(this.logWindow);
            this.updateLogsDisplay();
        }

        updateLogsDisplay(query = '') {
            if (!this.logWindow) return;
            const logsList = this.logWindow.querySelector('ul') || document.createElement('ul');
            logsList.innerHTML = '';
            this.logs.filter(log => log.message.includes(query)).forEach(log => {
                const logItem = document.createElement('li');
                logItem.textContent = `[${log.timestamp}] ${log.message}`;
                logItem.style = `color: ${log.type === 'error' ? 'red' : log.type === 'warn' ? 'orange' : 'black'}`;
                logItem.onclick = () => navigator.clipboard.writeText(log.message);
                logsList.appendChild(logItem);
            });
            if (!this.logWindow.contains(logsList)) this.logWindow.appendChild(logsList);
        }

        clearLogs() { this.logs = []; this.updateLogsDisplay(); }
        closeLogs() { if (this.logWindow) { document.body.removeChild(this.logWindow); this.logWindow = null; } }

        exportLogs(args) {
            const format = args.FORMAT;
            const data = format === 'json' ? JSON.stringify(this.logs, null, 2) : this.logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
            const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `logs.${format}`;
            link.click();
        }

        filterLogs(args) {
            this.updateLogsDisplay();
            if (args.TYPE !== 'all') {
                this.logs = this.logs.filter(log => log.type === args.TYPE);
                this.updateLogsDisplay();
            }
        }

        searchLogs(args) { this.updateLogsDisplay(args.QUERY); }
    }

    Scratch.extensions.register(new LogExtension());
})(Scratch);
