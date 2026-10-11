"use client";

import { ResultScreen } from "@/components/ResultScreen";
import { TestConfig } from "@/components/TestConfig";
import { useTest } from "@/components/TestProvider";
import { TypingTest } from "@/components/TypingTest";

/** `.pageTest`: config on top, test (or result) vertically centered between header and footer. */
export function TestPage() {
  const { state } = useTest();
  const showResult = state.finished && state.result !== null;

  return (
    <main className="full-width content-grid grid-rows-[1fr_auto_1fr]">
      <div className="full-width">
        <TestConfig />
      </div>
      {showResult ? <ResultScreen /> : <TypingTest />}
    </main>
  );
}
