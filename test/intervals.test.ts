import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

const interval: fc.Arbitrary<Interval> = fc.integer().chain( (start) => fc.integer({ min: start }).map((end) => [start, end] as Interval)
);const intervalList = fc.array(interval);

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, intervals => {
        const out = mergeIntervals(intervals);
        const uncovered = intervals.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });

  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.

  // Invariants:
  // it.todo('be sorted by start value')
  it('be sorted by start value', () => {
    fc.assert(
      fc.property(intervalList, intervals => {
        const res = mergeIntervals(intervals);
        let count = 0;
        let prevStart = null; 
        for (const [start, end] of res) {
          if ((prevStart != null) && (start < prevStart)) {
            count++
          }
          prevStart = start;
        }
        expect(count).toEqual(0); 
      })
    );
  });

  // it.todo('should have start <= end for every interval')
  it('should have start <= end for every interval', () => {
    fc.assert(
      fc.property(intervalList, intervals => {
        const res = mergeIntervals(intervals);
        let count = 0

        for (const [start, end] of res) {
          if (start > end) {
            count++
          }
        }

        expect(count).toEqual(0);
      })
    );
  });

  // it.todo('should not have overlapping intervals')
  it('should not have overlapping intervals', () => {
    fc.assert(
      fc.property(intervalList, intervals => {
        const res = mergeIntervals(intervals);
        let count = 0;
        let prevEnd = null; 
        for (const [start, end] of res) {
          if ((prevEnd != null) && (prevEnd >= start )) {
            count++
          }
          prevEnd = end;
        }
        expect(count).toEqual(0); 
      })
    );
  });

  // it.todo('should not alter input intervals')
  it('should not alter input intervals', () => {
    fc.assert(
      fc.property(intervalList, (intervals) => {
        const origArray = [...intervals];
        const origVals = intervals.map(([s, e]) => [s, e]);

        mergeIntervals(intervals); // run it then compare

        expect(intervals).toEqual(origVals); //values all untouched

        intervals.forEach((interval, i) => {
          expect(interval).toBe(origArray[i]); //go thru array 
        });

        expect(intervals).toEqual(origArray); // check the overall
        })
    );
  })

 


  // Algebraic / idempotence:
  // it.todo('merging an already merged interval should not change anything')
  it('merging an already merged interval does not change the output', () => {
    fc.assert(
      fc.property(intervalList, intervals => {
        const merged = mergeIntervals(intervals);
        const remerge = mergeIntervals(merged);

        expect(merged).toEqual(remerge)
      })
    );
  });


  // Metamorphic:
  // it.todo('changing the order of the input intervals should not change the output')
  it('never changes output even if order of the input intervals change', () => {
    fc.assert(
      fc.property(intervalList.chain(intervals => fc.shuffledSubarray(intervals, { minLength: intervals.length, maxLength: intervals.length,
          }).map(shuffled => [intervals, shuffled] as const)), ([intervals, shuffled]) => { //shuffle and then set as constants so can compare
          expect(mergeIntervals(shuffled)).toEqual(mergeIntervals(intervals));
      })
    );
  });

  
  // Differential:
  // secondary implementation
  function covers(intervals: readonly Interval[], p: number): boolean {
    return intervals.some(([start, end]) => start <= p && p <= end);
  }


  // Can you write a tiny, obviously correct check of "is point p covered?" and compare input with output?
  // it.todo('output should be same as secondary implementation output')
  it('output should be same as secondary implementation output', () => {
    fc.assert(
      fc.property(intervalList, (intervals) => {
        const res = mergeIntervals(intervals);
        const endpoints = intervals.flatMap(([s, e]) => [s, e]);
        const points = new Set<number>(endpoints);
        const sorted = [...points].sort((a, b) => a - b);

        for (let i = 0; i < sorted.length - 1; i++) {
          points.add((sorted[i] + sorted[i + 1]) / 2);
        }

        for (const p of points) {
          expect(covers(res, p)).toBe(covers(intervals, p));
        }
      }),
    );
  });
  
  // Conditional:  
  // it.todo('intervals that touch should merge')
  it('intervals that touch should merge', () => {
    fc.assert(
      fc.property(fc.integer({ min: -999, max: 999 }), (start) => {
        const intervals: Interval[] = [
          [start, start + 1],
          [start + 1, start + 2],
        ];
  
        expect(mergeIntervals(intervals)).toEqual([
          [start, start + 2],
        ]);
      }),
    );
  });

  // created separated intervals
  const separatedIntervals = fc.array(fc.integer({ min: 0, max: 10 }), { maxLength: 20 }).map((widths) => {
    let nextStart = 0;

    return widths.map((width): Interval => {
      const interval: Interval = [nextStart, nextStart + width];
      nextStart = interval[1] + 2;
      return interval;
    });
  });

  // 	If the input intervals already don't overlap or touch, what should the output be? (Generate such inputs directly.)
  // it.todo('inputs that do not overlap or touch should have input = output')
  // only covers touching sometimes
  it('inputs that do not overlap or touch should have input = output', () => {
    fc.assert(
      fc.property(separatedIntervals, (intervals) => {
        const res = mergeIntervals(intervals);
        expect(res).toEqual(intervals)
      })
    );
  });

  //need additional test to alwayss cover one away counterexample
  it('intervals separated by one unit should not merge', () => {
    fc.assert(
      fc.property(fc.integer({ min: -999, max: 999 }), (start) => {
        const intervals: Interval[] = [
          [start, start],
          [start + 1, start + 1],
        ];

        expect(mergeIntervals(intervals)).toEqual(intervals);
      }),
    );
  });


});
