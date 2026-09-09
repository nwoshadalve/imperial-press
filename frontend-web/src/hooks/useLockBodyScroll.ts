/**
 * Copyright (c) 2026 Imperial Press. All rights reserved.
 *
 * Developed by MD Nwoshad Alam Chowdhury.
 */

'use client';

import { useEffect } from 'react';

/**
 * Freeze background scrolling while an overlay (drawer, modal) is open.
 * Compensates for the scrollbar width so the page doesn't shift on lock.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement } = document;
    const scrollBarWidth = window.innerWidth - documentElement.clientWidth;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      body.style.overflow = originalOverflow;
      body.style.paddingRight = originalPaddingRight;
    };
  }, [locked]);
}
