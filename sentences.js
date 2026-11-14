// Publishable client key; database permissions allow only reading sentences and
// updating the checked column of this intentionally shared public checklist.
const SENTENCE_API = 'https://fgomaujsdblpzxhnnqrg.supabase.co/rest/v1/bm01_sentences';
const SENTENCE_KEY = 'sb_publishable_JOUqLZDnfGu_yCa6k6FVDQ_AYwpr72i';
const sentenceList = document.getElementById('sentence-list');
const syncStatus = document.getElementById('sync-status');
const pendingSentences = new Set();
let readInProgress = false;
let syncGeneration = 0;
let sharedLoaded = false;
let saveFailure = false;

function setSyncStatus(message, error = false) {
  syncStatus.textContent = message;
  syncStatus.parentElement.dataset.error = String(error);
}

async function sentenceRequest(query = '', options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(SENTENCE_API + query, {
      ...options,
      cache: 'no-store',
      signal: controller.signal,
      headers: { apikey: SENTENCE_KEY, 'Content-Type': 'application/json', ...options.headers }
    });
    if (!response.ok) throw new Error('Shared checklist request failed: ' + response.status);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function setSentenceState(row, checked) {
  row.querySelector('input').checked = checked;
  row.classList.toggle('is-checked', checked);
}

function renderSentences(rows) {
  if (!rows.length) throw new Error('No shared sentences found');
  // The database supplies both sentence text and order on every device.
  const existingIds = [...sentenceList.children].map(row => Number(row.dataset.sentenceId));
  if (rows.length !== existingIds.length || rows.some((row, i) => row.id !== existingIds[i])) {
    sentenceList.replaceChildren();
    for (const item of rows) {
      const row = document.createElement('li');
      row.dataset.sentenceId = item.id;
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.setAttribute('aria-label', 'Gray out sentence ' + item.id);
      const number = document.createElement('span');
      number.className = 'sentence-number';
      number.textContent = item.id + '.';
      const text = document.createElement('span');
      text.className = 'sentence-text';
      label.append(checkbox, number, text);
      row.append(label);
      sentenceList.append(row);
    }
  }
  rows.forEach((item, i) => {
    const row = sentenceList.children[i];
    row.querySelector('.sentence-text').textContent = item.content;
    setSentenceState(row, item.checked);
    row.querySelector('input').disabled = false;
  });
}

async function refreshSentences() {
  if (readInProgress || pendingSentences.size) return;
  readInProgress = true;
  const generation = syncGeneration;
  try {
    const rows = await sentenceRequest('?select=id,content,checked&order=id.asc');
    // Ignore a response that started before a more recent local write.
    if (generation !== syncGeneration || pendingSentences.size) return;
    renderSentences(rows);
    sharedLoaded = true;
    if (!saveFailure) setSyncStatus(rows.filter(row => row.checked).length + ' of ' + rows.length + ' checked · Synced across devices');
  } catch {
    setSyncStatus('Cannot sync right now. Check your connection and press Refresh.', true);
    sentenceList.querySelectorAll('input').forEach(input => { input.disabled = true; });
  } finally {
    readInProgress = false;
  }
}

sentenceList.addEventListener('change', async event => {
  const input = event.target;
  if (!input.matches('input[type="checkbox"]') || !sharedLoaded) return;
  const row = input.closest('li');
  const id = Number(row.dataset.sentenceId);
  const checked = input.checked;
  syncGeneration++;
  pendingSentences.add(id);
  input.disabled = true;
  setSentenceState(row, checked);
  setSyncStatus('Saving…');
  try {
    const updated = await sentenceRequest('?id=eq.' + id + '&select=id,checked', {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ checked })
    });
    if (updated.length !== 1 || updated[0].checked !== checked) throw new Error('Change not confirmed');
    saveFailure = false;
    setSyncStatus('Saved · Syncing across devices…');
  } catch {
    setSentenceState(row, !checked);
    saveFailure = true;
    setSyncStatus('Save could not be confirmed. Press Refresh to check the shared state, then try again.', true);
  } finally {
    pendingSentences.delete(id);
    input.disabled = false;
    syncGeneration++;
    if (!saveFailure) refreshSentences();
  }
});

document.getElementById('sync-retry').addEventListener('click', () => {
  saveFailure = false;
  refreshSentences();
});
document.getElementById('view').addEventListener('change', () => {
  if (document.getElementById('view').value === 'sentences') refreshSentences();
});
window.addEventListener('focus', refreshSentences);
window.addEventListener('online', refreshSentences);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshSentences();
});
setInterval(() => {
  if (!document.hidden && document.getElementById('view').value === 'sentences') refreshSentences();
}, 3000);
refreshSentences();
