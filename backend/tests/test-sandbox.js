// Standalone sandbox test file.
// This does not import or modify any project modules.

function add(a, b) {
  return a + b;
}

function runSandboxTests() {
  const cases = [
    { input: [1, 2], expected: 3 },
    { input: [0, 0], expected: 0 },
    { input: [-1, 1], expected: 0 },
  ];

  let passed = 0;

  for (const testCase of cases) {
    const actual = add(testCase.input[0], testCase.input[1]);
    const ok = actual === testCase.expected;

    if (ok) passed += 1;

    console.log(
      ok
        ? `PASS input=${testCase.input.join(',')} expected=${testCase.expected}`
        : `FAIL input=${testCase.input.join(',')} expected=${testCase.expected} actual=${actual}`,
    );
  }

  console.log(`\n${passed}/${cases.length} sandbox tests passed.`);
}

runSandboxTests();
