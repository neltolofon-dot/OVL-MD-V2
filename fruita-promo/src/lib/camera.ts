import React from 'react';

/**
 * 2.5D camera. Every layer gets a depth `d` (0 = infinitely far, 1 = the
 * product plane, >1 = between product and lens). Zoom, re-centring and pans
 * are scaled by depth, which is what produces parallax when the camera moves.
 */
export type Cam = {
  zoom: number; // zoom on the product plane
  fx: number; // focus point (product-plane px) brought towards screen centre
  fy: number;
  pull: number; // 0 → 1: how much the focus is re-centred
  px?: number; // extra pan, product-plane px
  py?: number;
};

export const layer = (cam: Cam, d: number): React.CSSProperties => {
  const z = 1 + (cam.zoom - 1) * d;
  const tx = (960 - cam.fx) * cam.pull * d + (cam.px ?? 0) * d;
  const ty = (540 - cam.fy) * cam.pull * d + (cam.py ?? 0) * d;
  return {
    transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${z.toFixed(4)})`,
    transformOrigin: `${cam.fx.toFixed(2)}px ${cam.fy.toFixed(2)}px`,
  };
};
