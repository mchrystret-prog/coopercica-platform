/** Retry transient autoplay failures when media becomes visible or ready. */
export function observeBannerAutoplay(video: HTMLVideoElement) {
  let disposed = false;
  let visible = false;
  const play = () => {
    if (disposed || !visible || document.hidden) return;
    video.muted = true;
    video.defaultMuted = true;
    // A rejected attempt is not a user pause. Visibility/readiness can retry it.
    void video.play().catch(() => {});
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else video.pause();
  });
  const visibility = () => {
    if (document.hidden) video.pause();
    else play();
  };
  observer.observe(video);
  video.addEventListener("loadeddata", play);
  video.addEventListener("canplay", play);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("pageshow", play);
  return () => {
    disposed = true;
    observer.disconnect();
    video.removeEventListener("loadeddata", play);
    video.removeEventListener("canplay", play);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("pageshow", play);
    video.pause();
  };
}
