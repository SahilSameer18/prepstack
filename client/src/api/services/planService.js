import api from "../axios";

// Preview lifecycle changes against the latest owned plans before confirmation.
export async function previewPlanRecovery(body) {
  const response = await api.post('/api/plan/lifecycle/preview', body);
  return response.data.data;
}

export async function applyPlanRecovery(body) {
  const response = await api.post('/api/plan/lifecycle/apply', body);
  return response.data.data;
}

// A paused snapshot is read-only until the learner explicitly resumes it.
export async function getPausedPlan(id) {
  const response = await api.get('/api/plan/paused/' + encodeURIComponent(id));
  return response.data.data;
}

// A substitute is its own problem and never grants solve credit to the original.
export async function getProblemSubstitutes(id) {
  const response = await api.get(itemPath(id) + '/substitutes');
  return response.data.data;
}

export async function substitutePlanProblem(id, choice) {
  const response = await api.post(itemPath(id) + '/substitute', {
    sheetSlug: choice.sheetSlug, link: choice.link, checksum: choice.checksum,
  });
  return response.data.data;
}

// Axios gives us the server response in response.data; its data field contains the actual payload.

// Load the sheets, roadmaps and topics offered by the public builder.
export async function getPlanOptions(signal) {
  const response = await api.get("/api/plan/options", { signal });
  return response.data.data;
}

// Calculate a preview without saving a plan. A signal cancels an outdated request.
export async function previewPlan(settings, signal) {
  const response = await api.post("/api/plan/preview", settings, { signal });
  return response.data.data;
}

// Read the signed-in user's current plan. This request does not change it.
export async function getPlan(signal) {
  const response = await api.get("/api/plan", { signal });
  return response.data.data;
}

// Save a plan after login. Replacing an existing plan needs explicit consent.
export async function createPlan(settings) {
  const response = await api.post("/api/plan", settings);
  return response.data.data;
}

// Item IDs are encoded so a title or URL can never become part of an API path.
function itemPath(id) {
  return "/api/plan/items/" + encodeURIComponent(id);
}

// Update completion, planned minutes or the scheduled day of an existing item.
export async function updatePlanItem(id, changes) {
  const response = await api.patch(itemPath(id), changes);
  return response.data.data;
}

// Record the learner's result; the server decides when the review ladder begins.
export async function recordPlanResult(id, result) {
  const response = await api.post(itemPath(id) + "/result", result);
  return response.data.data;
}

// Reviews use a separate endpoint and never re-tick the original problem.
export async function reviewPlanItem(id, passed) {
  const response = await api.post(itemPath(id) + "/review", { passed });
  return response.data.data;
}

// Starred items form the learner's revision list.
export async function starPlanItem(id) {
  const response = await api.patch(itemPath(id) + "/star");
  return response.data.data;
}

// Skipping affects all parts of a topic item; undo uses the server's unskip rules.
export async function skipPlanItem(id, skipped) {
  const action = skipped ? "/skip" : "/unskip";
  const response = await api.post(itemPath(id) + action);
  return response.data.data;
}

// Custom tasks are saved inside the current plan.
export async function addPlanItem(task) {
  const response = await api.post("/api/plan/items", task);
  return response.data.data;
}

// Only student-created items can be removed; planner items must be skipped instead.
export async function removePlanItem(id) {
  const response = await api.delete(itemPath(id));
  return response.data.data;
}

// A change preview is read-only. Its checksum is required by the apply call.
export async function previewPlanChange(change) {
  const response = await api.post("/api/plan/changes/preview", change);
  return response.data.data;
}

// Apply exactly the change and checksum that the learner has confirmed.
export async function applyPlanChange(change) {
  const response = await api.post("/api/plan/changes/apply", change);
  return response.data.data;
}

// Weekly review is calculated by the server from actual completion dates.
export async function getPlanReview(weekStart, signal) {
  const response = await api.get("/api/plan/review", {
    params: { weekStart },
    signal,
  });
  return response.data.data;
}

// History summaries and details remain separate from the editable active plan.
export async function getPlanHistory(signal) {
  const response = await api.get("/api/plan/history", { signal });
  return response.data.data;
}

export async function getHistoryPlan(id, signal) {
  const response = await api.get(
    "/api/plan/history/" + encodeURIComponent(id),
    { signal },
  );
  return response.data.data;
}

// Deletion is explicit and does not undo sheet progress.
export async function deleteCurrentPlan() {
  const response = await api.delete("/api/plan");
  return response.data.data;
}

export async function deletePlanHistory() {
  const response = await api.delete("/api/plan/history");
  return response.data.data;
}

// Report imports are derived from an owned saved report, never client task text.
export async function previewReportPlan(reportId, mode) {
  const path = '/api/plan/reports/' + encodeURIComponent(reportId) + '/preview';
  const response = await api.post(path, { mode });
  return response.data.data;
}

// Apply the exact report mode and checksum the learner reviewed.
export async function applyReportPlan(reportId, preview) {
  const path = '/api/plan/reports/' + encodeURIComponent(reportId) + '/apply';
  const response = await api.post(path, { mode: preview.mode, checksum: preview.checksum });
  return response.data.data;
}
