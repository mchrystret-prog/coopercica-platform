"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { mobileDeliveryHref, mobileNavigationActive, mobileNavigationVisible } from "@/lib/mobile-navigation";
import styles from "./MobileNavigation.module.css";

type MenuState = {
  open: boolean;
  closeMenu: (restoreFocus?: boolean) => void;
  toggleMenu: (trigger: HTMLButtonElement) => void;
};
const MenuContext = createContext<MenuState | null>(null);

export function usePublicMenu() {
  const menu = useContext(MenuContext);
  if (!menu) throw new Error("O menu público precisa do MobileNavigationProvider.");
  return menu;
}

export function MobileNavigationProvider({ children, deliveryUrl }: { children: ReactNode; deliveryUrl: string }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ pathname, open: false });
  const trigger = useRef<HTMLButtonElement | null>(null);
  // Reset at the route boundary, including browser back/forward navigation.
  if (menu.pathname !== pathname) setMenu({ pathname, open: false });
  const open = menu.pathname === pathname && menu.open;

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenu({ pathname, open: false });
    if (restoreFocus && trigger.current?.isConnected) trigger.current.focus();
  }, [pathname]);
  const toggleMenu = useCallback((button: HTMLButtonElement) => {
    if (open) closeMenu(true);
    else {
      trigger.current = button;
      setMenu({ pathname, open: true });
    }
  }, [open, pathname, closeMenu]);
  const value = useMemo(() => ({ open, closeMenu, toggleMenu }), [open, closeMenu, toggleMenu]);

  useEffect(() => {
    if (!open) return;
    document.getElementById("main-navigation")?.querySelector<HTMLAnchorElement>("a")?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeMenu(true); }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Element && !event.target.closest("[data-public-menu]")) closeMenu();
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open, closeMenu]);

  const visible = mobileNavigationVisible(pathname);
  const active = mobileNavigationActive(pathname);
  return (
    <MenuContext.Provider value={value}>
      {children}
      {visible ? <>
        <div className={styles.spacer} aria-hidden="true" />
        <nav className={styles.navigation} aria-label="Navegação rápida" data-mobile-navigation data-public-menu data-analytics-fixed>
          <Link href={pathname === "/" ? "#home" : "/"} className={styles.item} aria-current={active === "home" ? "page" : undefined} onClick={() => closeMenu()} data-analytics-id="mobile-navigation:home" data-analytics-label="Navegação mobile: Início">
            <Icon name="home" /><span>Início</span>
          </Link>
          <Link href="/folheteria" className={styles.item} aria-current={active === "offers" ? "page" : undefined} onClick={() => closeMenu()} data-analytics-id="mobile-navigation:offers" data-analytics-label="Navegação mobile: Ofertas">
            <Icon name="tag" /><span>Ofertas</span>
          </Link>
          <a href={mobileDeliveryHref(deliveryUrl)} className={`${styles.item} ${styles.buy}`} target="_blank" rel="noopener noreferrer" onClick={() => closeMenu()} data-analytics-id="cta:mobile-buy-online" data-analytics-label="Compre Online">
            <Icon name="shopping-bag" /><span>Compre Online</span>
          </a>
          <Link href="/lojas" className={styles.item} aria-current={active === "stores" ? "page" : undefined} onClick={() => closeMenu()} data-analytics-id="mobile-navigation:stores" data-analytics-label="Navegação mobile: Lojas">
            <Icon name="pin" /><span>Lojas</span>
          </Link>
          <button type="button" className={styles.item} data-active={open || active === "more"} aria-expanded={open} aria-controls="main-navigation" aria-label={open ? "Mais — fechar menu completo" : "Mais — abrir menu completo"} onClick={event => toggleMenu(event.currentTarget)} data-analytics-id="mobile-navigation:more" data-analytics-label="Navegação mobile: Mais">
            <Icon name="menu" /><span>Mais</span>
          </button>
        </nav>
      </> : null}
    </MenuContext.Provider>
  );
}
