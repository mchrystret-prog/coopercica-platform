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
    {name === "whatsapp" ? <><path d="M20.5 11.7a8.7 8.7 0 0 1-12.9 7.6L3 20.5l1.2-4.4a8.7 8.7 0 1 1 16.3-4.4Z"/><path d="M8.5 7.2c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1s.9 2.4 1.1 2.6c.1.2 1.8 2.8 4.4 3.9 2.2.9 2.6.7 3.1.7.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.1-1.2l-.5-.3-1.8-.9c-.3-.1-.5-.2-.7.2l-.8 1c-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.2-1.4-.8-.7-1.3-1.5-1.5-1.8-.1-.2 0-.4.1-.5l.5-.6.3-.5c.1-.2 0-.4 0-.5l-.7-1.7Z" fill="currentColor" stroke="none"/></> : null}
  </svg>;
}
