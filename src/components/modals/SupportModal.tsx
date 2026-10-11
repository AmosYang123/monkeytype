"use client";

import { Fa, type FaIconName } from "@/components/icons";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { ModalButton } from "./ModalButton";

const LINKS: { icon: FaIconName; text: string; href: string }[] = [
  { icon: "donate", text: "Donate", href: "https://ko-fi.com/monkeytype" },
  { icon: "patreon", text: "Join Patreon", href: "https://www.patreon.com/monkeytype" },
  { icon: "tshirt", text: "Buy Merch", href: "https://monkeytype.store" },
];

const BUTTON = "h-full! flex-col justify-center p-4";
const ICON = { fontSize: "2em" };

export function SupportModal() {
  return (
    <AnimatedModal id="Support" title="Support Monkeytype" modalClass="max-w-4xl!">
      <div>
        Thank you so much for thinking about supporting this project. It would not be possible without you and your
        continued support. <Fa icon="heart" />
      </div>
      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-4">
        {/* ponytail: this clone has no ads, so the button does nothing (source opens the ads commandline) */}
        <ModalButton className={BUTTON}>
          <Fa icon="ad" style={ICON} />
          Enable Ads
        </ModalButton>
        {LINKS.map((l) => (
          <ModalButton key={l.text} href={l.href} className={BUTTON}>
            <Fa icon={l.icon} style={ICON} />
            {l.text}
          </ModalButton>
        ))}
      </div>
    </AnimatedModal>
  );
}
