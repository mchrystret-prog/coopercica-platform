"use client";

import type { Campaign } from "@/data/campaigns";
import { useEffect, useState } from "react";

interface HeroProps {
  items: Campaign[];
}

export function Hero({ items }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % items.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [paused, items.length]);

  useEffect(() => {
    if (current >= items.length) {
      setCurrent(0);
    }
  }, [current, items.length]);

  if (!items.length) {
    return null;
  }

  const goToPrevious = () => {
    setCurrent((previous) =>
      previous === 0 ? items.length - 1 : previous - 1,
    );
  };

  const goToNext = () => {
    setCurrent((previous) => (previous + 1) % items.length);
  };

  return (
    <section
      aria-label="Campanhas em destaque"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        height: "clamp(420px, 43vw, 820px)",
        overflow: "hidden",
        backgroundColor: items[current].backgroundColor ?? "#eef7ef",
      }}
    >
      {items.map((campaign, index) => {
        const isActive = index === current;

        return (
          <a
            key={campaign.id}
            href={campaign.href}
            target={campaign.target ?? "_self"}
            rel={
              campaign.target === "_blank"
                ? "noopener noreferrer"
                : undefined
            }
            aria-label={`Acessar campanha: ${campaign.title}`}
            tabIndex={isActive ? 0 : -1}
            style={{
              position: "absolute",
              inset: 0,
              display: "block",
              opacity: isActive ? 1 : 0,
              visibility: isActive ? "visible" : "hidden",
              pointerEvents: isActive ? "auto" : "none",
              transition:
                "opacity 800ms ease, visibility 800ms ease",
            }}
          >
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet={campaign.mobileImage}
              />

              <img
                src={campaign.desktopImage}
                alt={campaign.title}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  objectFit: "cover",
                  objectPosition: "center",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  transition:
                    "transform 6500ms ease, opacity 800ms ease",
                }}
              />
            </picture>
          </a>
        );
      })}

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Banner anterior"
            style={{
              position: "absolute",
              top: "50%",
              left: "clamp(12px, 2vw, 32px)",
              zIndex: 10,
              width: 48,
              height: 48,
              border: 0,
              borderRadius: "999px",
              background: "rgba(255,255,255,.88)",
              color: "#1c4722",
              fontSize: 28,
              lineHeight: 1,
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(28,71,34,.14)",
              transform: "translateY(-50%)",
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Próximo banner"
            style={{
              position: "absolute",
              top: "50%",
              right: "clamp(12px, 2vw, 32px)",
              zIndex: 10,
              width: 48,
              height: 48,
              border: 0,
              borderRadius: "999px",
              background: "rgba(255,255,255,.88)",
              color: "#1c4722",
              fontSize: 28,
              lineHeight: 1,
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(28,71,34,.14)",
              transform: "translateY(-50%)",
            }}
          >
            ›
          </button>

          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: "clamp(18px, 3vw, 34px)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,.88)",
              boxShadow: "0 8px 30px rgba(28,71,34,.12)",
              transform: "translateX(-50%)",
              backdropFilter: "blur(12px)",
            }}
          >
            {items.map((campaign, index) => (
              <button
                key={campaign.id}
                type="button"
                aria-label={`Exibir campanha ${campaign.title}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => setCurrent(index)}
                style={{
                  width: index === current ? 28 : 9,
                  height: 9,
                  padding: 0,
                  border: 0,
                  borderRadius: 999,
                  background:
                    index === current ? "#1c4722" : "#b7ceb9",
                  cursor: "pointer",
                  transition:
                    "width 250ms ease, background-color 250ms ease",
                }}
              />
            ))}

            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={
                paused
                  ? "Retomar reprodução automática"
                  : "Pausar reprodução automática"
              }
              title={
                paused
                  ? "Retomar reprodução"
                  : "Pausar reprodução"
              }
              style={{
                minWidth: 34,
                height: 28,
                marginLeft: 2,
                padding: "0 8px",
                border: 0,
                borderRadius: 999,
                background: "#e6f0e7",
                color: "#1c4722",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {paused ? "▶" : "Ⅱ"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}