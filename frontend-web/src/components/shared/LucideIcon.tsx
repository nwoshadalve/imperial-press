/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

import {
  Archive,
  Award,
  Copyright,
  FileText,
  Gauge,
  Globe,
  Languages,
  LifeBuoy,
  ShieldCheck,
  SpellCheck,
  type LucideIcon as LucideIconType,
} from 'lucide-react';

/**
 * Explicit registry for icon names referenced in dummy content. Explicit
 * imports keep tree-shaking working (no dynamic barrel import).
 */
const registry: Record<string, LucideIconType> = {
  Archive,
  Award,
  Copyright,
  FileText,
  Gauge,
  Globe,
  Languages,
  LifeBuoy,
  ShieldCheck,
  SpellCheck,
};

interface Props {
  name: string;
  size?: number;
  className?: string;
}

export function LucideIcon({ name, size = 20, className }: Props) {
  const Icon = registry[name] ?? FileText;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
