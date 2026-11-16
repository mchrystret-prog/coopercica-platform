"use client";
import { createContext, useContext } from "react";
import type { CmsRole } from "@/lib/cms-access";

export const CmsRoleContext = createContext<CmsRole | null>(null);
export const useCmsRole = () => useContext(CmsRoleContext);
