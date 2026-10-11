"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Fa } from "@/components/icons";
import { ModalButton } from "@/components/modals/ModalButton";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { readCookieConsent, writeCookieConsent, type CookieConsent } from "@/lib/cookie-consent";
import { hideModal, showModal } from "@/lib/modals";

/** Reopen the cookie dialog (e.g. from the settings page). */
export const openCookiesModal = () => showModal("Cookies");

const NONE: CookieConsent = { analytics: false, sponsorship: false };

function Setting({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="grid grid-cols-[1fr_auto] items-center gap-2">
      <div className="grid gap-1">
        <div className="text-sub">{title}</div>
        <div className="text-text">{description}</div>
      </div>
      <input
        type="checkbox"
        className="text-2xl"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.currentTarget.checked)}
      />
    </label>
  );
}

export function CookieModal() {
  const [showSettings, setShowSettings] = useState(false);
  const [accepted, setAccepted] = useState<CookieConsent>(NONE);

  // first visit: ask once. Reading storage can only happen after mount.
  useEffect(() => {
    if (readCookieConsent() === null) showModal("Cookies");
  }, []);

  const save = (consent: CookieConsent) => {
    writeCookieConsent(consent);
    hideModal("Cookies");
  };

  return (
    <AnimatedModal
      id="Cookies"
      modalClass="max-w-[500px]!"
      wrapperClass="items-end justify-end"
      closeOnEscape={false}
      closeOnWrapperClick={false}
      afterShow={() => setAccepted(readCookieConsent() ?? NONE)}
      afterHide={() => {
        setShowSettings(false);
        setAccepted(NONE);
      }}
    >
      <h3 className="flex items-center gap-[0.5em] text-2xl text-sub">
        <Fa icon="cookie-bite" fw={false} />
        We use cookies by the way
      </h3>
      {showSettings ? (
        <div className="grid gap-4">
          <Setting
            title="essential"
            description="Required cookies that keep the site secure and working. They do not store any personal information."
            checked
            disabled
          />
          <Setting
            title="analytics"
            description="We use analytics to track the overall traffic and demographics of our site."
            checked={accepted.analytics}
            onChange={(analytics) => setAccepted({ ...accepted, analytics })}
          />
          <Setting
            title="sponsorship"
            description="Our sponsorship partners may use cookies to deliver ads that are more relevant to you."
            checked={accepted.sponsorship}
            onChange={(sponsorship) => setAccepted({ ...accepted, sponsorship })}
          />
          <ModalButton className="w-full" onClick={() => save(accepted)}>
            accept selected
          </ModalButton>
        </div>
      ) : (
        <div className="grid gap-4">
          <div>Cookies enhance your experience and help us improve our website.</div>
          <div className="grid gap-2">
            <ModalButton active className="w-full" onClick={() => save({ analytics: true, sponsorship: true })}>
              accept all
            </ModalButton>
            <ModalButton className="w-full" onClick={() => save(NONE)}>
              reject non-essential
            </ModalButton>
            <ModalButton className="w-full" onClick={() => setShowSettings(true)}>
              more options
            </ModalButton>
          </div>
        </div>
      )}
    </AnimatedModal>
  );
}
