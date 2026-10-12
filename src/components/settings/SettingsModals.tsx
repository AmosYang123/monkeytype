"use client";

import { useState } from "react";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { ModalButton } from "@/components/modals/ModalButton";
import { useConfig } from "@/components/ConfigProvider";
import { DEFAULT_CONFIG } from "@/lib/config/defaults";
import { getConfig, setConfigs } from "@/lib/config/store";
import { SETTINGS_GROUPS } from "@/lib/config/metadata";
import type { ConfigKey } from "@/lib/config/types";
import { notify } from "@/lib/notifications";
import { validSettingsPatch } from "@/lib/test-settings";

const listedKeys = new Set(
  SETTINGS_GROUPS.flatMap((group) =>
    group.settings.flatMap((setting) =>
      setting.configKey ? [setting.configKey] : [],
    ),
  ),
);
const otherKeys = (Object.keys(DEFAULT_CONFIG) as ConfigKey[]).filter(
  (key) => !listedKeys.has(key) && typeof DEFAULT_CONFIG[key] === "boolean",
);

export function SettingsModals() {
  const config = useConfig();
  const [json, setJson] = useState("");
  return (
    <>
      <AnimatedModal
        id="ImportExportSettings"
        title="import / export settings"
        modalClass="max-w-2xl"
        beforeShow={() => setJson(JSON.stringify(getConfig(), null, 2))}
        focusFirstInput
      >
        <textarea
          aria-label="settings JSON"
          className="min-h-64 w-full rounded-lg bg-sub-alt p-2"
          value={json}
          onChange={(event) => setJson(event.currentTarget.value)}
        />
        <ModalButton
          onClick={() => {
            try {
              const parsed: unknown = JSON.parse(json);
              if (
                !parsed ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
              )
                throw new Error("Settings must be a JSON object");
              const patch = validSettingsPatch(parsed);
              const imported = Object.keys(patch).length;
              if (!imported) throw new Error("No valid settings");
              setConfigs(patch);
              const skipped = Object.keys(parsed).length - imported;
              notify(`Imported ${imported} settings${skipped ? `; skipped ${skipped} invalid or unknown settings` : ""}`, { level: "success" });
            } catch {
              notify("Could not import settings. Please check the JSON.", {
                level: "error",
              });
            }
          }}
        >
          import
        </ModalButton>
        <ModalButton
          onClick={() => {
            const blob = new Blob([JSON.stringify(getConfig(), null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "monkeytype-settings.json";
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >
          export
        </ModalButton>
      </AnimatedModal>
      <AnimatedModal id="TheRest" title="the rest" modalClass="max-w-2xl">
        {otherKeys.map((key) => (
          <div key={key} className="grid grid-cols-2 items-center gap-4">
            <span>{key.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
            <div className="grid grid-cols-2 gap-2">
              {[false, true].map((value) => (
                <ModalButton
                  key={String(value)}
                  active={config[key] === value}
                  onClick={() => setConfigs({ [key]: value })}
                >
                  {value ? "on" : "off"}
                </ModalButton>
              ))}
            </div>
          </div>
        ))}
      </AnimatedModal>
    </>
  );
}
