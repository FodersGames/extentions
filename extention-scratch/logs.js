(function(Scratch) {
    'use strict';

    class LogsExtension {
        constructor() {
            this.logs = [];
            this.popup = null;
            this.popupContent = null;
            this.filterType = 'ALL';
        }

        getInfo() {
            return {
                id: 'logsExtension',
                name: 'Logs Extension',
                blocks: [
                    { opcode: 'showLogs', blockType: Scratch.BlockType.COMMAND, text: 'Show logs popup' },
                    { opcode: 'log', blockType: Scratch.BlockType.COMMAND, text: 'Log [MESSAGE]', arguments: { MESSAGE: { type: Scratch.ArgumentType.STRING, defaultValue: 'This is a log message' } } },
                    { opcode: 'warn', blockType: Scratch.BlockType.COMMAND, text: 'Warn [MESSAGE]', arguments: { MESSAGE: { type: Scratch.ArgumentType.STRING, defaultValue: 'This is a warning message' } } },
                    { opcode: 'error', blockType: Scratch.BlockType.COMMAND, text: 'Error [MESSAGE]', arguments: { MESSAGE: { type: Scratch.ArgumentType.STRING, defaultValue: 'This is an error message' } } },
                    { opcode: 'clearLogs', blockType: Scratch.BlockType.COMMAND, text: 'Clear logs' },
                    { opcode: 'closeLogs', blockType: Scratch.BlockType.COMMAND, text: 'Close logs popup' },
                    { opcode: 'exportLogs', blockType: Scratch.BlockType.COMMAND, text: 'Export logs as [FORMAT]', arguments: { FORMAT: { type: Scratch.ArgumentType.STRING, defaultValue: 'txt' } } },
                    { opcode: 'setFilter', blockType: Scratch.BlockType.COMMAND, text: 'Show only [TYPE] logs', arguments: { TYPE: { type: Scratch.ArgumentType.STRING, defaultValue: 'ALL' } } },
                ]
            };
        }

        showLogs() {
            if (!this.popup) {
                this.createPopup();
            }
            this.updateLogDisplay();
            this.popup.style.display = 'block';
        }

        createPopup() {
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
            this.popup.style.display = 'none';

            const closeButton = document.createElement('span');
            closeButton.innerHTML = '&times;';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.fontSize = '24px';
            closeButton.style.cursor = 'pointer';
            closeButton.addEventListener('click', () => this.closeLogs());

            this.popupContent = document.createElement('div');
            this.popupContent.style.fontFamily = 'Arial, sans-serif';
            this.popupContent.style.fontSize = '16px';
            
            this.searchBar = document.createElement('input');
            this.searchBar.setAttribute('placeholder', 'Search logs...');
            this.searchBar.style.width = '100%';
            this.searchBar.style.marginBottom = '10px';
            this.searchBar.addEventListener('input', () => this.updateLogDisplay());
            
            this.popup.appendChild(closeButton);
            this.popup.appendChild(this.searchBar);
            this.popup.appendChild(this.popupContent);
            document.body.appendChild(this.popup);
        }

        addLog(type, message) {
            const timestamp = new Date().toLocaleTimeString();
            const logObject = { type, message, timestamp };
            this.logs.push(logObject);
            this.updateLogDisplay();
        }

        updateLogDisplay() {
            if (!this.popupContent) return;
            this.popupContent.innerHTML = '';
            const searchQuery = this.searchBar.value.toLowerCase();
            
            this.logs.filter(log =>
                (this.filterType === 'ALL' || log.type === this.filterType) &&
                log.message.toLowerCase().includes(searchQuery)
            ).forEach(log => {
                const logEntry = document.createElement('div');
                logEntry.innerHTML = `[${log.timestamp}] [${log.type}] ${log.message}`;
                logEntry.style.color = this.getLogColor(log.type);
                logEntry.style.cursor = 'pointer';
                logEntry.addEventListener('click', () => navigator.clipboard.writeText(log.message));
                this.popupContent.appendChild(logEntry);
            });
        }

        getLogColor(type) {
            return { LOG: 'blue', WARNING: 'orange', ERROR: 'red' }[type] || 'black';
        }

        clearLogs() {
            this.logs = [];
            this.updateLogDisplay();
        }

        closeLogs() {
            if (this.popup) {
                this.popup.style.display = 'none';
            }
        }

        exportLogs(args) {
            const format = args.FORMAT.toLowerCase();
            let content = '';
            if (format === 'json') {
                content = JSON.stringify(this.logs, null, 2);
            } else {
                content = this.logs.map(log => `[${log.timestamp}] [${log.type}] ${log.message}`).join('\n');
            }
            const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `logs.${format}`;
            a.click();
        }

        setFilter(args) {
            this.filterType = args.TYPE.toUpperCase();
            this.updateLogDisplay();
        }
    }

    Scratch.extensions.register(new LogsExtension());
})(Scratch);
