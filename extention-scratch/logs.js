(function(Scratch) {
    'use strict';

    class LogsExtension {
        constructor() {
            this.logs = []; // Contiendra les logs sous forme d'objets { type, title, description, timestamp }
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
                        text: 'Show logs popup',
                    },
                    {
                        opcode: 'log',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Log [TITLE] [DESCRIPTION]',
                        arguments: {
                            TITLE: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Titre du log'
                            },
                            DESCRIPTION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Description du log'
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
                                defaultValue: 'Titre de l\'avertissement'
                            },
                            DESCRIPTION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Description de l\'avertissement'
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
                                defaultValue: 'Titre de l\'erreur'
                            },
                            DESCRIPTION: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Description de l\'erreur'
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
                        opcode: 'exportLogsTxt',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Export logs as TXT',
                    },
                    {
                        opcode: 'exportLogsJson',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Export logs as JSON',
                    }
                ]
            };
        }

        showLogs() {
            if (!this.popup) {
                // Création de la popup principale avec style "console"
                this.popup = document.createElement('div');
                this.popup.style.position = 'fixed';
                this.popup.style.top = '50%';
                this.popup.style.left = '50%';
                this.popup.style.transform = 'translate(-50%, -50%)';
                this.popup.style.width = '80%';
                this.popup.style.maxWidth = '800px';
                this.popup.style.height = '80%';
                this.popup.style.backgroundColor = '#1e1e1e';
                this.popup.style.color = '#dcdcdc';
                this.popup.style.border = '1px solid #444';
                this.popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
                this.popup.style.zIndex = '9999';
                this.popup.style.padding = '20px';
                this.popup.style.overflow = 'hidden';
                this.popup.style.display = 'none';

                // Bouton de fermeture
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
                this.popup.appendChild(closeButton);

                // Barre de contrôle : filtre, recherche et export
                const controlsBar = document.createElement('div');
                controlsBar.style.marginBottom = '10px';
                controlsBar.style.display = 'flex';
                controlsBar.style.alignItems = 'center';
                controlsBar.style.gap = '10px';

                // Menu déroulant pour filtrer par type
                this.filterSelect = document.createElement('select');
                const options = [
                    { value: 'all', text: 'Tous' },
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

                // Barre de recherche
                this.searchInput = document.createElement('input');
                this.searchInput.type = 'text';
                this.searchInput.placeholder = 'Rechercher...';
                this.searchInput.style.flex = '1';
                this.searchInput.addEventListener('input', () => this.applyFilters());

                // Boutons d'export
                const exportTxtButton = document.createElement('button');
                exportTxtButton.innerText = 'Exporter TXT';
                exportTxtButton.style.padding = '5px 10px';
                exportTxtButton.addEventListener('click', () => this.exportLogsTxt());

                const exportJsonButton = document.createElement('button');
                exportJsonButton.innerText = 'Exporter JSON';
                exportJsonButton.style.padding = '5px 10px';
                exportJsonButton.addEventListener('click', () => this.exportLogsJson());

                controlsBar.appendChild(this.filterSelect);
                controlsBar.appendChild(this.searchInput);
                controlsBar.appendChild(exportTxtButton);
                controlsBar.appendChild(exportJsonButton);
                this.popup.appendChild(controlsBar);

                // Conteneur des logs
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

        // Blocs log, warn et error modifiés pour recevoir TITLE et DESCRIPTION
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
            // Conteneur de l'entrée de log
            const logEntry = document.createElement('div');
            logEntry.style.padding = '8px';
            logEntry.style.marginBottom = '10px';
            logEntry.style.borderBottom = '1px solid #555';
            logEntry.dataset.type = type; // pour filtrer

            // En-tête du log
            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.cursor = description && description.trim() !== '' ? 'pointer' : 'default';

            // Partie gauche : type, timestamp et titre
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

            // Bouton de copie
            const copyButton = document.createElement('button');
            copyButton.innerText = 'Copier';
            copyButton.style.fontSize = '12px';
            copyButton.style.padding = '2px 5px';
            copyButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const textToCopy = `[${type}] ${title}\n${description}`;
                navigator.clipboard.writeText(textToCopy);
            });
            headerDiv.appendChild(copyButton);
            logEntry.appendChild(headerDiv);

            // Zone réductible pour la description (si renseignée)
            let contentDiv = null;
            if (description && description.trim() !== '') {
                contentDiv = document.createElement('div');
                contentDiv.style.marginTop = '5px';
                contentDiv.style.paddingLeft = '20px';
                contentDiv.style.display = 'none';
                contentDiv.innerText = description;
                logEntry.appendChild(contentDiv);

                // Toggle de la description au clic sur l'en-tête
                headerDiv.addEventListener('click', () => {
                    contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
                });
            }

            this.popupContent.appendChild(logEntry);
            // Sauvegarde dans le tableau pour export
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
                // Filtrage par type
                const matchesFilter = filterValue === 'all' || filterValue === logType;
                // Recherche dans l'ensemble du texte (titre et description)
                const textContent = logEntry.innerText.toLowerCase();
                const matchesSearch = textContent.indexOf(searchValue) !== -1;
                logEntry.style.display = matchesFilter && matchesSearch ? '' : 'none';
            });
        }
    }

    Scratch.extensions.register(new LogsExtension());

})(Scratch);
