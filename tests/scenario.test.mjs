import assert from 'node:assert/strict';
import test from 'node:test';
import { STAGES, createState, choose, snapshot, summarize, INDICATOR_NOTICE } from '../dist/scenario.js';

const run = (...choices) => choices.reduce(choose, createState());
const days = [0, 1, 3, 7, 14, 30];
const nodes = new Set(['vendor', 'hq', 'factory', 'logistics', 'hospital', 'retail']);

function pathsFrom(state = createState(), history = []) {
  const stage = STAGES[state.stageIndex];
  if (!stage.choices.length) return [{ state, history }];
  return stage.choices.flatMap((choice) => {
    const next = choose(state, choice.id);
    return pathsFrom(next, [...history, { day: stage.day, state: next }]);
  });
}

test('the exercise has five decisions followed by a decision-free day 30 reflection', () => {
  assert.deepEqual(STAGES.map((stage) => stage.day), days);
  assert.equal(STAGES.at(-1).choices.length, 0);
  assert.deepEqual(createState(), {
    stageIndex: 0, decisions: [], containment: 0, visibility: 18, trust: 65, continuity: 100,
  });
  assert.equal(summarize(createState()).completed, false);
});

test('all 243 paths finish, produce valid snapshots, and preserve the educational caveat', () => {
  const paths = pathsFrom();
  assert.equal(paths.length, 243);
  for (const { state } of paths) {
    assert.equal(state.stageIndex, 5);
    assert.equal(state.decisions.length, 5);
    assert.equal(summarize(state).completed, true);
    assert.equal(summarize(state).decisions.length, 5);
    assert.ok(summarize(state).disclaimer.includes(INDICATOR_NOTICE));
    for (const day of days) {
      const result = snapshot(state, day);
      assert.equal(result.day, day);
      for (const name of ['visibility', 'continuity', 'trust', 'containment']) {
        assert.ok(Number.isFinite(result[name]), name);
        assert.ok(result[name] >= 0 && result[name] <= 100, name);
      }
      assert.equal(new Set(result.impacted).size, result.impacted.length);
      assert.ok(result.impacted.every((id) => nodes.has(id)));
      assert.ok(result.evidence.every((entry) => ['confirmed', 'unknown', 'inferred'].includes(entry.status)));
      assert.equal(result.indicatorNotice, INDICATOR_NOTICE);
      if (result.prevented) assert.deepEqual(result.impacted, []);
    }
  }
});

test('later decisions cannot change historical snapshots on any of the 243 paths', () => {
  for (const { state: completed, history } of pathsFrom()) {
    for (const { day, state: then } of history) {
      assert.deepEqual(snapshot(completed, day), snapshot(then, day), `Future information leaked into day ${day}`);
    }
  }
});

test('replaying only recorded choice IDs deterministically restores state and every day', () => {
  for (const { state } of pathsFrom()) {
    const restored = run(...JSON.parse(JSON.stringify(state.decisions)).map((decision) => decision.choiceId));
    assert.deepEqual(restored, state);
    for (const day of days) assert.deepEqual(snapshot(restored, day), snapshot(state, day));
  }
});

test('choosing does not mutate earlier states and rejects a choice from the wrong stage', () => {
  const before = createState();
  const copy = structuredClone(before);
  const after = choose(before, 'verify-update');
  assert.deepEqual(before, copy);
  assert.notEqual(after, before);
  assert.notEqual(after.decisions, before.decisions);
  assert.throws(() => choose(before, 'contain-now'), RangeError);
});

test('updating before the first signal prevents the modeled initial compromise', () => {
  const updated = run('verify-update');
  for (const day of days) {
    const result = snapshot(updated, day);
    assert.equal(result.patched, true);
    assert.equal(result.prevented, true);
    assert.deepEqual(result.impacted, []);
  }
  assert.match(snapshot(updated, 1).message, /侵入は起きていない/);
  assert.match(snapshot(updated, 14).message, /真偽/);
});

test('a day 3 update does not retroactively prevent the incident or prove no prior breach', () => {
  const state = run('defer-update', 'wait-proof', 'preserve-rebuild');
  assert.equal(snapshot(state, 0).patched, false);
  assert.equal(snapshot(state, 1).patched, false);
  assert.equal(snapshot(state, 3).patched, true);
  assert.equal(snapshot(state, 3).prevented, false);
  assert.ok(snapshot(state, 3).impacted.includes('vendor'));
  assert.ok(snapshot(state, 3).evidence.some((entry) => entry.label.includes('過去の侵害')));
});

test('early isolation limits propagation while retaining supplier service dependency', () => {
  const isolated = run('defer-update', 'contain-now');
  const waiting = run('defer-update', 'wait-proof');
  assert.equal(snapshot(isolated, 0).isolated, false);
  const contained = snapshot(isolated, 7);
  assert.equal(contained.isolated, true);
  assert.ok(contained.impacted.includes('vendor'));
  assert.ok(contained.impacted.includes('hq'));
  assert.ok(contained.impacted.length < snapshot(waiting, 7).impacted.length);
  assert.match(contained.summary, /影響は残ります/);
});

test('payment alone does not guarantee recovery or data deletion', () => {
  const base = run('defer-update', 'wait-proof', 'hold-original', 'wait-full-report');
  const paid = choose(base, 'pay-demand');
  const recovery = choose(base, 'clean-recovery');
  assert.match(snapshot(paid, 30).summary, /成否は未確認/);
  assert.ok(snapshot(paid, 30).impacted.length > 0);
  assert.deepEqual(snapshot(recovery, 30).impacted, []);
  assert.ok(snapshot(recovery, 30).continuity > snapshot(paid, 30).continuity);
});

test('evidence loss and preservation remain visible in the learning feedback', () => {
  const lost = run('map-dependencies', 'restrict-monitor', 'wipe-restart');
  const preserved = run('map-dependencies', 'restrict-monitor', 'preserve-rebuild');
  assert.ok(snapshot(lost, 3).evidence.some((entry) => entry.label.includes('保存しなかった証拠')));
  assert.ok(snapshot(preserved, 3).evidence.some((entry) => entry.label.includes('証拠を保全')));
  assert.ok(snapshot(preserved, 3).visibility > snapshot(lost, 3).visibility);
});

test('snapshot derives effects from known choices rather than trusting altered persisted scores', () => {
  const original = run('defer-update', 'wait-proof');
  const altered = structuredClone(original);
  altered.visibility = 99999;
  altered.patched = true;
  altered.decisions[0].effects.patched = true;
  altered.decisions[0].effects.visibility = 99999;
  assert.deepEqual(snapshot(altered, 1), snapshot(original, 1));
});
