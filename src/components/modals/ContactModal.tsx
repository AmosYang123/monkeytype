"use client";

import Link from "next/link";
import { Fa, type FaIconName } from "@/components/icons";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { ModalButton } from "./ModalButton";

const BUTTONS: { icon: FaIconName; text: string; href: string }[] = [
  { icon: "question-circle", text: "Question", href: "mailto:contact@monkeytype.com?subject=[Question] " },
  { icon: "comment-dots", text: "Feedback", href: "mailto:contact@monkeytype.com?subject=[Feedback] " },
  { icon: "bug", text: "Bug Report", href: "mailto:support@monkeytype.com?subject=[Bug] " },
  { icon: "user-circle", text: "Account Help", href: "mailto:support@monkeytype.com?subject=[Account] " },
  { icon: "briefcase", text: "Business Inquiry", href: "mailto:jack@monkeytype.com?subject=[Business] " },
  { icon: "ellipsis-h", text: "Other", href: "mailto:contact@monkeytype.com?subject=[Other] " },
];

export function ContactModal() {
  return (
    <AnimatedModal id="Contact" modalClass="max-w-4xl!" title="Contact">
      <div>
        Feel free to send an email to contact@monkeytype.com. For business inquiries, email jack@monkeytype.com (the
        buttons below will open the default mail client).
        <br />
        <br />
        Please <span className="text-error">do not send</span> requests to delete account, update email, update name or
        clear personal bests - you can do that in the <Link href="/account-settings">account settings</Link> page.
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {BUTTONS.map((b) => (
          <ModalButton key={b.text} href={b.href} className="justify-start gap-4 p-4 text-lg leading-7!">
            <Fa icon={b.icon} />
            {b.text}
          </ModalButton>
        ))}
      </div>
    </AnimatedModal>
  );
}
