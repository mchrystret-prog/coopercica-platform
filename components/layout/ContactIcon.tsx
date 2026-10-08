import type { SocialNetwork } from "@/lib/footer-contact";
export function ContactIcon({ name }: {
    name: SocialNetwork | "whatsapp" | "email";
}) {
    return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === "instagram" ? <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/></> : null}
    {name === "facebook" ? <path d="M14 21v-8h3l.5-4H14V7c0-1 .5-1.5 1.5-1.5H18V2h-3c-3 0-5 2-5 5v2H7v4h3v8" fill="currentColor" stroke="none"/> : null}
    {name === "youtube" ? <><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none"/></> : null}
    {name === "linkedin" ? <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7m4 0v-7m0 3c0-4 6-4 6 0v4"/><circle cx="7" cy="7" r=".8" fill="currentColor" stroke="none"/></> : null}
    {name === "email" ? <><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/></> : null}
    {name === "whatsapp" ? <><path d="M21 11.5a9 9 0 0 1-13.3 8L3 21l1.5-4.7A9 9 0 1 1 21 11.5Z"/><path d="M8 7c-1 1-1 3 1 5s4 3 5 2l1-1-3-2-1 1-2-2 1-1-2-2Z"/></> : null}
  </svg>;
}
