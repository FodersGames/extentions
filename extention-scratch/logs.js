(function(Scratch) {
    'use strict';

    class LogsExtension {
        constructor() {
            this.logs = [];
            this.logCounts = {}; // Pour le regroupement des logs
            this.popup = null;
            this.popupContent = null;
            this.filterSelect = null;
            this.searchInput = null;
            this.theme = 'dark'; // Thème par défaut
            this.verbosityLevel = 'DEBUG'; // Niveau de verbosité par défaut
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
                        opcode: 'setVerbosity',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set verbosity to [LEVEL]',
                        arguments: {
                            LEVEL: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'verbosityLevels',
                                defaultValue: 'DEBUG'
                            }
                        }
                    },
                    {
                        opcode: 'setTheme',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set theme to [THEME]',
                        arguments: {
                            THEME: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'themes',
                                defaultValue: 'dark'
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
                    verbosityLevels: {
                        acceptReporters: true,
                        items: ['DEBUG', 'INFO', 'WARNING', 'ERROR']
                    },
                    themes: {
                        acceptReporters: true,
                        items: ['dark', 'light']
                    }
                }
            };
        }

        setVerbosity(args) {
            this.verbosityLevel = args.LEVEL;
            this.applyFilters(); // Rafraîchir l'affichage des logs
        }

        setTheme(args) {
            this.theme = args.THEME;
            this.applyTheme(); // Appliquer le nouveau thème
        }

        // Fonction pour appliquer le thème
        applyTheme() {
            const isDarkTheme = this.theme === 'dark';

            // Couleurs de base
            const backgroundColor = isDarkTheme ? '#282c34' : '#f0f0f0';
            const textColor = isDarkTheme ? '#abb2bf' : '#333';
            const borderColor = isDarkTheme ? '#44475a' : '#ccc';

            // Couleurs spécifiques
            const buttonBackgroundColor = isDarkTheme ? '#61afef' : '#5e81ac';
            const buttonTextColor = isDarkTheme ? '#fff' : '#fff'; // Toujours blanc pour la lisibilité
            const logBackgroundColor = isDarkTheme ? '#3e4451' : '#fff';
            const logBorderColor = isDarkTheme ? '#44475a' : '#ddd';

            if (this.popup) {
                // Appliquer les couleurs de base à la popup
                this.popup.style.backgroundColor = backgroundColor;
                this.popup.style.color = textColor;
                this.popup.style.border = `1px solid ${borderColor}`;

                // Appliquer les styles aux boutons
                const buttons = this.popup.querySelectorAll('button');
                buttons.forEach(button => {
                    button.style.backgroundColor = buttonBackgroundColor;
                    button.style.color = buttonTextColor;
                    button.style.border = 'none';
                });

                // Appliquer les styles aux entrées de log
                const logEntries = this.popupContent.querySelectorAll('.log-entry');
                logEntries.forEach(entry => {
                    entry.style.backgroundColor = logBackgroundColor;
                    entry.style.border = `1px solid ${logBorderColor}`;
                    entry.style.color = textColor;
                });
            }
            // Mettre à jour tous les logs existants
            this.applyFilters();
        }

        showLogs() {
            if (!this.popup) {
                this.createPopup();
                this.applyTheme(); // Appliquer le thème initial
            }
            this.popup.style.display = 'block';
            this.applyFilters();
        }

        createPopup() {
            // Création de la fenêtre popup (identique à avant, mais avec des classes CSS)
            this.popup = document.createElement('div');
            this.popup.style.position = 'fixed';
            this.popup.style.top = '50%';
            this.popup.style.left = '50%';
            this.popup.style.transform = 'translate(-50%, -50%)';
            this.popup.style.width = '80%';
            this.popup.style.maxWidth = '800px';
            this.popup.style.height = '70%';
            this.popup.style.borderRadius = '10px';
            this.popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
            this.popup.style.zIndex = '9999';
            this.popup.style.padding = '20px';
            this.popup.style.overflow = 'hidden';
            this.popup.style.display = 'none';
            this.popup.style.fontFamily = 'sans-serif';

            // Bouton de fermeture
            const closeButton = document.createElement('span');
            closeButton.innerHTML = '&times;';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.fontSize = '24px';
            closeButton.style.color = '#e06c75';
            closeButton.style.cursor = 'pointer';
            closeButton.addEventListener('click', () => {
                this.popup.style.display = 'none';
            });
            this.popup.appendChild(closeButton);

            // Barre de contrôles
            const controlsBar = document.createElement('div');
            controlsBar.style.marginBottom = '15px';
            controlsBar.style.display = 'flex';
            controlsBar.style.alignItems = 'center';
            controlsBar.style.gap = '10px';

            // Filtre de type de log
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

            // Barre de recherche
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

            // Boutons d'export
            const exportButtonStyle = `
                padding: 8px 16px;
                border: none;
                border-radius: 5px;
                color: #fff;
                cursor: pointer;
                transition: background-color 0.2s;
            `;

            const exportTxtButton = document.createElement('button');
            exportTxtButton.innerText = 'Export TXT';
            exportTxtButton.style.cssText = exportButtonStyle;
            exportTxtButton.style.backgroundColor = this.theme === 'dark' ? '#61afef' : '#5e81ac';
            exportTxtButton.addEventListener('mouseover', () => {
                exportTxtButton.style.backgroundColor = this.theme === 'dark' ? '#98c379' : '#88b04b';
            });
            exportTxtButton.addEventListener('mouseout', () => {
                exportTxtButton.style.backgroundColor = this.theme === 'dark' ? '#61afef' : '#5e81ac';
            });
            exportTxtButton.addEventListener('click', () => this.exportLogsTxt());
            controlsBar.appendChild(exportTxtButton);

            const exportJsonButton = document.createElement('button');
            exportJsonButton.innerText = 'Export JSON';
            exportJsonButton.style.cssText = exportButtonStyle;
            exportJsonButton.style.backgroundColor = this.theme === 'dark' ? '#61afef' : '#5e81ac';
            exportJsonButton.addEventListener('mouseover', () => {
                exportJsonButton.style.backgroundColor = this.theme === 'dark' ? '#98c379' : '#88b04b';
            });
            exportJsonButton.addEventListener('mouseout', () => {
                exportJsonButton.style.backgroundColor = this.theme === 'dark' ? '#61afef' : '#5e81ac';
            });
            exportJsonButton.addEventListener('click', () => this.exportLogsJson());
            controlsBar.appendChild(exportJsonButton);

            this.popup.appendChild(controlsBar);

            // Conteneur des logs
            this.popupContent = document.createElement('div');
            this.popupContent.style.overflowY = 'auto';
            this.popupContent.style.maxHeight = 'calc(100% - 100px)';
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

        addLog(type, title, description) {
            // Vérification du niveau de verbosité
            if (!this.isLogVisible(type)) return;

            const key = `${type}-${title}-${description}`; // Clé pour l'identification des logs similaires
            const timestamp = new Date().toISOString();

            if (this.logCounts[key]) {
                // Incrémenter le compteur si le log existe déjà
                this.logCounts[key].count++;
                this.logCounts[key].timestamp = timestamp; // Mettre à jour le timestamp
                this.updateLogEntry(key); // Mettre à jour l'entrée de log existante
            } else {
                // Créer une nouvelle entrée de log
                this.logCounts[key] = {
                    type: type,
                    title: title,
                    description: description,
                    timestamp: timestamp,
                    count: 1
                };
                this.createLogEntry(key);
            }
            this.applyFilters();
        }

        // Fonction pour déterminer si un log doit être affiché en fonction du niveau de verbosité
        isLogVisible(type) {
            const verbosityLevels = {
                'DEBUG': 1,
                'INFO': 2,
                'WARNING': 3,
                'ERROR': 4
            };
            const logTypeLevels = {
                'LOG': 1,
                'WARNING': 3,
                'ERROR': 4
            };
            return verbosityLevels[this.verbosityLevel] <= logTypeLevels[type];
        }

        // Fonction pour créer une entrée de log (affichée dans la popup)
        createLogEntry(key) {
            const logData = this.logCounts[key];
            const logEntry = document.createElement('div');
            logEntry.classList.add('log-entry'); // Ajoute une classe pour faciliter le styling
            logEntry.style.padding = '12px';
            logEntry.style.marginBottom = '12px';
            logEntry.style.borderRadius = '5px';
            logEntry.style.wordBreak = 'break-word';
            logEntry.dataset.type = logData.type;
            logEntry.dataset.key = key; // Stocker la clé

            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.cursor = logData.description && logData.description.trim() !== '' ? 'pointer' : 'default';

            const headerLeft = document.createElement('div');
            headerLeft.style.display = 'flex';
            headerLeft.style.alignItems = 'center';

            const logTypeSpan = document.createElement('span');
            logTypeSpan.style.fontWeight = 'bold';
            logTypeSpan.style.innerText = `[${logData.type}]`;
            headerLeft.appendChild(logTypeSpan);

            const logTime = document.createElement('span');
            logTime.style.fontSize = '12px';
            logTime.style.marginLeft = '10px';
            logTime.innerText = ` [${logData.timestamp}]`;
            headerLeft.appendChild(logTime);

            const logTitle = document.createElement('span');
            logTitle.style.marginLeft = '10px';
            logTitle.innerText = logData.title;
            headerLeft.appendChild(logTitle);

            headerDiv.appendChild(headerLeft);

            // Bouton de copie
            const copyButton = document.createElement('button');
            copyButton.innerText = 'Copy';
            copyButton.style.fontSize = '12px';
            copyButton.style.padding = '4px 8px';
            copyButton.style.border = 'none';
            copyButton.style.borderRadius = '4px';
            copyButton.style.cursor = 'pointer';
            copyButton.style.transition = 'background-color 0.2s';
            copyButton.addEventListener('mouseover', () => {
                copyButton.style.backgroundColor = this.theme === 'dark' ? '#6b7280' : '#88b04b';
            });
            copyButton.addEventListener('mouseout', () => {
                copyButton.style.backgroundColor = this.theme === 'dark' ? '#5c6370' : '#5e81ac';
            });
            copyButton.addEventListener('click', (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(logData.description).then(() => {
                    console.log('Description copied to clipboard');
                }).catch(err => {
                    console.error('Failed to copy description: ', err);
                });
            });
            headerDiv.appendChild(copyButton);

            logEntry.appendChild(headerDiv);

            if (logData.description && logData.description.trim() !== '') {
                const descriptionDiv = document.createElement('div');
                descriptionDiv.style.marginTop = '8px';
                descriptionDiv.style.fontSize = '14px';
                descriptionDiv.style.display = 'none';
                descriptionDiv.innerText = logData.description;

                logEntry.appendChild(descriptionDiv);

                headerDiv.addEventListener('click', () => {
                    descriptionDiv.style.display = descriptionDiv.style.display === 'none' ? 'block' : 'none';
                });
            }

            this.popupContent.appendChild(logEntry);
            this.popupContent.scrollTop = this.popupContent.scrollHeight;
            this.logs.push(logData); // Stocker les données du log
            this.applyTheme()
        }

        // Fonction pour mettre à jour une entrée de log existante
        updateLogEntry(key) {
            const logData = this.logCounts[key];
            const logEntry = this.popupContent.querySelector(`[data-key="${key}"]`); // Sélectionner l'élément par sa clé

            if (logEntry) {
                // Mettre à jour le timestamp
                const logTime = logEntry.querySelector('span:nth-child(2)');
                logTime.innerText = ` [${logData.timestamp}]`;

                // Mettre à jour le compteur (si tu souhaites l'afficher)
                // (exemple: tu pourrais ajouter un élément HTML pour afficher le compteur)
            }
        }

        getLogColor(type) {
            switch (type) {
                case 'WARNING':
                    return '#e2b443';
                case 'ERROR':
                    return '#e06c75';
                default:
                    return '#61afef';
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
            this.logCounts = {}; // Réinitialiser les compteurs
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
