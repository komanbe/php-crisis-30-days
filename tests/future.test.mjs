import assert from 'node:assert/strict';
import test from 'node:test';
import { simulateFuture } from '../dist/future.js';

test('the 180-day model is deterministic and feeds both plans exactly the same tasks', () => {
  const first = simulateFuture();
  assert.deepEqual(first, simulateFuture());
  assert.equal(first.arrivals.length, 181);
  assert.equal(first.user.length, 181);
  assert.equal(first.prepared.length, 181);
  assert.deepEqual(first.user.map(row => row.incoming), first.arrivals);
  assert.deepEqual(first.prepared.map(row => row.incoming), first.arrivals);
});

test('changing the response plan does not change the incoming discovery stream', () => {
  for (const trend of ['accelerating', 'steady', 'settling']) {
    const monthly = simulateFuture({ trend, cadence: 30, capacity: 1 });
    const weekly = simulateFuture({ trend, cadence: 7, capacity: 3 });
    assert.deepEqual(monthly.arrivals, weekly.arrivals);
    assert.deepEqual(monthly.prepared, weekly.prepared);
    assert.deepEqual(weekly.user, weekly.prepared);
  }
});

test('all 27 scenario settings conserve tasks and count end-of-day unresolved exposure', () => {
  let combinations = 0;
  for (const trend of ['accelerating', 'steady', 'settling']) {
    for (const cadence of [7, 30, 90]) {
      for (const capacity of [1, 2, 3]) {
        combinations++;
        const result = simulateFuture({ trend, cadence, capacity });
        for (const [name, limit, interval] of [['user', capacity, cadence], ['prepared', 3, 7]]) {
          let cumulativeExposure = 0, maintenance = 0, arrivals = 0, resolved = 0;
          for (const row of result[name]) {
            arrivals += row.incoming;
            resolved += row.resolved;
            cumulativeExposure += row.backlog;
            if (row.resolved > 0) maintenance++;
            assert.equal(row.totalFound, arrivals);
            assert.equal(row.totalResolved, resolved);
            assert.equal(row.backlog, arrivals - resolved);
            assert.ok(row.backlog >= 0);
            assert.ok(row.resolved <= limit);
            if (row.resolved > 0) assert.equal(row.day % interval, 0);
            assert.equal(row.exposure, cumulativeExposure);
            assert.equal(row.maintenance, maintenance);
          }
        }
      }
    }
  }
  assert.equal(combinations, 27);
});

test('larger capacity cannot increase backlog or exposure when cadence and arrivals match', () => {
  for (const trend of ['accelerating', 'steady', 'settling']) {
    for (const cadence of [7, 30, 90]) {
      const low = simulateFuture({ trend, cadence, capacity: 1 }).user;
      const high = simulateFuture({ trend, cadence, capacity: 3 }).user;
      for (let day = 0; day <= 180; day++) {
        assert.ok(high[day].backlog <= low[day].backlog);
        assert.ok(high[day].exposure <= low[day].exposure);
      }
    }
  }
});

test('the first day has no tasks and invalid scenario inputs are rejected', () => {
  assert.deepEqual(simulateFuture().user[0], {
    day: 0, incoming: 0, totalFound: 0, resolved: 0, totalResolved: 0,
    backlog: 0, exposure: 0, maintenance: 0,
  });
  assert.throws(() => simulateFuture({ trend: 'certain-collapse' }), RangeError);
  assert.throws(() => simulateFuture({ cadence: 0 }), RangeError);
  assert.throws(() => simulateFuture({ capacity: -1 }), RangeError);
});
