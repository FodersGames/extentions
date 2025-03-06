(function(Scratch) {
    'use strict';

    class LogsExtension {
        constructor() {
            this.logs = [];
            this.popup = null;
            this.popupContent = null;
            this.searchInput = null;
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
                    { opcode: 'closeLogs', blockType: Scratch.BlockType.COMMAND, text: 'Close logs popup' }
                ]
            };
        }

        showLogs() {
            if (!this.popup) {
                this.createPopup();
            }
            this.popup.style.display = 'block';
        }

        createPopup() {
            this.popup = document.createElement('div');
            Object.assign(this.popup.style, {
                position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', maxWidth: '600px', height: '70%', backgroundColor: '#fff',
                border: '1px solid #ccc', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', zIndex: '9999', padding: '20px', overflowY: 'auto', display: 'none'
            });

            const closeButton = document.createElement('span');
            Object.assign(closeButton.style, { position: 'absolute', top: '10px', right: '10px', fontSize: '24px', cursor: 'pointer' });
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => this.popup.style.display = 'none');

            this.searchInput = document.createElement('input');
            Object.assign(this.searchInput.style, { width: '100%', padding: '5px', marginBottom: '10px' });
            this.searchInput.placeholder = 'Search logs...';
            this.searchInput.addEventListener('input', () => this.filterLogs());

            this.popupContent = document.createElement('div');
            Object.assign(this.popupContent.style, { fontFamily: 'Arial, sans-serif', fontSize: '16px' });

            const clearButton = document.createElement('button');
            clearButton.textContent = 'Clear Logs';
            Object.assign(clearButton.style, { margin: '10px 0', padding: '5px 10px' });
            clearButton.addEventListener('click', () => this.clearLogs());

            const exportButton = document.createElement('button');
            exportButton.textContent = 'Export Logs';
            Object.assign(exportButton.style, { margin: '10px', padding: '5px 10px' });
            exportButton.addEventListener('click', () => this.exportLogs());

            this.popup.append(closeButton, this.searchInput, clearButton, exportButton, this.popupContent);
            document.body.appendChild(this.popup);
        }

        log(args) { this.addLog('LOG', args.MESSAGE); }
        warn(args) { this.addLog('WARNING', args.MESSAGE); }
        error(args) { this.addLog('ERROR', args.MESSAGE); }

        addLog(type, message) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            Object.assign(logEntry.style, { padding: '5px', marginBottom: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' });
            logEntry.innerHTML = `<span style='font-weight:bold; color:${this.getLogColor(type)}'>[${type}]</span> <span>[${timestamp}]</span> ${message}`;
            logEntry.addEventListener('click', () => navigator.clipboard.writeText(message));
            this.popupContent.appendChild(logEntry);
            this.logs.push({ type, timestamp, message });
            this.popupContent.scrollTop = this.popupContent.scrollHeight;
        }

        filterLogs() {
            const filter = this.searchInput.value.toLowerCase();
            Array.from(this.popupContent.children).forEach(log => log.style.display = log.innerText.toLowerCase().includes(filter) ? '' : 'none');
        }

        clearLogs() {
            this.logs = [];
            this.popupContent.innerHTML = '';
        }

        exportLogs() {
            const data = JSON.stringify(this.logs, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'logs.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        closeLogs() {
            if (this.popup) this.popup.style.display = 'none';
        }

        getLogColor(type) {
            return { 'LOG': 'blue', 'WARNING': 'orange', 'ERROR': 'red' }[type] || 'black';
        }
    }

    Scratch.extensions.register(new LogsExtension());

})(Scratch);
