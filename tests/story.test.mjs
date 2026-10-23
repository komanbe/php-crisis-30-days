import test from 'node:test';
import assert from 'node:assert/strict';
import { STORIES, createStory, getFrame, advanceStory, replayStory } from '../dist/story-data.js';

const PEOPLE = ['vendor', 'hq', 'factory', 'logistics', 'hospital', 'retail'];

function allPaths(storyId) {
  const endings = [];
  function walk(state, frames = [], actions = []) {
    const current = getFrame(state);
    const path = [...frames, current];
    if (current.kind === 'ending') {
      endings.push({ state, frames: path, actions, ending: current.ending });
      return;
    }
    assert.ok(path.length < 25, 'A story must reach an ending without a loop.');
    if (current.kind === 'choice') {
      for (const choice of current.choices) walk(advanceStory(state, choice.id), path, [...actions, choice.id]);
    } else {
      walk(advanceStory(state), path, [...actions, null]);
    }
  }
  walk(createStory(storyId));
  return endings;
}

for (const story of STORIES) {
  test(`${story.id}: every binary path reaches a complete, replayable ending`, () => {
    const paths = allPaths(story.id);
    assert.equal(paths.length, 8);
    const distinct = new Set();
    for (const path of paths) {
      assert.equal(path.frames.length, 16);
      assert.equal(path.frames.filter((frame) => frame.kind === 'choice').length, 3);
      assert.equal(path.state.decisions.length, 3);
      assert.deepEqual(replayStory(story.id, path.actions), path.state);
      assert.deepEqual(path.ending.impacts.map((item) => item.nodeId), PEOPLE);
      assert.equal(path.ending.decisions.length, 3);
      assert.deepEqual(path.ending.chain.map((item) => item.nodeId), PEOPLE);
      for (const item of path.ending.impacts) {
        assert.ok(['affected', 'protected', 'burden'].includes(item.status));
        for (const key of ['title', 'text', 'quote']) assert.ok(item[key].length > 0);
      }
      for (const frame of path.frames) {
        assert.ok(frame.day >= 0 && frame.day <= 180);
        assert.ok(frame.scene.pressure >= 0 && frame.scene.pressure <= 1);
        assert.ok(frame.scene.impacted.every((nodeId) => PEOPLE.includes(nodeId)));
        assert.ok(frame.speaker === null || PEOPLE.includes(frame.speaker));
        assert.ok(frame.title && frame.text && frame.context && frame.time && frame.chapter);
        assert.doesNotMatch(`${frame.text} ${frame.context}`, /この物語|架空|演習|想定した|教材上|予測していません/);
        assert.ok(['calm', 'alert', 'relief'].includes(frame.mood));
        if (frame.kind === 'choice') {
          assert.equal(frame.choices.length, 2);
          assert.notEqual(frame.choices[0].id, frame.choices[1].id);
        }
      }
      distinct.add(JSON.stringify(path.ending));
      assert.throws(() => advanceStory(path.state), /ended/);
    }
    assert.equal(distinct.size, 8, 'All three choices must make a visible difference.');
  });
}

test('early updating changes the incident, rather than replaying an unavoidable breach', () => {
  const paths = allPaths('crisis');
  const protectedPaths = paths.filter(({ state }) => state.flags.updatedEarly);
  const delayedPaths = paths.filter(({ state }) => !state.flags.updatedEarly);
  for (const { frames, ending } of protectedPaths) {
    const afterUpdate = frames.slice(4);
    assert.ok(afterUpdate.every((frame) => frame.scene.patched && frame.scene.prevented));
    assert.ok(afterUpdate.every((frame) => frame.scene.impacted.length === 0));
    const updateReport = frames.find((frame) => frame.id === 'crisis-update-reaction').text;
    assert.match(updateReport, /修正は反映/);
    assert.doesNotMatch(updateReport, /第一報|防げ|安全です/);
    assert.match(frames.find((frame) => frame.id === 'crisis-confirmation').text, /確認した範囲で、不審な動きは見つかっていません/);
    assert.match(frames.find((frame) => frame.id === 'crisis-confirmation').text, /通報の真偽はまだ調査中/);
    assert.equal(ending.impacts.find((item) => item.nodeId === 'factory').status, 'protected');
    assert.equal(ending.impacts.find((item) => item.nodeId === 'logistics').status, 'protected');
    assert.equal(ending.impacts.find((item) => item.nodeId === 'vendor').status, 'burden');
  }
  for (const { frames, ending } of delayedPaths) {
    assert.match(frames.find((frame) => frame.id === 'crisis-confirmation').text, /未修正の PHP から受発注サーバーに侵入されたことが確認/);
    assert.equal(ending.impacts.find((item) => item.nodeId === 'vendor').status, 'affected');
    assert.ok(frames.find((frame) => frame.id === 'crisis-recovery').scene.patched);
    assert.ok(!frames.find((frame) => frame.id === 'crisis-recovery').scene.prevented);
    assert.match(ending.summary, /広がったのはシステムへの侵入ではなく、前の仕事を待つ時間/);
  }
});

test('restored systems retain past business harms, and alternatives reduce those harms', () => {
  const paths = allPaths('crisis').filter(({ state }) => !state.flags.updatedEarly);
  for (const { frames, state, ending } of paths) {
    assert.deepEqual(frames.find((frame) => frame.id === 'crisis-recovery').scene.impacted, []);
    assert.equal(frames.find((frame) => frame.id === 'crisis-confirmation').scene.isolated, true);
    assert.equal(frames.find((frame) => frame.id === 'crisis-recovery').scene.isolated, false);
    const factory = ending.impacts.find((item) => item.nodeId === 'factory');
    assert.equal(factory.status, state.flags.alternate ? 'burden' : 'affected');
    assert.match(frames.find((frame) => frame.id === 'crisis-delivery').context, /前の仕事の遅れが、次の予定に届く/);
    assert.match(ending.impacts.find((item) => item.nodeId === 'vendor').text, /復旧後も/);
  }
});

test('the future starts patched and models workload rather than forced intrusion', () => {
  for (const { frames, state, ending } of allPaths('updates')) {
    assert.ok(frames.every((frame) => frame.scene.patched && frame.scene.futureMode));
    assert.match(ending.summary, /更新の通知は届き続け/);
    assert.match(ending.summary, /作業をいつ進めるか、誰が担うか、いつ知らせるか/);
    assert.ok(!frames.some((frame) => /侵害されました|侵入されました|漏えいしました/.test(frame.text)));
    const vendor = ending.impacts.find((item) => item.nodeId === 'vendor');
    assert.equal(vendor.status, state.flags.scheduled && state.flags.sharedTeam ? 'burden' : 'affected');
    const retail = ending.impacts.find((item) => item.nodeId === 'retail');
    if (state.flags.scheduled && state.flags.transparent) assert.equal(retail.status, 'protected');
    if (!state.flags.scheduled && !state.flags.transparent) assert.equal(retail.status, 'affected');
  }
});

test('state transitions are immutable and reject skipped, foreign, or forged choices', () => {
  const start = createStory('crisis');
  const saved = structuredClone(start);
  const next = advanceStory(start);
  assert.deepEqual(start, saved);
  assert.notEqual(next, start);
  assert.notEqual(next.flags, start.flags);
  assert.notEqual(next.decisions, start.decisions);
  assert.throws(() => createStory('unknown'), /Unknown story/);
  assert.throws(() => advanceStory(start, 'update'), /no choices/);
  assert.throws(() => getFrame({ ...start, nodeId: 'updates-opening' }), /does not belong/);
  assert.throws(() => getFrame({ ...start, nodeId: 'crisis-ending' }), /skipped/);
  const choice = replayStory('crisis', [null, null, null]);
  assert.throws(() => advanceStory(choice), /valid choice/);
  assert.throws(() => advanceStory(choice, 'regular'), /valid choice/);
  const selected = advanceStory(choice, 'update');
  assert.throws(() => getFrame({ ...selected, flags: { updatedEarly: false } }), /do not match/);
  assert.throws(() => getFrame({ ...selected, decisions: [{ nodeId: 'crisis-update', choiceId: 'regular' }] }), /invalid decision/);
  assert.throws(() => replayStory('updates', 'regular'), /array/);
  // Consumers may annotate rendered frames without changing the model's source data.
  const rendered = getFrame(choice);
  rendered.choices[0].label = 'changed';
  assert.notEqual(getFrame(choice).choices[0].label, 'changed');
});
