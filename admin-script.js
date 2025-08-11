/*
 * Wood Badge Schedule Admin Portal - JavaScript
 * Version: 1.7.0
 * Last Updated: August 10, 2025
 * Updated admin portal to match terminal-style green theme
 */

// Data storage
let scheduleData = {
    day1: [],
    day2: [],
    day3: [],
    day4: [],
    day5: []
};

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Parse time from various formats
function parseTime(timeStr) {
    console.log(`[TIME DEBUG] Parsing time: "${timeStr}"`);
    timeStr = timeStr.trim();
    console.log(`[TIME DEBUG] After trim: "${timeStr}"`);
    console.log(`[TIME DEBUG] Character codes:`, Array.from(timeStr).map(c => c.charCodeAt(0)));
    
    // Handle 12-hour format (6:00 AM, 6:00 PM)
    const twelveHourMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (twelveHourMatch) {
        console.log(`[TIME DEBUG] Matched 12-hour format:`, twelveHourMatch);
        let hours = parseInt(twelveHourMatch[1]);
        const minutes = parseInt(twelveHourMatch[2]);
        const period = twelveHourMatch[3].toUpperCase();
        
        console.log(`[TIME DEBUG] Hours: ${hours}, Minutes: ${minutes}, Period: ${period}`);
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        console.log(`[TIME DEBUG] 12-hour result: "${result}"`);
        return result;
    }
    
    // Handle 24-hour format (18:00, 6:00)
    const twentyFourHourMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourHourMatch) {
        console.log(`[TIME DEBUG] Matched 24-hour format:`, twentyFourHourMatch);
        const hours = parseInt(twentyFourHourMatch[1]);
        const minutes = parseInt(twentyFourHourMatch[2]);
        const result = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        console.log(`[TIME DEBUG] 24-hour result: "${result}"`);
        return result;
    }
    
    console.log(`[TIME DEBUG] No match found for: "${timeStr}"`);
    console.log(`[TIME DEBUG] Testing regex patterns:`);
    console.log(`[TIME DEBUG] 12-hour test:`, /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(timeStr));
    console.log(`[TIME DEBUG] 24-hour test:`, /^(\d{1,2}):(\d{2})$/.test(timeStr));
    return null;
}

// Parse duration from various formats
function parseDuration(durationStr) {
    console.log(`[DURATION DEBUG] Parsing duration: "${durationStr}"`);
    durationStr = durationStr.trim();
    console.log(`[DURATION DEBUG] After trim: "${durationStr}"`);
    console.log(`[DURATION DEBUG] Character codes:`, Array.from(durationStr).map(c => c.charCodeAt(0)));
    
    // Handle H:MM format (1:30, 0:30)
    const hmmMatch = durationStr.match(/^(\d+):(\d{2})$/);
    if (hmmMatch) {
        console.log(`[DURATION DEBUG] Matched H:MM format:`, hmmMatch);
        const hours = parseInt(hmmMatch[1]);
        const minutes = parseInt(hmmMatch[2]);
        const result = hours * 60 + minutes;
        console.log(`[DURATION DEBUG] H:MM result: ${result} minutes`);
        return result;
    }
    
    // Handle minutes only (30, 60)
    const minutesMatch = durationStr.match(/^(\d+)$/);
    if (minutesMatch) {
        console.log(`[DURATION DEBUG] Matched minutes format:`, minutesMatch);
        const result = parseInt(minutesMatch[1]);
        console.log(`[DURATION DEBUG] Minutes result: ${result} minutes`);
        return result;
    }
    
    console.log(`[DURATION DEBUG] No match found for: "${durationStr}"`);
    console.log(`[DURATION DEBUG] Testing regex patterns:`);
    console.log(`[DURATION DEBUG] H:MM test:`, /^(\d+):(\d{2})$/.test(durationStr));
    console.log(`[DURATION DEBUG] Minutes test:`, /^(\d+)$/.test(durationStr));
    return null;
}

// Parse schedule from text input
function parseSchedule(day) {
    const textInput = document.getElementById(`text-input-${day}`);
    const text = textInput.value.trim();
    
    console.log(`[PARSE DEBUG] Starting parseSchedule for ${day}`);
    console.log(`[PARSE DEBUG] Raw input text (${text.length} characters):`, text);
    console.log(`[PARSE DEBUG] Text preview:`, text.substring(0, 200) + (text.length > 200 ? '...' : ''));
    
    if (!text) {
        console.log(`[PARSE DEBUG] No text provided, showing error`);
        showMessage(day, 'Please enter schedule data', 'error');
        return;
    }
    
    try {
        const schedule = [];
        let lines = []; // Declare lines variable in the main scope
        
        // Try CSV format first - but be smarter about detection
        // Check if it looks like CSV by seeing if we have time,duration,activity pattern
        const firstLine = text.split('\n')[0]?.trim();
        const hasCommas = text.includes(',');
        let looksLikeCSV = false;
        
        if (hasCommas && firstLine) {
            const parts = firstLine.split(',').map(part => part.trim());
            if (parts.length >= 3) {
                const time = parseTime(parts[0]);
                const duration = parseDuration(parts[1]);
                // If first line parses successfully as CSV, assume CSV format
                looksLikeCSV = time !== null && duration !== null;
                console.log(`[PARSE DEBUG] CSV detection: hasCommas=${hasCommas}, firstLineParts=${parts.length}, timeParses=${time !== null}, durationParses=${duration !== null}, looksLikeCSV=${looksLikeCSV}`);
            }
        }
        
        if (looksLikeCSV) {
            console.log(`[PARSE DEBUG] Detected CSV format (smart detection)`);
            lines = text.split('\n').filter(line => line.trim());
            console.log(`[PARSE DEBUG] CSV lines after filtering:`, lines);
            
            for (const line of lines) {
                const parts = line.split(',').map(part => part.trim());
                if (parts.length >= 3) {
                    const time = parseTime(parts[0]);
                    const duration = parseDuration(parts[1]);
                    const activity = parts[2];
                    
                    if (time && duration !== null && activity) {
                        schedule.push({ time, duration, activity });
                    }
                }
            }
        } else {
            console.log(`[PARSE DEBUG] No comma detected, trying three-line format`);
            
            // Try three-line format
            lines = text.split('\n').map(line => line.trim()).filter(line => line);
            console.log(`[PARSE DEBUG] Split and filtered lines (${lines.length} total):`, lines);
            
            // Check if we have groups of 3 lines
            if (lines.length % 3 !== 0) {
                console.log(`[PARSE DEBUG] Line count error: ${lines.length} is not divisible by 3`);
                throw new Error(`Expected groups of 3 lines (time, duration, activity), but got ${lines.length} lines. Please check your format.`);
            }
            
            console.log(`[PARSE DEBUG] Processing ${lines.length / 3} groups of 3 lines`);
            
            for (let i = 0; i < lines.length; i += 3) {
                const timeStr = lines[i];
                const durationStr = lines[i + 1];
                const activity = lines[i + 2];
                
                console.log(`[PARSE DEBUG] Group ${(i/3) + 1}:`);
                console.log(`  Time: "${timeStr}"`);
                console.log(`  Duration: "${durationStr}"`);
                console.log(`  Activity: "${activity}"`);
                
                const time = parseTime(timeStr);
                const duration = parseDuration(durationStr);
                
                console.log(`  Parsed time: ${time}`);
                console.log(`  Parsed duration: ${duration}`);
                
                if (!time) {
                    console.log(`[PARSE DEBUG] Time parsing failed for: "${timeStr}"`);
                    console.log(`[PARSE DEBUG] Continuing to next item instead of throwing error`);
                    continue; // Skip this item instead of throwing error
                }
                if (duration === null) {
                    console.log(`[PARSE DEBUG] Duration parsing failed for: "${durationStr}"`);
                    console.log(`[PARSE DEBUG] Continuing to next item instead of throwing error`);
                    continue; // Skip this item instead of throwing error
                }
                if (!activity) {
                    console.log(`[PARSE DEBUG] Activity is empty: "${activity}"`);
                    console.log(`[PARSE DEBUG] Continuing to next item instead of throwing error`);
                    continue; // Skip this item instead of throwing error
                }
                
                console.log(`  ✓ Successfully parsed item: ${time}, ${duration}min, "${activity}"`);
                schedule.push({ time, duration, activity });
            }
        }
        
        console.log(`[PARSE DEBUG] Final schedule array (${schedule.length} items):`, schedule);
        
        if (schedule.length === 0) {
            console.log(`[PARSE DEBUG] No schedule items were successfully parsed`);
            console.log(`[PARSE DEBUG] Total lines processed: ${lines.length}`);
            console.log(`[PARSE DEBUG] Expected groups: ${lines.length / 3}`);
            throw new Error(`No valid schedule items found. Processed ${lines.length / 3} groups but none were valid. Check the console for parsing details.`);
        }
        
        // Sort schedule by time
        schedule.sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        });
        
        console.log(`[PARSE DEBUG] Sorted schedule:`, schedule);
        
        scheduleData[day] = schedule;
        updatePreview(day);
        updateOverview();
        showMessage(day, `Successfully parsed ${schedule.length} activities`, 'success');
        
    } catch (error) {
        console.error(`[PARSE DEBUG] Error occurred:`, error);
        console.error(`[PARSE DEBUG] Error stack:`, error.stack);
        showMessage(day, `Error parsing schedule: ${error.message}`, 'error');
    }
}

// Handle file import
function handleFileImport(day, file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById(`text-input-${day}`).value = content;
        showMessage(day, `File "${file.name}" loaded. Click "Parse Schedule" to process.`, 'success');
    };
    reader.readAsText(file);
}

// Update schedule preview
function updatePreview(day) {
    const preview = document.getElementById(`preview-${day}`);
    const schedule = scheduleData[day];
    
    if (!schedule || schedule.length === 0) {
        preview.innerHTML = '<p>No schedule loaded. Use the import options above to add activities.</p>';
        return;
    }
    
    let html = '';
    schedule.forEach((item, index) => {
        html += `
            <div class="schedule-item">
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-duration">${item.duration}min</div>
                <div class="schedule-activity">${item.activity}</div>
            </div>
        `;
    });
    
    preview.innerHTML = html;
}

// Update overview
function updateOverview() {
    for (let i = 1; i <= 5; i++) {
        const day = `day${i}`;
        const schedule = scheduleData[day];
        const statusElement = document.getElementById(`status-${day}`);
        const countElement = document.getElementById(`count-${day}`);
        
        if (schedule && schedule.length > 0) {
            statusElement.className = 'status-indicator status-configured';
            countElement.textContent = `${schedule.length} activities`;
        } else {
            statusElement.className = 'status-indicator status-empty';
            countElement.textContent = '0 activities';
        }
    }
}

// Show message
function showMessage(day, message, type = 'info') {
    const messageDiv = document.getElementById(`message-${day}`);
    messageDiv.className = type;
    messageDiv.innerHTML = message;
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.innerHTML = '';
            messageDiv.className = '';
        }, 5000);
    }
}

// Clear schedule
function clearSchedule(day) {
    scheduleData[day] = [];
    document.getElementById(`text-input-${day}`).value = '';
    updatePreview(day);
    updateOverview();
    showMessage(day, 'Schedule cleared', 'success');
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all schedule data?')) {
        for (let i = 1; i <= 5; i++) {
            clearSchedule(`day${i}`);
        }
        showExportMessage('All schedule data cleared', 'success');
    }
}

// Load sample data
function loadSampleData() {
    const sampleSchedule = `6:00 AM
0:30
Staff Reveille
6:30 AM
0:30
Breakfast
7:00 AM
0:30
Participant Check In
7:30 AM
0:15
Team Formation and Orientation Walk
7:45 AM
1:00
Cub Scout Adventures and Tour
8:45 AM
0:15
Gilwell Field Pack Assembly
9:00 AM
0:15
10-min break
9:15 AM
0:10
Course Overview (Pack Session)
9:25 AM
0:30
Drive Vision, Mission, & Values (Pack Presentation)
9:55 AM
0:10
10-min break
10:05 AM
0:45
Know Thyself (Den Session)
10:50 AM
0:10
10-min Break
11:00 AM
1:00
The Ticket (Pack Session)
12:00 PM
0:10
10-min Break
12:10 PM
0:45
Opening Luncheon
12:55 PM
0:10
10-min Break
1:05 PM
1:25
Den Meetings
2:30 PM
0:10
10-min break
2:40 PM
1:10
Communicate Effectively (Den Session)
3:50 PM
0:10
Informal Ticket Time 1
4:00 PM
0:10
10-min Break
4:10 PM
0:45
Include & Optimize Diverse Talent (Pack Session)
4:55 PM
0:10
Informal Ticket Time 2
5:05 PM
0:00
Retire Colors (Den 1)
5:05 PM
0:10
10-min Break
5:15 PM
1:05
Blue & Gold Banquet & Pack Meeting
6:20 PM
0:15
15-min Break
6:35 PM
0:30
Getting to Know You Game (Patrol Session)
7:05 PM
0:10
10-min Break
7:15 PM
0:25
Leadership Connections (Patrol Session)
7:40 PM
0:10
10-min Break
7:50 PM
0:40
Model Campfire - Baden Powell Story
8:30 PM
0:30
Cracker Barrel
9:00 PM
2:00
Staff Meeting
11:00 PM
8:00
Lights Out`;
    
    document.getElementById('text-input-day1').value = sampleSchedule;
    parseSchedule('day1');
    switchTab('day1');
}

// Export functions
function showExportMessage(message, type = 'info') {
    const messageDiv = document.getElementById('export-messages');
    messageDiv.className = type;
    messageDiv.innerHTML = message;
    
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.innerHTML = '';
            messageDiv.className = '';
        }, 5000);
    }
}

function exportDay(day) {
    const schedule = scheduleData[day];
    
    if (!schedule || schedule.length === 0) {
        showExportMessage(`No schedule data for ${day.toUpperCase()}. Please configure the schedule first.`, 'error');
        return;
    }
    
    const jsSchedule = schedule.map(item => {
        // Escape special characters for JavaScript strings
        const escapedActivity = item.activity
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return `        { time: "${item.time}", duration: ${item.duration}, activity: "${escapedActivity}" }`;
    }).join(',\n');
    
    const originalTemplate = getOriginalTemplate();
    const dayNumber = day.replace('day', '');
    const generationTime = new Date().toLocaleString();
    
    const newHTML = originalTemplate
        .replace(/Wood Badge Time/g, `Wood Badge Day ${dayNumber} Time`)
        .replace(/const schedule = \[[\s\S]*?\];/, `const schedule = [\n${jsSchedule}\n    ];`)
        .replace(/SR\^2 Scout Camp, Texas/g, `Wood Badge Day ${dayNumber} - SR^2 Scout Camp, Texas`)
        .replace(/document\.getElementById\('generation-time'\)\.textContent = new Date\(\)\.toLocaleString\(\);/, 
                `document.getElementById('generation-time').textContent = "${generationTime}";`);
    
    const blob = new Blob([newHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wood-badge-day${dayNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showExportMessage(`Day ${dayNumber} schedule exported successfully!`, 'success');
}

function exportAllDays() {
    let exportedCount = 0;
    
    for (let i = 1; i <= 5; i++) {
        const day = `day${i}`;
        const schedule = scheduleData[day];
        
        if (schedule && schedule.length > 0) {
            exportDay(day);
            exportedCount++;
        }
    }
    
    if (exportedCount === 0) {
        showExportMessage('No schedules to export. Please configure at least one day first.', 'error');
    } else {
        showExportMessage(`Successfully exported ${exportedCount} day(s)!`, 'success');
    }
}

function getOriginalTemplate() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Cache Busting Meta Tags -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    
    <title>Official Wood Badge Time</title>
    <style>
        body { background-color: #000000; color: #00ff00; font-family: Arial, sans-serif; text-align: center; padding: 20px; }
        a { color: #00ff00; text-decoration: underline; }
        a:hover { color: #ffffff; }
        .time-display { font-size: 72px; margin: 30px 0; }
        .countdown-display { font-size: 48px; margin: 30px 0; color: #ffff00; }
        .activity-section { margin: 40px 0; padding: 20px; border: 2px solid #00ff00; border-radius: 10px; }
        .current-activity { font-size: 24px; color: #ff6600; margin: 20px 0; }
        .next-activity { font-size: 36px; color: #00ffff; margin: 20px 0; }
        .activity-time { font-size: 18px; color: #ffff00; }
        .credit { margin-top: 40px; font-size: 18px; }
        .section { margin: 40px 0; }
        .schedule-section { margin: 40px 0; padding: 20px; border: 2px solid #00ff00; border-radius: 10px; max-height: 400px; overflow-y: auto; }
        .schedule-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 4px 0; border-radius: 5px; font-size: 16px; }
        .schedule-item.completed { text-decoration: line-through; color: #666666; background-color: #111111; }
        .schedule-item.current { background-color: #ff6600; color: #000000; font-weight: bold; }
        .schedule-item.upcoming { color: #00ff00; }
        .schedule-time { min-width: 120px; text-align: left; }
        .schedule-activity { flex-grow: 1; text-align: left; margin-left: 20px; }
        .schedule-duration { min-width: 60px; text-align: right; margin-left: 10px; font-size: 14px; }
        .schedule-controls { margin: 20px 0; padding: 15px; border: 2px solid #ffff00; border-radius: 10px; background-color: #111111; }
        .control-buttons { display: flex; gap: 10px; margin: 10px 0; flex-wrap: wrap; justify-content: center; }
        .control-btn { background-color: #00ff00; color: #000000; border: none; padding: 8px 15px; border-radius: 5px; font-size: 14px; cursor: pointer; font-weight: bold; }
        .control-btn:hover { background-color: #ffffff; }
        .control-btn.active { background-color: #ff6600; color: #ffffff; }
        .status-display { text-align: center; margin: 10px 0; font-size: 18px; font-weight: bold; }
        .adjustment-counter { text-align: center; margin: 5px 0; font-size: 14px; color: #cccccc; }
        .ahead { color: #00ff00; }
        .behind { color: #ff6600; }
        .on-time { color: #ffff00; }
        .reset-btn { background-color: #ffff00; color: #000000; }
        .version-info { margin-top: 20px; padding: 15px; border: 1px solid #333; border-radius: 5px; background-color: #111; font-size: 14px; color: #999; }
    </style>
</head>
<body>
    <div class="section">
        <h1>Official Wood Badge Time is:</h1>
        <div class="time-display" id="current-time"></div>
    </div>
    
    <div class="activity-section">
        <h2 id="current-activity-header">Current Activity:</h2>
        <div class="current-activity" id="current-activity">Loading...</div>
        <div class="countdown-display" id="current-countdown"></div>
        
        <h3 id="next-activity-header">Next Activity:</h3>
        <div class="next-activity" id="next-activity">Loading...</div>
    </div>
    
    <div class="schedule-controls">
        <h3>Schedule Control</h3>
        <div class="status-display" id="schedule-status">Following Real Time</div>
        <div class="adjustment-counter" id="adjustment-counter">Adjustments: 0</div>
        <div class="control-buttons">
            <button class="control-btn active" id="auto-btn" onclick="setAutoMode()">Auto Track</button>
            <button class="control-btn" id="manual-btn" onclick="setManualMode()">Manual Control</button>
            <button class="control-btn reset-btn" onclick="resetToSchedule()">Reset to Schedule</button>
        </div>
        <div class="control-buttons" id="manual-controls" style="display: none;">
            <button class="control-btn" onclick="skipActivity()">Skip Current</button>
            <button class="control-btn" onclick="adjustTime(-5)">-5 min</button>
            <button class="control-btn" onclick="adjustTime(-1)">-1 min</button>
            <button class="control-btn" onclick="adjustTime(1)">+1 min</button>
            <button class="control-btn" onclick="adjustTime(5)">+5 min</button>
            <button class="control-btn" onclick="endCurrentActivity()">End Current</button>
        </div>
    </div>
    
    <div class="schedule-section">
        <h2>Full Schedule:</h2>
        <div id="full-schedule"></div>
    </div>
    
    <div class="credit">
        Time displayed for SR^2 Scout Camp, Texas (Central Time)<br>
        <small>Offline capable - no internet connection required</small>
    </div>
    
    <div class="version-info">
        <strong>Timer Version:</strong> 1.3.0<br>
        <strong>Generated:</strong> <span id="generation-time"></span><br>
        <strong>Admin Portal Version:</strong> 1.7.0
    </div>
    
    <script>
    let isManualMode = false;
    let scheduleOffset = 0;
    let manualCurrentActivity = -1;
    let adjustmentCount = 0;
    let hasAutoScrolled = false;
    
    const schedule = [
        { time: "06:00", duration: 30, activity: "Staff Reveille" }
    ];

    function parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return \`\${hours.toString().padStart(2, '0')}:\${mins.toString().padStart(2, '0')}\`;
    }

    function getCurrentActivity(currentMinutes) {
        if (isManualMode) {
            if (manualCurrentActivity >= 0 && manualCurrentActivity < schedule.length) {
                return { current: schedule[manualCurrentActivity], next: schedule[manualCurrentActivity + 1] || null, currentIndex: manualCurrentActivity };
            }
        }
        
        const adjustedMinutes = currentMinutes + scheduleOffset;
        
        for (let i = 0; i < schedule.length; i++) {
            const startMinutes = parseTime(schedule[i].time);
            const endMinutes = startMinutes + schedule[i].duration;
            
            if (adjustedMinutes >= startMinutes && adjustedMinutes < endMinutes) {
                return { current: schedule[i], next: schedule[i + 1] || null, currentIndex: i };
            }
        }
        
        for (let i = 0; i < schedule.length - 1; i++) {
            const currentEnd = parseTime(schedule[i].time) + schedule[i].duration;
            const nextStart = parseTime(schedule[i + 1].time);
            
            if (adjustedMinutes >= currentEnd && adjustedMinutes < nextStart) {
                return { current: { time: "", duration: 0, activity: "Free Time" }, next: schedule[i + 1], currentIndex: -1 };
            }
        }
        
        return { current: { time: "", duration: 0, activity: "Day Complete" }, next: null, currentIndex: -1 };
    }

    function setAutoMode() {
        isManualMode = false;
        hasAutoScrolled = false; // Allow auto-scroll when switching modes
        document.getElementById('auto-btn').classList.add('active');
        document.getElementById('manual-btn').classList.remove('active');
        document.getElementById('manual-controls').style.display = 'none';
        updateStatusDisplay();
    }

    function setManualMode() {
        isManualMode = true;
        hasAutoScrolled = false; // Allow auto-scroll when switching modes
        document.getElementById('auto-btn').classList.remove('active');
        document.getElementById('manual-btn').classList.add('active');
        document.getElementById('manual-controls').style.display = 'flex';
        
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const autoActivity = getCurrentActivityAuto(currentMinutes);
        manualCurrentActivity = autoActivity.currentIndex;
        updateStatusDisplay();
    }

    function getCurrentActivityAuto(currentMinutes) {
        for (let i = 0; i < schedule.length; i++) {
            const startMinutes = parseTime(schedule[i].time);
            const endMinutes = startMinutes + schedule[i].duration;
            
            if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                return { current: schedule[i], next: schedule[i + 1] || null, currentIndex: i };
            }
        }
        return { currentIndex: -1 };
    }

    function skipActivity() {
        if (isManualMode && manualCurrentActivity < schedule.length - 1) {
            manualCurrentActivity++;
            updateStatusDisplay();
        }
    }

    function endCurrentActivity() {
        if (isManualMode && manualCurrentActivity < schedule.length - 1) {
            manualCurrentActivity++;
            updateStatusDisplay();
        }
    }

    function adjustTime(minutes) {
        scheduleOffset += minutes;
        adjustmentCount++;
        updateStatusDisplay();
    }

    function resetToSchedule() {
        scheduleOffset = 0;
        adjustmentCount = 0;
        hasAutoScrolled = false; // Allow auto-scroll when resetting
        if (isManualMode) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const autoActivity = getCurrentActivityAuto(currentMinutes);
            manualCurrentActivity = autoActivity.currentIndex;
        }
        updateStatusDisplay();
    }

    function updateStatusDisplay() {
        const statusElement = document.getElementById('schedule-status');
        const counterElement = document.getElementById('adjustment-counter');
        
        counterElement.textContent = \`Adjustments: \${adjustmentCount}\`;
        
        if (isManualMode) {
            statusElement.textContent = 'Manual Control Active';
            statusElement.className = 'status-display behind';
        } else if (scheduleOffset === 0) {
            statusElement.textContent = 'Following Real Time - On Schedule';
            statusElement.className = 'status-display on-time';
        } else if (scheduleOffset > 0) {
            statusElement.textContent = \`Running \${scheduleOffset} min AHEAD of schedule\`;
            statusElement.className = 'status-display ahead';
        } else {
            statusElement.textContent = \`Running \${Math.abs(scheduleOffset)} min BEHIND schedule\`;
            statusElement.className = 'status-display behind';
        }
    }

    function updateTime() {
        const now = new Date();
        const militaryTime = now.toLocaleString("en-US", { timeZone: "America/Chicago", hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        document.getElementById('current-time').textContent = militaryTime;
        
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const currentSeconds = currentMinutes * 60 + now.getSeconds();
        const activityInfo = getCurrentActivity(currentMinutes);
        
        document.getElementById('current-activity').textContent = activityInfo.current.activity;
        
        if (activityInfo.current.time) {
            const startMinutes = parseTime(activityInfo.current.time);
            const endMinutes = startMinutes + activityInfo.current.duration;
            const timeRange = \`\${formatTime(startMinutes)} - \${formatTime(endMinutes)}\`;
            
            document.getElementById('current-activity-header').textContent = \`Current Activity: \${timeRange}\`;
            
            if (activityInfo.next) {
                const nextStartMinutes = parseTime(activityInfo.next.time);
                const adjustedNextStartMinutes = nextStartMinutes - scheduleOffset;
                const nextStartSeconds = adjustedNextStartMinutes * 60;
                const timeToNext = nextStartSeconds - currentSeconds;
                
                if (timeToNext > 0) {
                    const minutes = Math.floor(timeToNext / 60);
                    const seconds = timeToNext % 60;
                    document.getElementById('current-countdown').textContent = \`Next activity starts in: \${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
                } else {
                    document.getElementById('current-countdown').textContent = "Next activity should have started";
                }
            } else {
                document.getElementById('current-countdown').textContent = "No more activities scheduled";
            }
        } else {
            document.getElementById('current-activity-header').textContent = "Current Activity:";
            document.getElementById('current-countdown').textContent = "";
        }
        
        if (activityInfo.next) {
            const nextStartMinutes = parseTime(activityInfo.next.time);
            const nextEndMinutes = nextStartMinutes + activityInfo.next.duration;
            const nextTimeRange = \`\${formatTime(nextStartMinutes)} - \${formatTime(nextEndMinutes)}\`;
            
            document.getElementById('next-activity-header').textContent = \`Next Activity: \${nextTimeRange}\`;
            document.getElementById('next-activity').textContent = activityInfo.next.activity;
        } else {
            document.getElementById('next-activity-header').textContent = "Next Activity:";
            document.getElementById('next-activity').textContent = "No more activities scheduled";
        }
        
        updateScheduleDisplay(currentMinutes, activityInfo.currentIndex);
        updateStatusDisplay();
    }
    
    function updateScheduleDisplay(currentMinutes, currentIndex) {
        const scheduleContainer = document.getElementById('full-schedule');
        scheduleContainer.innerHTML = '';
        
        schedule.forEach((item, index) => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.id = \`schedule-item-\${index}\`;
            
            const startMinutes = parseTime(item.time);
            const endMinutes = startMinutes + item.duration;
            
            if (endMinutes <= currentMinutes) {
                scheduleItem.classList.add('completed');
            } else if (index === currentIndex) {
                scheduleItem.classList.add('current');
            } else {
                scheduleItem.classList.add('upcoming');
            }
            
            scheduleItem.innerHTML = \`
                <div class="schedule-time">\${formatTime(startMinutes)} - \${formatTime(endMinutes)}</div>
                <div class="schedule-activity">\${item.activity}</div>
                <div class="schedule-duration">\${item.duration}min</div>
            \`;
            
            scheduleContainer.appendChild(scheduleItem);
        });
        
        if (currentIndex >= 0) {
            const currentElement = document.getElementById(\`schedule-item-\${currentIndex}\`);
            if (currentElement && !hasAutoScrolled) {
                currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                hasAutoScrolled = true;
            }
        }
    }
    
    updateTime();
    setInterval(updateTime, 1000);
    
    // Set generation timestamp
    document.getElementById('generation-time').textContent = new Date().toLocaleString();
    </script>
</body>
</html>`;
}

// Initialize
updateOverview();
