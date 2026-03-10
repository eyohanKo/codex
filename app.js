const domainConfigs = [
  { key: 'sleep_score', title: '수면' },
  { key: 'meal_score', title: '식사' },
  { key: 'hygiene_score', title: '위생' },
  { key: 'activity_initiative_score', title: '활동 자발성' },
  { key: 'interpersonal_ward_adaptation_score', title: '대인관계/병동 적응' },
  { key: 'treatment_engagement_score', title: '치료 참여/협조' },
  { key: 'medication_cooperation_score', title: '복약 협조도' },
  { key: 'thought_process_reality_testing_score', title: '사고과정/현실검증' },
  { key: 'insight_score', title: '병식' },
  { key: 'impulsivity_agitation_score', title: '충동성/초조' },
  { key: 'behavior_safety_risk_score', title: '행동/안전위험' },
  { key: 'emotional_tension_score', title: '정서 긴장도' },
  { key: 'program_participation_score', title: '프로그램 참여' },
  { key: 'adl_support_score', title: 'ADL 지원 필요' },
];

const anchors = {
  0: '자발적·안정적 유지',
  1: '약간의 변동/저하, 대체로 유지',
  2: '반복적 저하/제한, 관찰·권유 필요',
  3: '뚜렷한 저하, 반복적 개입 필요',
  4: '심한 저하, 상당한 도움/집중 개입 필요',
  not_assessed: '미평가',
};

const state = {
  patient_id: '',
  patient_name: '',
  mode: 'quick',
  idx: 0,
  scores: {},
  global_baseline_summary: '',
  baseline_status: 'draft',
  baseline_created_at: null,
};

const setupView = document.getElementById('setupView');
const cardView = document.getElementById('cardView');
const summaryView = document.getElementById('summaryView');
const resultView = document.getElementById('resultView');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const saveDraftBtn = document.getElementById('saveDraftBtn');
const saveFinalBtn = document.getElementById('saveFinalBtn');
const voiceBtn = document.getElementById('voiceBtn');

const patientIdInput = document.getElementById('patientId');
const patientNameInput = document.getElementById('patientName');
const entryMode = document.getElementById('entryMode');

const domainTitle = document.getElementById('domainTitle');
const domainKey = document.getElementById('domainKey');
const anchorsEl = document.getElementById('anchors');
const currentSelection = document.getElementById('currentSelection');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const summaryInput = document.getElementById('globalSummary');
const resultJson = document.getElementById('resultJson');

const recognition = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = 'ko-KR';
  r.continuous = true;
  r.interimResults = false;
  return r;
})();

let isListening = false;
if (recognition) {
  recognition.onresult = (event) => {
    const text = Array.from(event.results)
      .slice(event.resultIndex)
      .map((r) => r[0].transcript)
      .join(' ');
    summaryInput.value = `${summaryInput.value} ${text}`.trim();
  };
  recognition.onend = () => {
    isListening = false;
    voiceBtn.textContent = '🎤 음성입력 시작/중지';
  };
}

function activeDomains() {
  return state.mode === 'quick' ? domainConfigs.slice(0, 11) : domainConfigs;
}

function renderCard() {
  const domains = activeDomains();
  const d = domains[state.idx];
  if (!d) {
    cardView.classList.add('hidden');
    summaryView.classList.remove('hidden');
    summaryInput.focus();
    return;
  }
  domainTitle.textContent = d.title;
  domainKey.textContent = d.key;
  const cur = state.scores[d.key] ?? '-';
  currentSelection.textContent = cur;
  progressText.textContent = `${state.idx + 1}/${domains.length}`;
  progressFill.style.width = `${((state.idx + 1) / domains.length) * 100}%`;

  anchorsEl.innerHTML = '';
  ['0', '1', '2', '3', '4'].forEach((k) => {
    const div = document.createElement('div');
    div.className = `anchor ${String(cur) === k ? 'active' : ''}`;
    div.textContent = `${k}: ${anchors[k]}`;
    anchorsEl.appendChild(div);
  });
}

function download(status) {
  state.global_baseline_summary = summaryInput.value.trim();
  state.baseline_status = status;
  const payload = {
    patient_id: state.patient_id,
    patient_name: state.patient_name,
    baseline_created_at: state.baseline_created_at,
    baseline_status: state.baseline_status,
    ...state.scores,
    global_baseline_summary: state.global_baseline_summary,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.patient_id || 'baseline'}_${status}.json`;
  a.click();
  URL.revokeObjectURL(url);

  summaryView.classList.add('hidden');
  resultView.classList.remove('hidden');
  resultJson.textContent = JSON.stringify(payload, null, 2);
}

startBtn.addEventListener('click', () => {
  state.patient_id = patientIdInput.value.trim();
  state.patient_name = patientNameInput.value.trim();
  state.mode = entryMode.value;
  state.idx = 0;
  state.scores = {};
  state.global_baseline_summary = '';
  state.baseline_created_at = new Date().toISOString();

  setupView.classList.add('hidden');
  cardView.classList.remove('hidden');
  summaryView.classList.add('hidden');
  resultView.classList.add('hidden');
  renderCard();
});

restartBtn.addEventListener('click', () => {
  setupView.classList.remove('hidden');
  resultView.classList.add('hidden');
});

saveDraftBtn.addEventListener('click', () => download('draft'));
saveFinalBtn.addEventListener('click', () => download('confirmed'));

voiceBtn.addEventListener('click', () => {
  if (!recognition) {
    alert('이 브라우저는 음성입력을 지원하지 않습니다. (Chrome 권장)');
    return;
  }
  if (isListening) {
    recognition.stop();
    isListening = false;
    voiceBtn.textContent = '🎤 음성입력 시작/중지';
  } else {
    recognition.start();
    isListening = true;
    voiceBtn.textContent = '🛑 음성입력 중지';
  }
});

document.addEventListener('keydown', (e) => {
  if (!cardView.classList.contains('hidden')) {
    const domains = activeDomains();
    const d = domains[state.idx];
    if (!d) return;

    if (/^[0-4]$/.test(e.key)) {
      state.scores[d.key] = Number(e.key);
      state.idx += 1;
      renderCard();
      return;
    }

    if (e.key.toLowerCase() === 'n') {
      state.scores[d.key] = 'not_assessed';
      state.idx += 1;
      renderCard();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      state.idx = Math.max(0, state.idx - 1);
      renderCard();
      return;
    }
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    if (!summaryView.classList.contains('hidden')) download('draft');
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!summaryView.classList.contains('hidden')) download('confirmed');
  }
});
