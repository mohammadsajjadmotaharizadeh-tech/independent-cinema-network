import { getRegistry, persistToDisk } from "./data-layer.js";

const VALID_PHASES = ["idle", "researching", "evaluating", "notifying", "complete", "error", "cooldown"];
const VALID_STATUS = ["idle", "running", "error", "cooldown", "complete"];

function agentStateKey(filmKey) {
  return `agent_state_${filmKey}`;
}

export function getAgentState(filmKey) {
  const registry = getRegistry();
  return registry[agentStateKey(filmKey)] || {
    filmKey,
    status: "idle",
    phase: "idle",
    lastRunAt: null,
    nextAllowedRunAt: null,
    runCount: 0,
    error: null,
  };
}

export function setAgentState(filmKey, state) {
  const registry = getRegistry();
  registry[agentStateKey(filmKey)] = {
    filmKey,
    status: state.status || "idle",
    phase: state.phase || "idle",
    lastRunAt: state.lastRunAt || null,
    nextAllowedRunAt: state.nextAllowedRunAt || null,
    runCount: state.runCount || 0,
    error: state.error || null,
  };
  persistToDisk();
  return registry[agentStateKey(filmKey)];
}

export function incrementRunCount(filmKey) {
  const state = getAgentState(filmKey);
  state.runCount = (state.runCount || 0) + 1;
  state.lastRunAt = new Date().toISOString();
  state.status = "complete";
  state.phase = "idle";
  persistToDisk();
  return state;
}

export function setRunning(filmKey, phase = "researching") {
  const state = getAgentState(filmKey);
  state.status = "running";
  state.phase = phase;
  state.error = null;
  persistToDisk();
  return state;
}

export function setError(filmKey, error) {
  const state = getAgentState(filmKey);
  state.status = "error";
  state.phase = "error";
  state.error = error;
  state.lastRunAt = new Date().toISOString();
  persistToDisk();
  return state;
}

export function setCooldown(filmKey, nextAllowedRunAt) {
  const state = getAgentState(filmKey);
  state.status = "cooldown";
  state.phase = "idle";
  state.nextAllowedRunAt = nextAllowedRunAt;
  persistToDisk();
  return state;
}

export function canRun(filmKey, intervalMinutes = 60) {
  const state = getAgentState(filmKey);
  const now = Date.now();
  if (state.status === "running") {
    return { allowed: false, reason: "Another run is in progress" };
  }
  if (state.status === "error") {
    return { allowed: true, reason: "Error state — allowing retry" };
  }
  if (state.nextAllowedRunAt && now < new Date(state.nextAllowedRunAt).getTime()) {
    return { allowed: false, reason: "Cooldown active" };
  }
  return { allowed: true, reason: "Ready to run" };
}

export function getAgentStatus(filmKey) {
  const state = getAgentState(filmKey);
  return {
    filmKey,
    status: state.status,
    phase: state.phase,
    lastRunAt: state.lastRunAt,
    nextAllowedRunAt: state.nextAllowedRunAt,
    runCount: state.runCount,
    error: state.error,
    ready: canRun(filmKey).allowed,
  };
}
