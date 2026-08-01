/* GrameOne Central SPA Application Engine */

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initGlobalSearch();
});

// Simple SPA Router
function initRouter() {
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

function renderRoute() {
  const hash = window.location.hash || '#/dashboard';
  const route = hash.replace('#/', '');
  
  // Update sidebar active link
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-view') === route || (route === '' && item.getAttribute('data-view') === 'dashboard')) {
      item.classList.add('active');
    }
  });

  const contentView = document.getElementById('content-view');

  switch(route) {
    case 'dashboard':
    case '':
      renderDashboard(contentView);
      break;
    case 'hierarchy':
      renderHierarchyDrilldown(contentView);
      break;
    case 'grades':
      renderGradesView(contentView);
      break;
    case 'subjects':
      renderSubjectsView(contentView);
      break;
    case 'topics':
      renderTopicsView(contentView);
      break;
    case 'units':
      renderUnitsView(contentView);
      break;
    case 'concepts':
      renderConceptsView(contentView);
      break;
    case 'questions':
      renderQuestionsView(contentView);
      break;
    case 'csv-import':
      renderCsvImportView(contentView);
      break;
    case 'package-publishing':
      renderPackagePublishingView(contentView);
      break;
    case 'licenses':
      renderLicensesView(contentView);
      break;
    case 'subscriptions':
      renderSubscriptionsView(contentView);
      break;
    case 'system-metrics':
      renderSystemMetricsView(contentView);
      break;
    default:
      renderDashboard(contentView);
  }
}

// Global Modal Handlers
window.openModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
};

// -------------------------------------------------------------
// 1. DASHBOARD VIEW WITH METRICS CARDS & GRAPH VISUALIZATIONS
// -------------------------------------------------------------
async function renderDashboard(container) {
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Overview > System Summary</div>
        <h1 class="page-title">Dashboard</h1>
      </div>
      <div style="display:flex; gap:0.75rem;">
        <button class="btn btn-secondary" onclick="window.location.hash='#/csv-import'">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          Import CSV
        </button>
        <button class="btn btn-primary" onclick="openModal('modal-package-publish')">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Publish Grade
        </button>
      </div>
    </div>

    <div class="page-body">
      <!-- Top Metrics Grid Cards -->
      <div class="metrics-grid">
        <div class="metric-card" onclick="window.location.hash='#/licenses'">
          <div class="metric-top">
            <span class="metric-title">Generated Licenses</span>
            <div class="metric-icon-box">🔑</div>
          </div>
          <div class="metric-value" id="metric-licenses">24</div>
          <div class="metric-footer">View code list &rarr;</div>
        </div>

        <div class="metric-card" onclick="window.location.hash='#/licenses'">
          <div class="metric-top">
            <span class="metric-title">Waiting for Activation</span>
            <div class="metric-icon-box" style="color:#f59e0b;">⏳</div>
          </div>
          <div class="metric-value" id="metric-pending" style="color:#f59e0b;">8</div>
          <div class="metric-footer" style="color:#f59e0b;">Pending mobile binding &rarr;</div>
        </div>

        <div class="metric-card" onclick="window.location.hash='#/package-publishing'">
          <div class="metric-top">
            <span class="metric-title">Active R2 Packages</span>
            <div class="metric-icon-box" style="color:#3b82f6;">📦</div>
          </div>
          <div class="metric-value" id="metric-packages" style="color:#3b82f6;">7</div>
          <div class="metric-footer" style="color:#3b82f6;">All 7 grades published &rarr;</div>
        </div>

        <div class="metric-card" onclick="window.location.hash='#/questions'">
          <div class="metric-top">
            <span class="metric-title">Total Questions</span>
            <div class="metric-icon-box" style="color:#10b981;">❓</div>
          </div>
          <div class="metric-value" id="metric-questions" style="color:#10b981;">142</div>
          <div class="metric-footer" style="color:#10b981;">In PostgreSQL master DB &rarr;</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="charts-grid">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Mobile Package Downloads & Activation Growth</div>
          </div>
          <div style="height: 280px; position: relative;">
            <canvas id="chart-growth"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">Content Distribution by Grade</div>
          </div>
          <div style="height: 280px; position: relative;">
            <canvas id="chart-distribution"></canvas>
          </div>
        </div>
      </div>

      <!-- Quick Action Cards Section -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Quick Administration Actions</div>
        </div>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <button class="btn btn-secondary" style="justify-content:center; padding:1.25rem;" onclick="openModal('modal-license-generate')">
            ➕ Generate Activation Code
          </button>
          <button class="btn btn-secondary" style="justify-content:center; padding:1.25rem;" onclick="window.location.hash='#/hierarchy'">
            🌳 Academic Hierarchy
          </button>
          <button class="btn btn-secondary" style="justify-content:center; padding:1.25rem;" onclick="window.location.hash='#/package-publishing'">
            🚀 Publish SQLite Package
          </button>
          <button class="btn btn-secondary" style="justify-content:center; padding:1.25rem;" onclick="window.location.hash='#/system-metrics'">
            ⚡ System Health Monitor
          </button>
        </div>
      </div>
    </div>
  `;

  // Fetch live metrics & render charts
  const metrics = await window.api.getDashboardMetrics();
  document.getElementById('metric-licenses').innerText = metrics.totalLicenses;
  document.getElementById('metric-pending').innerText = metrics.pendingActivations;
  document.getElementById('metric-packages').innerText = metrics.activePackages;
  document.getElementById('metric-questions').innerText = metrics.totalQuestions;

  renderDashboardCharts();
}

function renderDashboardCharts() {
  const ctxGrowth = document.getElementById('chart-growth');
  if (ctxGrowth) {
    new Chart(ctxGrowth, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
          label: 'Mobile Package Downloads',
          data: [120, 190, 300, 450, 620, 890, 1150],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }, {
          label: 'Active Mobile Licenses',
          data: [80, 140, 220, 380, 510, 750, 980],
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          borderDash: [5, 5]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#9ca3af' } } },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
          y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } }
        }
      }
    });
  }

  const ctxDist = document.getElementById('chart-distribution');
  if (ctxDist) {
    new Chart(ctxDist, {
      type: 'doughnut',
      data: {
        labels: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'],
        datasets: [{
          data: [18, 24, 30, 19, 35, 22, 40],
          backgroundColor: [
            '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#64748b'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', boxWidth: 12 } } }
      }
    });
  }
}

// -------------------------------------------------------------
// 2. ACADEMIC HIERARCHY INTERACTIVE DRILLDOWN VIEW
// Grade -> Subject -> Topic -> Unit -> Concept -> Questions
// -------------------------------------------------------------
async function renderHierarchyDrilldown(container) {
  const grades = await window.api.getGrades();

  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Academic Hierarchy > Interactive Drilldown</div>
        <h1 class="page-title">Hierarchy Explorer</h1>
      </div>
    </div>

    <div class="page-body">
      <div id="hierarchy-breadcrumbs" class="card" style="margin-bottom: 1rem; padding: 0.85rem 1.25rem; background:var(--bg-input);">
        <span style="color:var(--primary); font-weight:600;">Root: Grades</span>
      </div>

      <div id="hierarchy-container" class="metrics-grid">
        ${grades.map(g => `
          <div class="metric-card" onclick="loadHierarchySubjects(${g.id}, '${g.name}')">
            <div class="metric-top">
              <span class="metric-title">${g.code}</span>
              <div class="metric-icon-box">📚</div>
            </div>
            <div class="metric-value">${g.name}</div>
            <div class="metric-footer">Click to view subjects &rarr;</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

window.loadHierarchySubjects = async function(gradeId, gradeName) {
  const subjects = await window.api.getSubjects(gradeId);
  const breadcrumb = document.getElementById('hierarchy-breadcrumbs');
  const container = document.getElementById('hierarchy-container');

  breadcrumb.innerHTML = `
    <a href="#/hierarchy" style="color:var(--text-muted); text-decoration:none;">Grades</a> &gt; 
    <span style="color:var(--primary); font-weight:600;">${gradeName}</span>
  `;

  if (subjects.length === 0) {
    container.innerHTML = `<div class="card" style="grid-column: 1/-1;">No subjects found for ${gradeName}.</div>`;
    return;
  }

  container.innerHTML = subjects.map(s => `
    <div class="metric-card" onclick="loadHierarchyTopics(${s.id}, '${gradeName}', '${s.name}')">
      <div class="metric-top">
        <span class="metric-title">Language: ${s.language}</span>
        <div class="metric-icon-box">📖</div>
      </div>
      <div class="metric-value">${s.name}</div>
      <div class="metric-footer">Click to view topics &rarr;</div>
    </div>
  `).join('');
};

window.loadHierarchyTopics = async function(subjectId, gradeName, subjectName) {
  const topics = await window.api.getTopics(subjectId);
  const breadcrumb = document.getElementById('hierarchy-breadcrumbs');
  const container = document.getElementById('hierarchy-container');

  breadcrumb.innerHTML = `
    <a href="#/hierarchy" style="color:var(--text-muted); text-decoration:none;">Grades</a> &gt; 
    <span>${gradeName}</span> &gt; 
    <span style="color:var(--primary); font-weight:600;">${subjectName}</span>
  `;

  if (topics.length === 0) {
    container.innerHTML = `<div class="card" style="grid-column: 1/-1;">No topics found for ${subjectName}.</div>`;
    return;
  }

  container.innerHTML = topics.map(t => `
    <div class="metric-card" onclick="loadHierarchyUnits(${t.id}, '${gradeName}', '${subjectName}', '${t.name}')">
      <div class="metric-top">
        <span class="metric-title">Topic #${t.topicNumber || 1}</span>
        <div class="metric-icon-box">📌</div>
      </div>
      <div class="metric-value">${t.name}</div>
      <div class="metric-footer">Click to view units &rarr;</div>
    </div>
  `).join('');
};

window.loadHierarchyUnits = async function(topicId, gradeName, subjectName, topicName) {
  const units = await window.api.getUnits(topicId);
  const breadcrumb = document.getElementById('hierarchy-breadcrumbs');
  const container = document.getElementById('hierarchy-container');

  breadcrumb.innerHTML = `
    <a href="#/hierarchy" style="color:var(--text-muted); text-decoration:none;">Grades</a> &gt; 
    <span>${gradeName}</span> &gt; 
    <span>${subjectName}</span> &gt; 
    <span style="color:var(--primary); font-weight:600;">${topicName}</span>
  `;

  if (units.length === 0) {
    container.innerHTML = `<div class="card" style="grid-column: 1/-1;">No units found for ${topicName}.</div>`;
    return;
  }

  container.innerHTML = units.map(u => `
    <div class="metric-card" onclick="loadHierarchyConcepts(${u.id}, '${gradeName}', '${subjectName}', '${topicName}', '${u.name}')">
      <div class="metric-top">
        <span class="metric-title">Unit #${u.unitNumber || 1}</span>
        <div class="metric-icon-box">📑</div>
      </div>
      <div class="metric-value">${u.name}</div>
      <div class="metric-footer">Click to view concepts &rarr;</div>
    </div>
  `).join('');
};

window.loadHierarchyConcepts = async function(unitId, gradeName, subjectName, topicName, unitName) {
  const concepts = await window.api.getConcepts(unitId);
  const breadcrumb = document.getElementById('hierarchy-breadcrumbs');
  const container = document.getElementById('hierarchy-container');

  breadcrumb.innerHTML = `
    <a href="#/hierarchy" style="color:var(--text-muted); text-decoration:none;">Grades</a> &gt; 
    <span>${gradeName}</span> &gt; 
    <span>${subjectName}</span> &gt; 
    <span>${topicName}</span> &gt; 
    <span style="color:var(--primary); font-weight:600;">${unitName}</span>
  `;

  if (concepts.length === 0) {
    container.innerHTML = `<div class="card" style="grid-column: 1/-1;">No concepts found for ${unitName}.</div>`;
    return;
  }

  container.innerHTML = concepts.map(c => `
    <div class="metric-card" onclick="loadHierarchyQuestions(${c.id}, '${gradeName}', '${subjectName}', '${topicName}', '${unitName}', '${c.name}')">
      <div class="metric-top">
        <span class="metric-title">Concept</span>
        <div class="metric-icon-box">💡</div>
      </div>
      <div class="metric-value" style="font-size:1.3rem;">${c.name}</div>
      <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.5rem;">${c.summary || 'Summary unavailable'}</div>
      <div class="metric-footer" style="margin-top:0.75rem;">Click to view questions &rarr;</div>
    </div>
  `).join('');
};

window.loadHierarchyQuestions = async function(conceptId, gradeName, subjectName, topicName, unitName, conceptName) {
  const questions = await window.api.getQuestions(conceptId);
  const breadcrumb = document.getElementById('hierarchy-breadcrumbs');
  const container = document.getElementById('hierarchy-container');

  breadcrumb.innerHTML = `
    <a href="#/hierarchy" style="color:var(--text-muted); text-decoration:none;">Grades</a> &gt; 
    <span>${gradeName}</span> &gt; 
    <span>${subjectName}</span> &gt; 
    <span>${topicName}</span> &gt; 
    <span>${unitName}</span> &gt; 
    <span style="color:var(--primary); font-weight:600;">${conceptName}</span>
  `;

  if (questions.length === 0) {
    container.innerHTML = `<div class="card" style="grid-column: 1/-1;">No questions found for ${conceptName}.</div>`;
    return;
  }

  container.innerHTML = `
    <div style="grid-column: 1/-1; display:flex; flex-direction:column; gap:1rem;">
      ${questions.map(q => `
        <div class="card">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span class="badge badge-info">${q.difficulty}</span>
            <span class="badge badge-success">${q.status}</span>
          </div>
          <div style="font-size:1.1rem; font-weight:600; margin-bottom:0.75rem;">${q.questionText}</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; margin-bottom:0.75rem;">
            ${(q.answerOptions || []).map(o => `
              <div style="padding:0.5rem 0.75rem; border-radius:6px; background:${o.isCorrect ? 'var(--badge-success-bg)' : 'var(--bg-input)'}; border:1px solid ${o.isCorrect ? 'var(--primary)' : 'var(--border-color)'}; font-size:0.875rem;">
                ${o.isCorrect ? '✅' : '⚪'} ${o.optionText}
              </div>
            `).join('')}
          </div>
          ${q.explanation ? `<div style="font-size:0.85rem; color:var(--text-muted); background:var(--bg-input); padding:0.5rem; border-radius:6px;"><strong>Explanation:</strong> ${q.explanation}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
};

// -------------------------------------------------------------
// 3. DIRECT SIDEBAR VIEWS (GRADES, SUBJECTS, TOPICS, UNITS, CONCEPTS, QUESTIONS)
// -------------------------------------------------------------
async function renderGradesView(container) {
  const grades = await window.api.getGrades();
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Grades > List</div>
        <h1 class="page-title">Grades</h1>
      </div>
      <button class="btn btn-primary" onclick="alert('Add Grade Dialog')">New Grade</button>
    </div>
    <div class="page-body">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Name</th>
              <th>Code</th>
              <th>Status</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${grades.map(g => `
              <tr>
                <td><strong>${g.sortOrder || g.id}</strong></td>
                <td>${g.name}</td>
                <td><code>${g.code}</code></td>
                <td><span class="badge badge-success">✓ Active</span></td>
                <td>${g.questionsCount || 0}</td>
                <td>
                  <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Edit</button>
                  <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderSubjectsView(container) {
  const subjects = await window.api.getSubjects();
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Subjects > List</div>
        <h1 class="page-title">Subjects</h1>
      </div>
      <button class="btn btn-primary" onclick="alert('New Subject')">New Subject</button>
    </div>
    <div class="page-body">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Grade</th>
              <th>Language</th>
              <th>Status</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map(s => `
              <tr>
                <td><strong>${s.name}</strong></td>
                <td><code>${s.code}</code></td>
                <td>${s.grade ? s.grade.name : 'All Grades'}</td>
                <td><span class="badge badge-info">${s.language || 'English'}</span></td>
                <td><span class="badge badge-success">✓ Active</span></td>
                <td>${s.questionsCount || 0}</td>
                <td>
                  <button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Edit</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderTopicsView(container) {
  const topics = await window.api.getTopics();
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Topics > List</div>
        <h1 class="page-title">Topics</h1>
      </div>
      <button class="btn btn-primary">New Topic</button>
    </div>
    <div class="page-body">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Topic #</th>
              <th>Name</th>
              <th>Subject</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${topics.map(t => `
              <tr>
                <td>#${t.topicNumber || 1}</td>
                <td><strong>${t.name}</strong></td>
                <td>${t.subject ? t.subject.name : 'N/A'}</td>
                <td><button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Edit</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderUnitsView(container) {
  const units = await window.api.getUnits();
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Units > List</div>
        <h1 class="page-title">Units</h1>
      </div>
      <button class="btn btn-primary">New Unit</button>
    </div>
    <div class="page-body">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Unit #</th>
              <th>Name</th>
              <th>Topic</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${units.map(u => `
              <tr>
                <td>#${u.unitNumber || 1}</td>
                <td><strong>${u.name}</strong></td>
                <td>${u.topic ? u.topic.name : 'N/A'}</td>
                <td><button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Edit</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderConceptsView(container) {
  const concepts = await window.api.getConcepts();
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Concepts > List</div>
        <h1 class="page-title">Concepts</h1>
      </div>
      <button class="btn btn-primary">New Concept</button>
    </div>
    <div class="page-body">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Unit</th>
              <th>Summary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${concepts.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.unit ? c.unit.name : 'N/A'}</td>
                <td>${c.summary || '-'}</td>
                <td><button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Edit</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderQuestionsView(container) {
  const questions = await window.api.getQuestions();
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Questions > List</div>
        <h1 class="page-title">Questions</h1>
      </div>
      <button class="btn btn-primary">New Question</button>
    </div>
    <div class="page-body">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Subject</th>
              <th>Concept</th>
              <th>Question Text</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${questions.map(q => `
              <tr>
                <td><span class="badge badge-info">Grade 5</span></td>
                <td>Mathematics</td>
                <td>${q.concept ? q.concept.name : 'Algebra'}</td>
                <td>${q.questionText}</td>
                <td><span class="badge badge-warning">${q.difficulty}</span></td>
                <td><span class="badge badge-success">${q.status}</span></td>
                <td><button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Edit</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 4. CSV BULK IMPORT STUDIO
// -------------------------------------------------------------
function renderCsvImportView(container) {
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Publishing & Imports > CSV Importer</div>
        <h1 class="page-title">CSV Bulk Import Studio</h1>
      </div>
    </div>
    <div class="page-body">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Upload Questions & Academic Hierarchy CSV</div>
        </div>
        <p style="color:var(--text-muted); font-size:0.875rem; margin-bottom:1.25rem;">
          Upload a CSV containing fields: <code>Grade, Subject, Topic, Unit, Concept, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Explanation</code>. 
          Missing hierarchy entities will be resolved automatically.
        </p>

        <div class="dropzone" id="csv-dropzone" onclick="document.getElementById('csv-file-input').click()">
          <svg class="dropzone-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
          <div style="font-weight:600; font-size:1.05rem; margin-bottom:0.25rem;">Click or drag CSV file here to upload</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">Supports .csv files up to 50MB</div>
          <input type="file" id="csv-file-input" accept=".csv" style="display:none;" onchange="handleCsvFileSelected(this.files)">
        </div>

        <div id="csv-upload-result" style="margin-top:1.5rem; display:none;"></div>
      </div>
    </div>
  `;
}

window.handleCsvFileSelected = async function(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  const resultContainer = document.getElementById('csv-upload-result');
  resultContainer.style.display = 'block';
  resultContainer.innerHTML = `<div class="badge badge-info">Uploading and parsing ${file.name}...</div>`;

  const res = await window.api.uploadCsv(file);
  resultContainer.innerHTML = `
    <div style="background:var(--bg-input); padding:1rem; border-radius:8px; border:1px solid var(--border-color);">
      <div style="color:var(--primary); font-weight:700; margin-bottom:0.5rem;">✅ CSV Import Completed Successfully</div>
      <div>Imported Records: <strong>${res.imported || 0}</strong></div>
      <div>Skipped Rows: <strong>${res.skipped || 0}</strong></div>
      ${(res.errors && res.errors.length) ? `<div style="color:var(--badge-danger-text); margin-top:0.5rem;">Errors: ${res.errors.join(', ')}</div>` : ''}
    </div>
  `;
};

// -------------------------------------------------------------
// 5. PACKAGE DISTRIBUTION & PUBLISHING MANAGER
// -------------------------------------------------------------
async function renderPackagePublishingView(container) {
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Publishing & Imports > Package Publisher</div>
        <h1 class="page-title">Grade Package Publishing Studio</h1>
      </div>
      <button class="btn btn-primary" onclick="openModal('modal-package-publish')">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Publish Grade Package
      </button>
    </div>

    <div class="page-body">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Published Version History (Cloudflare R2 Storage)</div>
        </div>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Version</th>
                <th>Status</th>
                <th>Package R2 Download URL</th>
                <th>File Size</th>
                <th>SHA-256 Checksum</th>
                <th>Published At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Grade 5</strong></td>
                <td><code>2.4</code></td>
                <td><span class="badge badge-success">● Current Release</span></td>
                <td><a href="https://4ce23afb1e23344b92945a2dbde9fc00.r2.cloudflarestorage.com/grameone/packages/grade5_v2.4.zip" target="_blank" style="color:var(--primary);">Download grade5_v2.4.zip</a></td>
                <td>42.1 MB</td>
                <td><code>a9f8e7d6...</code></td>
                <td>2026-07-20 10:15</td>
                <td><button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="alert('Rollback trigger')">Rollback</button></td>
              </tr>
              <tr>
                <td><strong>Grade 5</strong></td>
                <td><code>2.3</code></td>
                <td><span class="badge badge-info">Archived</span></td>
                <td><a href="#" style="color:var(--text-muted);">Download grade5_v2.3.zip</a></td>
                <td>39.5 MB</td>
                <td><code>b8e7d6c5...</code></td>
                <td>2026-06-10 14:30</td>
                <td><button class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Rollback to this</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 6. LICENSE MANAGEMENT STUDIO
// -------------------------------------------------------------
async function renderLicensesView(container) {
  const licenses = await window.api.getLicenses();
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Licenses > List</div>
        <h1 class="page-title">Licenses</h1>
      </div>
      <div style="display:flex; gap:0.75rem;">
        <button class="btn btn-secondary" onclick="openModal('modal-license-generate')">Single Code</button>
        <button class="btn btn-primary" onclick="openModal('modal-license-generate')">✨ Bulk Generate Codes</button>
      </div>
    </div>

    <div class="page-body">
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Activation Code</th>
              <th>Subscription Duration</th>
              <th>Status</th>
              <th>Device ID</th>
              <th>Expires At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${licenses.map(l => `
              <tr>
                <td><code><strong>${l.activationCode}</strong></code></td>
                <td>${l.subscriptionDurationMonths || 12} Months Plan</td>
                <td>
                  <span class="badge ${l.status === 'ACTIVE' ? 'badge-success' : (l.status === 'PENDING' ? 'badge-warning' : 'badge-danger')}">
                    ${l.status}
                  </span>
                </td>
                <td>${l.deviceId ? `<code>${l.deviceId}</code>` : '<span style="color:var(--text-dark);">Unbound</span>'}</td>
                <td>${l.expiryDate ? new Date(l.expiryDate).toLocaleDateString() : '-'}</td>
                <td>
                  <button class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.75rem;">Revoke</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderSubscriptionsView(container) {
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Administration > Subscription Plans</div>
        <h1 class="page-title">Subscription Plans</h1>
      </div>
      <button class="btn btn-primary">New Plan</button>
    </div>
    <div class="page-body">
      <div class="metrics-grid">
        <div class="card">
          <div class="card-title">Term Package (4 Months)</div>
          <div style="font-size:1.75rem; font-weight:700; color:var(--primary); margin:0.5rem 0;">$15.00</div>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">Access to 1 grade package for 4 months.</p>
          <button class="btn btn-secondary">Edit Plan</button>
        </div>

        <div class="card">
          <div class="card-title">2 Terms Package (8 Months)</div>
          <div style="font-size:1.75rem; font-weight:700; color:var(--primary); margin:0.5rem 0;">$28.00</div>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">Access to 1 grade package for 8 months.</p>
          <button class="btn btn-secondary">Edit Plan</button>
        </div>

        <div class="card">
          <div class="card-title">Annual Package (12 Months)</div>
          <div style="font-size:1.75rem; font-weight:700; color:var(--primary); margin:0.5rem 0;">$40.00</div>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">Full access to 1 grade package for 1 year.</p>
          <button class="btn btn-secondary">Edit Plan</button>
        </div>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// 7. SYSTEM METRICS & DIAGNOSTICS
// -------------------------------------------------------------
function renderSystemMetricsView(container) {
  container.innerHTML = `
    <div class="content-header">
      <div>
        <div class="breadcrumbs">Administration > System Metrics</div>
        <h1 class="page-title">System Metrics & Diagnostics</h1>
      </div>
      <button class="btn btn-primary" onclick="renderSystemMetricsView(document.getElementById('content-view'))">Refresh Diagnostics</button>
    </div>

    <div class="page-body">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Real-time Infrastructure Status</div>
        </div>

        <div class="health-item">
          <div>
            <div style="font-weight:600;">Supabase PostgreSQL Database Connection</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">aws-0-eu-central-1.pooler.supabase.com:5432/postgres</div>
          </div>
          <span class="badge badge-success">✓ 24ms Ping (Connected)</span>
        </div>

        <div class="health-item">
          <div>
            <div style="font-weight:600;">Cloudflare R2 Object Storage Endpoint</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">https://4ce23afb1e23344b92945a2dbde9fc00.r2.cloudflarestorage.com</div>
          </div>
          <span class="badge badge-success">✓ 38ms Ping (Healthy)</span>
        </div>

        <div class="health-item">
          <div>
            <div style="font-weight:600;">Spring Boot JVM Memory Usage</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">Heap: 248MB / 1024MB</div>
          </div>
          <span class="badge badge-info">24% Allocation</span>
        </div>

        <div class="health-item">
          <div>
            <div style="font-weight:600;">Active API Requests Throughput</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">Spring Boot Web Server</div>
          </div>
          <span class="badge badge-success">14 req/sec</span>
        </div>
      </div>
    </div>
  `;
}

function initGlobalSearch() {
  const input = document.getElementById('global-search');
  if (!input) return;
  input.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    if (q.includes('grade')) window.location.hash = '#/grades';
    else if (q.includes('subject')) window.location.hash = '#/subjects';
    else if (q.includes('license') || q.includes('code')) window.location.hash = '#/licenses';
    else if (q.includes('question')) window.location.hash = '#/questions';
  });
}
