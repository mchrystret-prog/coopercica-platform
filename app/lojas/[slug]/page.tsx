import { permanentRedirect } from "next/navigation";

// Preserve existing bookmarks without retaining individual store pages.
export default function Page() {
  permanentRedirect("/lojas");
}
