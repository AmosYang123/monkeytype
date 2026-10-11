"use client";

import { useEffect, useRef, useState } from "react";
import { Fa } from "@/components/icons";

const STORAGE_KEY = "merchBannerClosed";

export function MerchBanner() {
  const [closed, setClosed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // reading storage in an effect avoids an SSR hydration mismatch
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(STORAGE_KEY) === "1") setClosed(true);
    } catch {
      // storage unavailable
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const el = rootRef.current;
    if (closed || !el) {
      root.style.setProperty("--banner-height", "0px");
      return;
    }
    const update = () => {
      root.style.setProperty("--banner-height", `${el.offsetHeight}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.setProperty("--banner-height", "0px");
    };
  }, [closed]);

  const close = () => {
    setClosed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // storage unavailable
    }
  };

  return (
    <>
      {!closed && (
        <div ref={rootRef} className="fixed top-0 left-0 z-[1000] w-full">
          <div className="content-grid w-full bg-main text-bg">
            <div className="flex w-full justify-between gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/merch2.png"
                alt="Banner Image"
                className="hidden h-9 w-54 max-w-full self-center xl:block"
              />
              <Fa icon="shopping-bag" className="self-center xl:hidden" />
              <div className="self-center p-2 text-base leading-5 text-bg">
                Check out our merch store!{" "}
                <a
                  href="https://mktp.co/merch"
                  target="_blank"
                  rel="noopener"
                  className="inline-block text-bg underline transition-colors duration-125 hover:text-text"
                >
                  monkeytype.store
                </a>
              </div>
              <button
                type="button"
                aria-label="close banner"
                onClick={close}
                className="-mr-2 h-9 w-9 cursor-pointer rounded-[8px] p-2 text-bg transition-[background,color,opacity] duration-125 hover:text-text"
              >
                <Fa icon="times" className="leading-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed top-0 left-0 -z-10 h-2 w-screen bg-main" />
    </>
  );
}
