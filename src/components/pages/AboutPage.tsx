"use client";

import { AboutButton } from "@/components/about/AboutButton";
import { H2, H3 } from "@/components/about/Headers";
import { NameGrid } from "@/components/about/NameGrid";
import { HISTOGRAM_TOTAL, SpeedHistogram } from "@/components/about/SpeedHistogram";

const STATS = [
  ["total tests started", "5.23", "billion"],
  ["total typing time", "1434", "years"],
  ["total tests completed", "936", "million"],
] as const;

const STAT_DEFS = [
  ["wpm", "- total number of characters in the correctly typed words (including spaces), divided by 5 and normalised to 60 seconds."],
  ["raw wpm", " - calculated just like wpm, but also includes incorrect words."],
  ["acc", " - percentage of correctly pressed keys."],
  ["char", "- correct characters / incorrect characters. Calculated after the test has ended."],
  [
    "consistency",
    "- based on the variance of your raw wpm. Closer to 100% is better. Calculated using the coefficient of variation of raw wpm and mapped onto a scale from 0 to 100.",
  ],
] as const;

const CREDITS = [
  ["Montydrei", "https://www.reddit.com/user/montydrei", "for the name suggestion"],
  [
    "Everyone",
    "https://www.reddit.com/r/MechanicalKeyboards/comments/gc6wx3/experimenting_with_a_completely_new_type_of/",
    "who provided valuable feedback on the original reddit post for the prototype of this website",
  ],
  ["Supporters", "#supporters_title", "who helped financially by donating, enabling optional ads or buying merch"],
  [
    "Contributors",
    "https://github.com/monkeytypegame/monkeytype/graphs/contributors",
    "on GitHub that have helped with implementing various features, adding themes and more",
  ],
] as const;

// ponytail: no-op until the footer's support/contact modals are wired up
const noop = () => undefined;

export function AboutPage() {
  return (
    <main className="full-width content-grid">
      <div className="grid gap-8">
        <section className="text-center text-sub">
          Created with love by Miodec.
          <br />
          <a href="#supporters_title">Supported</a> and <a href="#contributors_title">expanded</a> by many awesome people.
          <br />
          Launched on 15th of May, 2020.
        </section>
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map(([title, text, subText]) => (
              <div key={title} className="text-center">
                <div className="text-sub">{title}</div>
                <div className="text-5xl">{text}</div>
                <div className="text-xl">{subText}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="h-48 w-full">
          <SpeedHistogram />
          <div className="text-right text-xs text-sub">
            distribution of time 60 leaderboard results (wpm) <br />
            {(HISTOGRAM_TOTAL / 1000).toFixed(2)} thousand total results
          </div>
        </section>
        <section>
          <H2 icon="info-circle" text="about" />
          <p>
            Monkeytype is a minimalistic and customizable typing test. It features many test modes, an account system to save
            your typing speed history, and user-configurable features such as themes, sounds, a smooth caret, and more.
            Monkeytype attempts to emulate the experience of natural keyboard typing during a typing test, by unobtrusively
            presenting the text prompts and displaying typed characters in-place, providing straightforward, real-time
            feedback on typos, speed, and accuracy.
            <br />
            <br />
            Test yourself in various modes, track your progress and improve your speed.
          </p>
        </section>
        <section>
          <H3 icon="align-left" text="word set" />
          <p>
            By default, this website uses the most common 200 words in the English language to generate its tests. You can
            change to an expanded set (1000 most common words) in the options, or change the language entirely.
          </p>
        </section>
        <section>
          <H3 icon="keyboard" text="keybinds" />
          <p>
            You can use <kbd>tab &gt; enter</kbd> to restart the typing test. Open the command line by pressing{" "}
            <kbd>esc</kbd>&nbsp;or&nbsp;<kbd>ctrl/cmd + shift + p</kbd> - there you can access all the functionality you
            need without touching your mouse.
          </p>
        </section>
        <section>
          <H3 icon="list-ol" text="stats" />
          <dl className="grid">
            {STAT_DEFS.map(([term, def]) => (
              <div key={term} className="contents">
                <dt className="col-start-1 mr-4">{term}</dt>
                <dd className="col-start-2">{def}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section>
          <H3 icon="chart-area" text="results screen" />
          <p>
            After completing a test you will be able to see your wpm, raw wpm, accuracy, character stats, test length,
            leaderboards info and test info (you can hover over some values to get floating point numbers). You can also see
            a graph of your wpm and raw over the duration of the test. Remember that the wpm line is a global average, while
            the raw wpm line is a local, momentary value (meaning if you stop, the value is 0).
          </p>
        </section>
        <section>
          <H3 icon="bug" text="bug report or feature request" />
          <p>
            If you encounter a bug, or have a feature request - join the Discord server, send me an email, a direct message
            on Twitter or create an issue on GitHub.
          </p>
        </section>
        <div></div>
        <section>
          <H2 icon="life-ring" text="support" />
          <p>
            Thanks to everyone who has supported this project. It would not be possible without you and your continued
            support.
          </p>
          <div className="mt-4 text-xl">
            <AboutButton icon="donate" text="support" onClick={noop} className="w-full p-8" />
          </div>
        </section>
        <div></div>
        <section>
          <H2 icon="envelope" text="contact" />
          <p>
            If you encounter a bug, have a feature request or just want to say hi - here are the different ways you can
            contact me directly.
          </p>
          <div className="mt-4 grid w-full grid-cols-1 gap-4 text-xl sm:grid-cols-2 lg:grid-cols-4">
            <AboutButton text="mail" icon="envelope" onClick={noop} className="w-full p-8" />
            <AboutButton text="twitter" icon="twitter" href="https://x.com/monkeytype" className="w-full p-8" />
            <AboutButton text="discord" icon="discord" href="https://discord.gg/monkeytype" className="w-full p-8" />
            <AboutButton
              text="github"
              icon="github"
              href="https://github.com/monkeytypegame/monkeytype"
              className="w-full p-8"
            />
          </div>
        </section>
        <div></div>
        <section>
          <H2 icon="users" text="credits" />
          {CREDITS.map(([text, href, rest]) => (
            <p key={text}>
              <AboutButton variant="text" text={text} href={href} className="p-0 pt-2 pr-2 pb-2" />
              {rest}
            </p>
          ))}
        </section>
        <div></div>
        <section>
          <H2 id="supporters_title" icon="hand-holding-usd" text="top supporters" />
          <NameGrid src="/data/supporters.json" errorMessage="Failed to get supporters" />
        </section>
        <div></div>
        <section>
          <H2 id="contributors_title" icon="code-branch" text="contributors" />
          <NameGrid src="/data/contributors.json" errorMessage="Failed to get contributors" />
        </section>
      </div>
    </main>
  );
}
