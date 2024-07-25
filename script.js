let timerInterval;
let isRunning = false;
let remainingTime;
let remainingTimeInitial;
let totalElapsedTime = 0;

// Load saved state from local storage
document.addEventListener('DOMContentLoaded', () => {
    const savedState = JSON.parse(localStorage.getItem('timerState'));
    if (savedState) {
        remainingTime = savedState.remainingTime;
        totalElapsedTime = savedState.totalElapsedTime;
        isRunning = savedState.isRunning;
        if (isRunning) {
            remainingTimeInitial = savedState.remainingTimeInitial;
            toggleTimer();
        }
        updateDisplay();
        updateTotalTimeDisplay();
        savedState.logs.forEach(log => {
            addLogEntry(log.timestamp, log.elapsedTime);
        });
    }
});

document.querySelectorAll('.timeButton').forEach(button => {
    button.addEventListener('click', setTime);
});
document.getElementById('startStopButton').addEventListener('click', toggleTimer);
document.getElementById('resetButton').addEventListener('click', resetTimer);

function setTime(event) {
    if (isRunning) {
        alert('Please stop the current timer before starting a new one.');
        return;
    }
    remainingTime = parseInt(event.target.getAttribute('data-time')) * 60;
    updateDisplay();
    document.getElementById('startStopButton').textContent = 'Start';
    document.getElementById('startStopButton').classList.remove('stop');
    document.getElementById('startStopButton').classList.add('start');
    saveState();
}

function toggleTimer() {
    const button = document.getElementById('startStopButton');

    if (remainingTime === undefined) {
        alert('Please select a time duration.');
        return;
    }

    if (isRunning) {
        clearInterval(timerInterval);
        const elapsedThisSession = remainingTimeInitial - remainingTime;
        totalElapsedTime += elapsedThisSession;
        logElapsedTime(elapsedThisSession);
        updateTotalTimeDisplay();
        button.textContent = 'Start';
        button.classList.remove('stop');
        button.classList.add('start');
        saveState();
    } else {
        remainingTimeInitial = remainingTime;
        timerInterval = setInterval(() => {
            remainingTime--;
            updateDisplay();
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                alert('Time is up!');
                button.textContent = 'Start';
                button.classList.remove('stop');
                button.classList.add('start');
                isRunning = false;
            }
            saveState();
        }, 1000);
        button.textContent = 'Stop';
        button.classList.remove('start');
        button.classList.add('stop');
    }
    isRunning = !isRunning;
    saveState();
}

function updateDisplay() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById('timeDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function logElapsedTime(elapsedTime) {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const timestamp = new Date().toLocaleTimeString();
    addLogEntry(timestamp, `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
}

function addLogEntry(timestamp, elapsedTime) {
    const logTableBody = document.getElementById('timeLogTable').querySelector('tbody');
    const newRow = logTableBody.insertRow();

    const timestampCell = newRow.insertCell(0);
    const elapsedTimeCell = newRow.insertCell(1);

    timestampCell.textContent = timestamp;
    elapsedTimeCell.textContent = elapsedTime;
}

function updateTotalTimeDisplay() {
    const totalMinutes = Math.floor(totalElapsedTime / 60);
    const totalSeconds = totalElapsedTime % 60;
    document.getElementById('totalTimeDisplay').textContent = 
        `${totalMinutes.toString().padStart(2, '0')}:${totalSeconds.toString().padStart(2, '0')}`;
}

function saveState() {
    const logs = Array.from(document.getElementById('timeLogTable').querySelector('tbody').rows).map(row => ({
        timestamp: row.cells[0].textContent,
        elapsedTime: row.cells[1].textContent
    }));
    localStorage.setItem('timerState', JSON.stringify({
        remainingTime,
        remainingTimeInitial,
        totalElapsedTime,
        isRunning,
        logs
    }));
}

function resetTimer() {
    clearInterval(timerInterval);
    remainingTime = undefined;
    remainingTimeInitial = undefined;
    totalElapsedTime = 0;
    isRunning = false;
    document.getElementById('startStopButton').textContent = 'Start';
    document.getElementById('startStopButton').classList.remove('stop');
    document.getElementById('startStopButton').classList.add('start');
    document.getElementById('timeDisplay').textContent = '00:00';
    document.getElementById('totalTimeDisplay').textContent = '00:00';
    document.getElementById('timeLogTable').querySelector('tbody').innerHTML = '';
    localStorage.removeItem('timerState');
}
