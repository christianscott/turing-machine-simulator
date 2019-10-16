import { TuringMachine } from "./index";
import { ACCEPT_STATE, REJECT_STATE, RIGHT, LEFT, NULL } from "./constants";
import { TransitionTable } from "./turing_machine";

test("trivial case", () => {
  const states = { q0: Symbol("q0"), q1: Symbol("q1") };

  const transitionTable: TransitionTable = {
    [states.q0]: {
      0: [REJECT_STATE],
      [NULL]: [ACCEPT_STATE]
    },

    [states.q1]: {
      0: [REJECT_STATE],
      [NULL]: [ACCEPT_STATE]
    }
  };

  const defn = {
    states,
    transitionFn: TuringMachine.makeTransitionFn(transitionTable),
    startState: states.q0
  };

  const tm = new TuringMachine(defn);

  expect(tm.accepts("")).toBe(true);
  expect(tm.accepts("0")).toBe(false);

  expect(tm.rejects("")).toBe(false);
  expect(tm.rejects("0")).toBe(true);
});

test("{ s | s in {0, 1}*, '11' in s }", () => {
  const states = {
    q1: Symbol("q1"),
    q2: Symbol("q2"),
    q3: Symbol("q3")
  };

  const transitionTable: TransitionTable = {
    [states.q1]: {
      0: [states.q1, RIGHT],
      1: [states.q2, RIGHT],
      [NULL]: [REJECT_STATE, RIGHT]
    },
    [states.q2]: {
      0: [states.q1, RIGHT],
      1: [ACCEPT_STATE, RIGHT],
      [NULL]: [REJECT_STATE, RIGHT]
    },
    [states.q3]: {
      0: [states.q1, RIGHT],
      1: [ACCEPT_STATE, RIGHT],
      [NULL]: [REJECT_STATE, RIGHT]
    }
  };

  const defn = {
    transitionFn: TuringMachine.makeTransitionFn(transitionTable),
    startState: states.q1,
    states
  };

  const tm = new TuringMachine(defn);

  const tests = [
    { input: "", output: false },
    { input: "00", output: false },
    { input: "11", output: true },
    { input: "011", output: true },
    { input: "0101", output: false }
  ];

  runTableTests(tests, s => tm.accepts(s));
});

test("{ 0^n1^n | n >= 0 }", () => {
  const states = {
    q0: Symbol("q0"),
    q1: Symbol("q1"),
    q2: Symbol("q2"),
    q3: Symbol("q3")
  };

  const transitionTable: TransitionTable = {
    [states.q0]: {
      0: [states.q1],
      1: [REJECT_STATE],
      [NULL]: [ACCEPT_STATE]
    },

    [states.q1]: {
      0: [states.q1, RIGHT, "0"],
      1: [states.q1, RIGHT, "1"],
      [NULL]: [states.q2, LEFT]
    },

    [states.q2]: {
      0: [REJECT_STATE],
      1: [states.q3, LEFT],
      [NULL]: [REJECT_STATE]
    },

    [states.q3]: {
      0: [states.q3, LEFT, "0"],
      1: [states.q3, LEFT, "1"],
      [NULL]: [states.q0]
    }
  };

  const defn = {
    transitionFn: TuringMachine.makeTransitionFn(transitionTable),
    startState: states.q0,
    states
  };

  const tm = new TuringMachine(defn);

  const tests = [
    { input: "", output: true },
    { input: "0", output: false },
    { input: "1", output: false },
    { input: "10", output: false },
    { input: "01", output: true },
    { input: "0000011111", output: true },
    { input: "000001111", output: false },
    { input: "000011111", output: false },
    { input: "0101", output: false }
  ];

  runTableTests(tests, s => tm.accepts(s));
});

/**
 * "message" property is a workaround to add context to failing tests in a loop
 */
function runTableTests(
  table: { input: string; output: boolean }[],
  fn: (s: string) => boolean
) {
  table.forEach(({ input, output }) => {
    const result = fn(input);
    const message = `expected ${input} to be ${output}, got ${result} instead`;
    expect({ output: result, message }).toEqual({ output, message });
  });
}
