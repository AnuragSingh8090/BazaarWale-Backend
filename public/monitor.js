let logs = [];
let filteredLogs = [];
let endpointCounts = {};
let serverStartTime = 0;
let expandedLogs = new Set();
let currentFilters = {
    status: 'all',
    method: 'all'
};

// Will be updated when server data is fetched
document.getElementById('serverStartTime').textContent = 'Loading...';

// Detect server URL and port
const serverUrl = window.location.host;
document.getElementById('serverUrl').textContent = serverUrl;

function copyServerUrl() {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
        const copyIcon = document.querySelector('.copy-icon');
        const originalStroke = copyIcon.getAttribute('stroke');
        copyIcon.setAttribute('stroke', 'var(--success-color)');
        setTimeout(() => {
            copyIcon.setAttribute('stroke', originalStroke);
        }, 1000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function copyJson(jsonString, button) {
    try {
        const jsonObj = JSON.parse(jsonString);
        const formattedJson = JSON.stringify(jsonObj, null, 2);
        
        navigator.clipboard.writeText(formattedJson).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span>';
            button.style.background = 'var(--success-color)';
            button.style.color = '#000';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
                button.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy JSON:', err);
            alert('Failed to copy to clipboard');
        });
    } catch (error) {
        console.error('Invalid JSON:', error);
        alert('Invalid JSON data');
    }
}

function copyCookies(cookiesString, button) {
    try {
        const cookies = JSON.parse(cookiesString);
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
        const cookieObject = {};
        
        cookieArray.forEach((cookie, index) => {
            const parts = cookie.split(';').map(p => p.trim());
            const [nameValue, ...attributes] = parts;
            const [name, value] = nameValue.split('=');
            
            const cookieData = {
                value: value || '',
                attributes: {}
            };
            
            attributes.forEach(attr => {
                const [key, val] = attr.split('=');
                cookieData.attributes[key.trim()] = val ? val.trim() : true;
            });
            
            cookieObject[name || `cookie_${index}`] = cookieData;
        });
        
        const formattedCookies = JSON.stringify(cookieObject, null, 2);
        
        navigator.clipboard.writeText(formattedCookies).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span>';
            button.style.background = 'var(--success-color)';
            button.style.color = '#000';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
                button.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy cookies:', err);
            alert('Failed to copy to clipboard');
        });
    } catch (error) {
        console.error('Invalid cookies data:', error);
        alert('Invalid cookies data');
    }
}

function formatCookies(cookies) {
    if (!cookies) return '';
    
    // Convert cookie array to a structured object
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    const cookieObject = {};
    
    cookieArray.forEach((cookie, index) => {
        const parts = cookie.split(';').map(p => p.trim());
        const [nameValue, ...attributes] = parts;
        const [name, value] = nameValue.split('=');
        
        const cookieData = {
            value: value || '',
            attributes: {}
        };
        
        attributes.forEach(attr => {
            const [key, val] = attr.split('=');
            cookieData.attributes[key.trim()] = val ? val.trim() : true;
        });
        
        cookieObject[name || `cookie_${index}`] = cookieData;
    });
    
    return `<pre class="json-body">${escapeHtml(JSON.stringify(cookieObject, null, 2))}</pre>`;
}

async function stopServer() {
    if (confirm('Are you sure you want to stop the server? This will close all connections.')) {
        try {
            await fetch('/api/server/stop', { method: 'POST' });
            document.getElementById('stopBtn').style.display = 'none';
            document.getElementById('startBtn').style.display = 'flex';
            alert('Server stop signal sent. The server will shut down shortly.');
        } catch (error) {
            console.error('Error stopping server:', error);
            alert('Failed to stop server');
        }
    }
}

async function startServer() {
    alert('Server restart must be done manually from the terminal.\nRun: npm start or node server.js');
}

function applyFilters() {
    currentFilters.status = document.getElementById('statusFilter').value;
    currentFilters.method = document.getElementById('methodFilter').value;
    
    filteredLogs = logs.filter(log => {
        let passStatus = true;
        let passMethod = true;
        
        // Handle status filtering
        if (currentFilters.status === 'success') {
            passStatus = log.statusCode >= 200 && log.statusCode < 300;
        } else if (currentFilters.status === 'failed') {
            passStatus = log.statusCode >= 400;
        } else if (currentFilters.status !== 'all') {
            // Specific status code
            passStatus = log.statusCode === parseInt(currentFilters.status);
        }
        
        if (currentFilters.method !== 'all') {
            passMethod = log.method === currentFilters.method;
        }
        
        return passStatus && passMethod;
    });
    
    renderLogs();
    updateStats();
}

async function fetchLogs() {
    try {
        const response = await fetch('/api/logs');
        const data = await response.json();

        if (data.logs && data.logs.length > 0) {
            logs = data.logs;
            applyFilters();
        }

        if (data.serverStartTime) {
            serverStartTime = data.serverStartTime;
            document.getElementById('serverStartTime').textContent = new Date(serverStartTime).toLocaleString();
        }
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}

function renderLogs() {
    const terminalBody = document.getElementById('terminalBody');

    const logsToDisplay = filteredLogs.length > 0 || currentFilters.status !== 'all' || currentFilters.method !== 'all' ? filteredLogs : logs;

    if (logsToDisplay.length === 0) {
        terminalBody.innerHTML = `
            <div style="color: var(--text-muted); text-align: center; padding: 20px;">
                ${logs.length === 0 ? 'Waiting for requests...' : 'No logs match the current filters'}<span class="blink">█</span>
            </div>
        `;
        return;
    }

    const recentLogs = logsToDisplay.slice(-50).reverse();

    terminalBody.innerHTML = recentLogs.map((log, index) => {
        const statusClass = getStatusClass(log.statusCode);
        const methodClass = `method-${log.method}`;
        
        // Create unique ID for this log entry
        const logId = `${log.timestamp}-${log.method}-${log.url}`.replace(/[^a-zA-Z0-9-]/g, '_');
        const isExpanded = expandedLogs.has(logId);
        
        // Determine border color based on status
        let borderColorClass = 'border-default';
        if (log.statusCode >= 200 && log.statusCode < 300) {
            borderColorClass = 'border-success';
        } else if (log.statusCode >= 400) {
            borderColorClass = 'border-error';
        }

        let statusIcon = '✓';
        let iconClass = 'success';
        if (log.statusCode >= 400 && log.statusCode < 500) {
            statusIcon = '!';
            iconClass = 'warning';
        } else if (log.statusCode >= 500) {
            statusIcon = '✗';
            iconClass = 'error';
        }

        let requestHeadersJson = {};
        if (log.request && log.request.headers) {
            Object.entries(log.request.headers).forEach(([key, value]) => {
                if (value !== undefined) {
                    requestHeadersJson[key] = value;
                }
            });
        }

        const requestBody = log.request && log.request.body;
        const responseBody = log.response && log.response.body;

        return `
            <div class="log-entry ${isExpanded ? 'expanded' : ''} ${borderColorClass}" data-log-id="${logId}">
                <div class="log-header">
                    <div class="status-icon ${iconClass}">${statusIcon}</div>
                    <div class="log-summary">
                        <span class="log-timestamp">${log.timestamp}</span>
                        <span class="log-method ${methodClass}">${log.method}</span>
                        <span class="log-url">${escapeHtml(log.url)}</span>
                        <span class="status-code ${statusClass}">${log.statusCode}</span>
                        <span class="response-time">${log.responseTime}ms</span>
                    </div>
                    <div class="expand-icon">▼</div>
                </div>
                <div class="log-details">
                    <div class="detail-section">
                        <div class="detail-title">📊 Request Info</div>
                        <div class="detail-row">
                            <span class="detail-label">IP Address:</span>
                            <span class="detail-value">${escapeHtml(log.ip)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Response Time:</span>
                            <span class="response-time">${log.responseTime}ms</span>
                        </div>
                    </div>
                    
                    ${Object.keys(requestHeadersJson).length > 0 ? `
                        <div class="detail-section">
                            <div class="detail-title-row">
                                <div class="detail-title">📤 Request Headers</div>
                                <button class="copy-json-btn" onclick="copyJson(${escapeHtml(JSON.stringify(requestHeadersJson))}, this)" title="Copy JSON">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    <span>Copy</span>
                                </button>
                            </div>
                            <div class="json-body">${formatJson(requestHeadersJson)}</div>
                        </div>
                    ` : ''}
                    
                    ${requestBody ? `
                        <div class="detail-section">
                            <div class="detail-title-row">
                                <div class="detail-title">📝 Request Body</div>
                                <button class="copy-json-btn" onclick="copyJson(${escapeHtml(JSON.stringify(requestBody))}, this)" title="Copy JSON">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    <span>Copy</span>
                                </button>
                            </div>
                            <div class="json-body">${formatJson(requestBody)}</div>
                        </div>
                    ` : ''}
                    
                    ${responseBody ? `
                        <div class="detail-section">
                            <div class="detail-title-row">
                                <div class="detail-title">📥 Response Body</div>
                                <button class="copy-json-btn" onclick="copyJson(${escapeHtml(JSON.stringify(responseBody))}, this)" title="Copy JSON">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    <span>Copy</span>
                                </button>
                            </div>
                            <div class="json-body">${formatJson(responseBody)}</div>
                        </div>
                    ` : ''}
                    
                    ${log.response && log.response.cookies ? `
                        <div class="detail-section">
                            <div class="detail-title-row">
                                <div class="detail-title">🍪 Response Cookies</div>
                                <button class="copy-json-btn" onclick="copyCookies(${escapeHtml(JSON.stringify(log.response.cookies))}, this)" title="Copy Cookies">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    <span>Copy</span>
                                </button>
                            </div>
                            ${formatCookies(log.response.cookies)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    attachLogEventListeners();
}

function attachLogEventListeners() {
    const logHeaders = document.querySelectorAll('.log-header');
    logHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const logEntry = this.closest('.log-entry');
            const logId = logEntry.getAttribute('data-log-id');
            
            logEntry.classList.toggle('expanded');
            
            // Track expanded state
            if (logEntry.classList.contains('expanded')) {
                expandedLogs.add(logId);
            } else {
                expandedLogs.delete(logId);
            }
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatJson(obj) {
    try {
        const jsonString = JSON.stringify(obj, null, 2);
        const maxLength = 10000;
        
        if (jsonString.length > maxLength) {
            return escapeHtml(jsonString.substring(0, maxLength) + '\n\n... [Content truncated - too large to display]');
        }
        
        return escapeHtml(jsonString);
    } catch (error) {
        return escapeHtml('[Error formatting JSON: ' + error.message + ']');
    }
}

function updateStats() {
    const successCount = logs.filter(log => log.statusCode >= 200 && log.statusCode < 300).length;
    const failedCount = logs.filter(log => log.statusCode >= 400).length;
    
    document.getElementById('requestCount').textContent = logs.length;
    document.getElementById('successCount').textContent = successCount;
    document.getElementById('failedCount').textContent = failedCount;

    if (logs.length > 0) {
        const totalTime = logs.reduce((sum, log) => sum + log.responseTime, 0);
        const avgTime = Math.round(totalTime / logs.length);
        document.getElementById('avgResponseTime').textContent = avgTime;

        updateChart();
        updateEndpoints();
    }
}

function updateChart() {
    const chartContainer = document.getElementById('chartContainer');
    const recentTimes = logs.slice(-20).map(log => log.responseTime);
    const maxTime = Math.max(...recentTimes, 100);

    chartContainer.innerHTML = recentTimes.map((time, index) => {
        const height = (time / maxTime) * 100;
        const left = (index / 20) * 100;
        return `
            <div class="chart-bar" 
                 style="left: ${left}%; height: ${height}%;" 
                 title="${time}ms"></div>
        `;
    }).join('');
}

function updateEndpoints() {
    endpointCounts = {};
    logs.forEach(log => {
        const endpoint = log.url.split('?')[0];
        endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
    });

    const sortedEndpoints = Object.entries(endpointCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const endpointList = document.getElementById('endpointList');

    if (sortedEndpoints.length === 0) {
        endpointList.innerHTML = `
            <div style="color: var(--text-muted); text-align: center; padding: 10px; font-size: 0.8rem;">
                No data yet
            </div>
        `;
        return;
    }

    endpointList.innerHTML = sortedEndpoints.map(([path, count]) => `
        <div class="endpoint-item">
            <span class="endpoint-path">${path}</span>
            <span class="endpoint-count">${count}</span>
        </div>
    `).join('');
}

function updateUptime() {
    // Don't calculate uptime until we have the server start time
    if (!serverStartTime || serverStartTime === 0) {
        document.getElementById('uptime').textContent = 'Loading...';
        return;
    }
    
    const uptime = Date.now() - serverStartTime;
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let uptimeStr = '';
    if (days > 0) uptimeStr += `${days}d `;
    if (hours % 24 > 0) uptimeStr += `${hours % 24}h `;
    if (minutes % 60 > 0) uptimeStr += `${minutes % 60}m `;
    uptimeStr += `${seconds % 60}s`;

    document.getElementById('uptime').textContent = uptimeStr.trim();
}

function getStatusClass(code) {
    if (code >= 200 && code < 300) return 'status-2xx';
    if (code >= 300 && code < 400) return 'status-3xx';
    if (code >= 400 && code < 500) return 'status-4xx';
    if (code >= 500) return 'status-5xx';
    return '';
}

async function stopServer() {
    if (!confirm('Are you sure you want to stop the server? You will need to restart it manually from the terminal.')) return;
    
    // 1. Update UI IMMEDIATELY
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    const stopBtn = document.getElementById('stop-btn');
    const serverUrl = document.querySelector('.server-url span');
    
    if (statusDot) {
        statusDot.style.background = '#9ca3af'; // Gray color for offline
        statusDot.style.boxShadow = 'none';
    }
    if (statusText) statusText.textContent = 'OFFLINE'; // Uppercase
    if (stopBtn) stopBtn.style.display = 'none';
    if (serverUrl) serverUrl.style.color = '#9ca3af';

    // 2. Stop all intervals IMMEDIATELY
    if (typeof fetchInterval !== 'undefined') clearInterval(fetchInterval);
    if (typeof uptimeInterval !== 'undefined') clearInterval(uptimeInterval);
    
    // 3. Wait 500ms before actually killing the server
    setTimeout(async () => {
        try {
            // We set a short timeout because if the server dies, the request might hang or fail
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            await fetch('/api/server/stop', { 
                method: 'POST',
                signal: controller.signal 
            });
            clearTimeout(timeoutId);
        } catch (error) {
            // Expected error as server shuts down
            console.log('Server connection lost (Expected on stop):', error);
        }
        
        // Show success alert
        alert('Server stopped successfully. Please restart manually from terminal.');
    }, 500);
}

async function clearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
        try {
            await fetch('/api/logs/clear', { method: 'POST' });
            
            // Clear all data
            logs = [];
            filteredLogs = [];
            endpointCounts = {};
            expandedLogs.clear();
            
            // Reset filters
            currentFilters = { status: 'all', method: 'all' };
            document.getElementById('statusFilter').value = 'all';
            document.getElementById('methodFilter').value = 'all';
            
            // Update all UI components
            renderLogs();
            updateStats();
            updateEndpoints();
        } catch (error) {
            console.error('Error clearing logs:', error);
        }
    }
}

async function refreshLogs() {
    expandedLogs.clear();
    currentFilters = { status: 'all', method: 'all' };
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('methodFilter').value = 'all';
    await fetchLogs();
}

const fetchInterval = setInterval(fetchLogs, 2000);
const uptimeInterval = setInterval(updateUptime, 1000);

fetchLogs();
updateUptime();
