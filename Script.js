// Data structure
let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
let timerInterval = null;
let timeLeft = 25 * 60;
let isWork = true;
let sessionsCompleted = 0;

// DOM elements
const subjectList = document.getElementById('subject-list');
const timerDisplay = document.getElementById('timer');
const statusText = document.getElementById('status');
const sessionsEl = document.getElementById('sessions');

// Render all subjects
function renderSubjects() {
  subjectList.innerHTML = '';
  subjects.forEach((subject, index) => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.innerHTML = `
      <div class="subject-header">
        <h3>${subject.name}</h3>
        <button class="remove-btn" onclick="removeSubject(${index})">Remove</button>
      </div>

      <div>Syllabus Progress: ${subject.progress || 0}%</div>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${subject.progress || 0}%"></div>
      </div>
      <input type="range" min="0" max="100" value="${subject.progress || 0}" 
             onchange="updateProgress(${index}, this.value)">

      <div class="assignments">
        <h4>Assignments</h4>
        <ul>
          ${subject.assignments.map((a, aIdx) => `
            <li>
              ${a.task}
              <select onchange="updateAssignmentStatus(${index}, ${aIdx}, this.value)">
                <option ${a.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option ${a.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </li>
          `).join('')}
        </ul>
        <input type="text" placeholder="Add new assignment" id="assign-input-${index}">
        <button onclick="addAssignment(${index})">Add</button>
      </div>
    `;
    subjectList.appendChild(card);
  });
  saveData();
}

// Add subject
function addSubject() {
  const input = document.getElementById('new-subject');
  if (!input.value.trim()) return;
  subjects.push({
    name: input.value.trim(),
    progress: 0,
    assignments: []
  });
  input.value = '';
  renderSubjects();
}

// Remove subject
function removeSubject(index) {
  if (confirm('Remove this subject?')) {
    subjects.splice(index, 1);
    renderSubjects();
  }
}

// Update progress
function updateProgress(index, value) {
  subjects[index].progress = Number(value);
  renderSubjects();
}

// Add assignment
function addAssignment(index) {
  const input = document.getElementById(`assign-input-${index}`);
  if (!input.value.trim()) return;
  subjects[index].assignments.push({
    task: input.value.trim(),
    status: 'Not Started'
  });
  input.value = '';
  renderSubjects();
}

// Update assignment status
function updateAssignmentStatus(sIdx, aIdx, status) {
  subjects[sIdx].assignments[aIdx].status = status;
  saveData();
}

// Save to localStorage
function saveData() {
  localStorage.setItem('subjects', JSON.stringify(subjects));
}

// ────────────────────────────────────────────────
// Pomodoro Timer Logic
// ────────────────────────────────────────────────

function updateTimerDisplay() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timerDisplay.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      alert(isWork ? "Great job! Take a short break." : "Back to work!");
      sessionsCompleted += isWork ? 1 : 0;
      sessionsEl.textContent = sessionsCompleted;

      // Switch mode
      isWork = !isWork;
      timeLeft = isWork ? 25 * 60 : 5 * 60;
      statusText.textContent = isWork ? "Work time – 25 minutes focus" : "Short break – 5 minutes";
      updateTimerDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isWork = true;
  timeLeft = 25 * 60;
  updateTimerDisplay();
  statusText.textContent = "Work time – 25 minutes focus";
}

// Initial render
renderSubjects();
updateTimerDisplay();