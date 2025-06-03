(function(Scratch) {
    'use strict';

    class ProfessionalLoggerExtension {
        constructor() {
            this.logs = [];
            this.logId = 0;
            this.consoleWindow = null;
            this.isConsoleOpen = false;
            this.filters = {
                info: true,
                warning: true,
                error: true,
                debug: true
            };
            this.maxLogs = 1000;
            
            // Initialize console
            this._createConsole();
        }

        getInfo() {
            return {
                id: 'professionalLogger',
                name: 'Professional Logger',
                color1: '#2C3E50',
                color2: '#34495E',
                blocks: [
                    {
                        opcode: 'logInfo',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '📘 Log Info: [MESSAGE]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Information message'
                            }
                        }
                    },
                    {
                        opcode: 'logWarning',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '⚠️ Log Warning: [MESSAGE]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Warning message'
                            }
                        }
                    },
                    {
                        opcode: 'logError',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '🔴 Log Error: [MESSAGE]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Error message'
                            }
                        }
                    },
                    {
                        opcode: 'logDebug',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '🔧 Log Debug: [MESSAGE]',
                        arguments: {
                            MESSAGE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Debug message'
                            }
                        }
                    },
                    {
                        opcode: 'executeAndLog',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '📊 Execute and Log Blocks',
                        arguments: {}
                    },
                    {
                        opcode: 'openConsole',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '🖥️ Open Console'
                    },
                    {
                        opcode: 'closeConsole',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '❌ Close Console'
                    },
                    {
                        opcode: 'clearLogs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '🗑️ Clear All Logs'
                    },
                    {
                        opcode: 'getLogCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'total logs count'
                    },
                    {
                        opcode: 'getLastLog',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'last log message'
                    },
                    {
                        opcode: 'exportLogs',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '💾 Export Logs to File'
                    }
                ]
            };
        }

        _createConsole() {
            // Create console window
            this.consoleWindow = document.createElement('div');
            this.consoleWindow.id = 'professional-logger-console';
            this.consoleWindow.style.cssText = `
                position: fixed;
                top: 50px;
                right: 20px;
                width: 600px;
                height: 500px;
                background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
                border: 2px solid #3498DB;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                z-index: 999999;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                display: none;
                flex-direction: column;
                backdrop-filter: blur(10px);
            `;

            // Create header
            const header = document.createElement('div');
            header.style.cssText = `
                background: linear-gradient(90deg, #3498DB, #2980B9);
                color: white;
                padding: 12px 16px;
                border-radius: 10px 10px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
                font-size: 14px;
                cursor: move;
            `;
            header.innerHTML = `
                <span>🚀 Professional Logger Console</span>
                <div>
                    <button id="minimize-console" style="background: #F39C12; border: none; color: white; padding: 4px 8px; border-radius: 4px; margin-right: 5px; cursor: pointer;">−</button>
                    <button id="close-console" style="background: #E74C3C; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
                </div>
            `;

            // Create toolbar
            const toolbar = document.createElement('div');
            toolbar.style.cssText = `
                background: #34495E;
                padding: 8px 16px;
                border-bottom: 1px solid #4A5F7A;
                display: flex;
                gap: 10px;
                align-items: center;
                flex-wrap: wrap;
            `;
            toolbar.innerHTML = `
                <button id="clear-logs-btn" style="background: #E74C3C; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">🗑️ Clear</button>
                <button id="export-logs-btn" style="background: #27AE60; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">💾 Export</button>
                <div style="height: 20px; width: 1px; background: #4A5F7A;"></div>
                <label style="color: #BDC3C7; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="filter-info" checked style="accent-color: #3498DB;"> 📘 Info
                </label>
                <label style="color: #BDC3C7; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="filter-warning" checked style="accent-color: #F39C12;"> ⚠️ Warning
                </label>
                <label style="color: #BDC3C7; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="filter-error" checked style="accent-color: #E74C3C;"> 🔴 Error
                </label>
                <label style="color: #BDC3C7; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" id="filter-debug" checked style="accent-color: #9B59B6;"> 🔧 Debug
                </label>
            `;

            // Create search bar
            const searchBar = document.createElement('div');
            searchBar.style.cssText = `
                background: #34495E;
                padding: 8px 16px;
                border-bottom: 1px solid #4A5F7A;
            `;
            searchBar.innerHTML = `
                <input type="text" id="search-logs" placeholder="🔍 Search logs..." style="
                    width: 100%;
                    background: #2C3E50;
                    border: 1px solid #4A5F7A;
                    color: #ECF0F1;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    outline: none;
                ">
            `;

            // Create logs container
            const logsContainer = document.createElement('div');
            logsContainer.id = 'logs-container';
            logsContainer.style.cssText = `
                flex: 1;
                overflow-y: auto;
                padding: 8px;
                background: #2C3E50;
                color: #ECF0F1;
                font-size: 12px;
                line-height: 1.4;
            `;

            // Create status bar
            const statusBar = document.createElement('div');
            statusBar.id = 'status-bar';
            statusBar.style.cssText = `
                background: #34495E;
                color: #BDC3C7;
                padding: 6px 16px;
                border-top: 1px solid #4A5F7A;
                font-size: 11px;
                border-radius: 0 0 10px 10px;
            `;
            statusBar.textContent = 'Ready • 0 logs';

            // Assemble console
            this.consoleWindow.appendChild(header);
            this.consoleWindow.appendChild(toolbar);
            this.consoleWindow.appendChild(searchBar);
            this.consoleWindow.appendChild(logsContainer);
            this.consoleWindow.appendChild(statusBar);

            // Add to document
            document.body.appendChild(this.consoleWindow);

            // Add event listeners
            this._addEventListeners();

            // Make draggable
            this._makeDraggable(header);
        }

        _addEventListeners() {
            // Close button
            document.getElementById('close-console').addEventListener('click', () => {
                this.closeConsole();
            });

            // Clear button
            document.getElementById('clear-logs-btn').addEventListener('click', () => {
                this.clearLogs();
            });

            // Export button
            document.getElementById('export-logs-btn').addEventListener('click', () => {
                this.exportLogs();
            });

            // Filter checkboxes
            ['info', 'warning', 'error', 'debug'].forEach(type => {
                document.getElementById(`filter-${type}`).addEventListener('change', (e) => {
                    this.filters[type] = e.target.checked;
                    this._refreshLogDisplay();
                });
            });

            // Search functionality
            document.getElementById('search-logs').addEventListener('input', (e) => {
                this._filterLogs(e.target.value);
            });
        }

        _makeDraggable(header) {
            let isDragging = false;
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            header.addEventListener('mousedown', (e) => {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                    xOffset = currentX;
                    yOffset = currentY;
                    this.consoleWindow.style.transform = `translate(${currentX}px, ${currentY}px)`;
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }

        _addLog(type, message, details = null) {
            const timestamp = new Date();
            const log = {
                id: ++this.logId,
                type: type,
                message: message,
                details: details,
                timestamp: timestamp,
                time: timestamp.toLocaleTimeString()
            };

            this.logs.push(log);

            // Limit logs
            if (this.logs.length > this.maxLogs) {
                this.logs.shift();
            }

            // Add to display
            this._addLogToDisplay(log);
            this._updateStatusBar();

            // Auto-scroll to bottom
            const container = document.getElementById('logs-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }

        _addLogToDisplay(log) {
            const container = document.getElementById('logs-container');
            if (!container) return;

            const logElement = document.createElement('div');
            logElement.className = `log-entry log-${log.type}`;
            logElement.style.cssText = `
                margin-bottom: 4px;
                padding: 8px 12px;
                border-radius: 6px;
                border-left: 4px solid ${this._getLogColor(log.type)};
                background: ${this._getLogBackground(log.type)};
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                transition: all 0.2s ease;
                cursor: pointer;
            `;

            const icon = this._getLogIcon(log.type);
            const typeText = log.type.toUpperCase();

            logElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="font-size: 14px;">${icon}</span>
                            <span style="color: ${this._getLogColor(log.type)}; font-weight: bold; font-size: 11px;">${typeText}</span>
                            <span style="color: #7F8C8D; font-size: 10px;">#${log.id}</span>
                        </div>
                        <div style="color: #ECF0F1; font-size: 13px; word-break: break-word;">
                            ${this._escapeHtml(log.message)}
                        </div>
                        ${log.details ? `
                            <div style="margin-top: 6px; padding: 6px; background: rgba(0,0,0,0.2); border-radius: 4px; font-size: 11px; color: #BDC3C7;">
                                <strong>Details:</strong><br>
                                <pre style="margin: 4px 0 0 0; white-space: pre-wrap; font-family: inherit;">${this._escapeHtml(JSON.stringify(log.details, null, 2))}</pre>
                            </div>
                        ` : ''}
                    </div>
                    <div style="color: #7F8C8D; font-size: 10px; white-space: nowrap;">
                        ${log.time}
                    </div>
                </div>
            `;

            // Add hover effect
            logElement.addEventListener('mouseenter', () => {
                logElement.style.background = this._getLogHoverBackground(log.type);
                logElement.style.transform = 'translateX(2px)';
            });

            logElement.addEventListener('mouseleave', () => {
                logElement.style.background = this._getLogBackground(log.type);
                logElement.style.transform = 'translateX(0)';
            });

            // Add click to copy
            logElement.addEventListener('click', () => {
                navigator.clipboard.writeText(`[${log.time}] ${typeText}: ${log.message}`);
                this._showToast('Log copied to clipboard!');
            });

            container.appendChild(logElement);
        }

        _getLogColor(type) {
            const colors = {
                info: '#3498DB',
                warning: '#F39C12',
                error: '#E74C3C',
                debug: '#9B59B6'
            };
            return colors[type] || '#95A5A6';
        }

        _getLogBackground(type) {
            const backgrounds = {
                info: 'rgba(52, 152, 219, 0.1)',
                warning: 'rgba(243, 156, 18, 0.1)',
                error: 'rgba(231, 76, 60, 0.1)',
                debug: 'rgba(155, 89, 182, 0.1)'
            };
            return backgrounds[type] || 'rgba(149, 165, 166, 0.1)';
        }

        _getLogHoverBackground(type) {
            const backgrounds = {
                info: 'rgba(52, 152, 219, 0.2)',
                warning: 'rgba(243, 156, 18, 0.2)',
                error: 'rgba(231, 76, 60, 0.2)',
                debug: 'rgba(155, 89, 182, 0.2)'
            };
            return backgrounds[type] || 'rgba(149, 165, 166, 0.2)';
        }

        _getLogIcon(type) {
            const icons = {
                info: '📘',
                warning: '⚠️',
                error: '🔴',
                debug: '🔧'
            };
            return icons[type] || '📝';
        }

        _escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        _updateStatusBar() {
            const statusBar = document.getElementById('status-bar');
            if (statusBar) {
                const totalLogs = this.logs.length;
                const visibleLogs = document.querySelectorAll('.log-entry:not([style*="display: none"])').length;
                statusBar.textContent = `Ready • ${totalLogs} total logs • ${visibleLogs} visible`;
            }
        }

        _refreshLogDisplay() {
            const container = document.getElementById('logs-container');
            if (container) {
                container.innerHTML = '';
                this.logs.forEach(log => {
                    if (this.filters[log.type]) {
                        this._addLogToDisplay(log);
                    }
                });
                this._updateStatusBar();
            }
        }

        _filterLogs(searchTerm) {
            const logEntries = document.querySelectorAll('.log-entry');
            logEntries.forEach(entry => {
                const text = entry.textContent.toLowerCase();
                const matches = text.includes(searchTerm.toLowerCase());
                entry.style.display = matches ? 'block' : 'none';
            });
            this._updateStatusBar();
        }

        _showToast(message) {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27AE60;
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                z-index: 1000000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease;
            `;
            toast.textContent = message;

            // Add animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
                style.remove();
            }, 3000);
        }

        // Block execution analyzer
        _analyzeBlockExecution(util) {
            try {
                const target = util.target;
                const thread = util.thread;
                const blockId = thread.peekStack();
                
                if (!blockId) return null;

                const block = target.blocks.getBlock(blockId);
                if (!block) return null;

                const blockInfo = {
                    id: blockId,
                    opcode: block.opcode,
                    inputs: {},
                    fields: {},
                    target: target.getName(),
                    sprite: target.sprite.name
                };

                // Get inputs
                if (block.inputs) {
                    for (const [key, input] of Object.entries(block.inputs)) {
                        if (input.block) {
                            const inputBlock = target.blocks.getBlock(input.block);
                            if (inputBlock) {
                                blockInfo.inputs[key] = {
                                    type: inputBlock.opcode,
                                    value: this._getBlockValue(inputBlock, target)
                                };
                            }
                        }
                    }
                }

                // Get fields
                if (block.fields) {
                    for (const [key, field] of Object.entries(block.fields)) {
                        blockInfo.fields[key] = field.value;
                    }
                }

                return blockInfo;
            } catch (error) {
                return { error: error.message };
            }
        }

        _getBlockValue(block, target) {
            try {
                switch (block.opcode) {
                    case 'text':
                        return block.fields.TEXT ? block.fields.TEXT.value : '';
                    case 'math_number':
                        return block.fields.NUM ? block.fields.NUM.value : 0;
                    case 'data_variable':
                        const varId = block.fields.VARIABLE ? block.fields.VARIABLE.id : null;
                        return varId ? target.variables[varId].value : 'undefined';
                    default:
                        return `[${block.opcode}]`;
                }
            } catch {
                return 'unknown';
            }
        }

        // Public methods for blocks
        logInfo(args) {
            this._addLog('info', args.MESSAGE);
        }

        logWarning(args) {
            this._addLog('warning', args.MESSAGE);
        }

        logError(args) {
            this._addLog('error', args.MESSAGE);
        }

        logDebug(args) {
            this._addLog('debug', args.MESSAGE);
        }

        executeAndLog(args, util) {
            const blockInfo = this._analyzeBlockExecution(util);
            
            if (blockInfo) {
                const message = `Executing block: ${blockInfo.opcode}`;
                const details = {
                    blockId: blockInfo.id,
                    target: blockInfo.target,
                    sprite: blockInfo.sprite,
                    inputs: blockInfo.inputs,
                    fields: blockInfo.fields,
                    timestamp: new Date().toISOString()
                };
                
                this._addLog('debug', message, details);
            } else {
                this._addLog('warning', 'Could not analyze block execution');
            }
        }

        openConsole() {
            this.consoleWindow.style.display = 'flex';
            this.isConsoleOpen = true;
        }

        closeConsole() {
            this.consoleWindow.style.display = 'none';
            this.isConsoleOpen = false;
        }

        clearLogs() {
            this.logs = [];
            this.logId = 0;
            const container = document.getElementById('logs-container');
            if (container) {
                container.innerHTML = '';
            }
            this._updateStatusBar();
            this._addLog('info', 'Logs cleared');
        }

        getLogCount() {
            return this.logs.length;
        }

        getLastLog() {
            return this.logs.length > 0 ? this.logs[this.logs.length - 1].message : 'No logs';
        }

        exportLogs() {
            const logData = this.logs.map(log => ({
                id: log.id,
                type: log.type,
                message: log.message,
                details: log.details,
                timestamp: log.timestamp.toISOString()
            }));

            const dataStr = JSON.stringify(logData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `scratch-logs-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this._addLog('info', `Exported ${this.logs.length} logs to file`);
        }
    }

    Scratch.extensions.register(new ProfessionalLoggerExtension());

})(window.Scratch);