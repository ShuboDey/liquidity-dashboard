/**
 * signals.js
 * -----------
 * Hardcoded signal data for the MVP frontend.
 *
 * TODO (Backend integration): Replace SIGNALS with a fetch() call to
 * GET /signals on your API Gateway endpoint. Each object returned should
 * match the same shape defined here.
 *
 * TODO (Backend integration): Replace getSignalLevel() threshold values
 * with values fetched from a config endpoint or environment variable so
 * risk managers can adjust thresholds without a code deploy.
 */

export const SIGNALS = [
  {
    id: 'lcr',
    name: 'Liquidity Coverage Ratio',
    shortName: 'LCR',
    unit: '%',
    value: 118,
    previousValue: 121.2,
    threshold: 100,   // Regulatory minimum — below this is ELEVATED
    warnAt: 120,      // Below this is WATCH
    description: '30-day stress scenario',
    higherIsBetter: true,
  },
  {
    id: 'fundingSpread',
    name: 'Funding Spread (3M)',
    shortName: 'Funding Spread',
    unit: 'bps',
    value: 187,
    previousValue: 175,
    threshold: 200,   // Above this is ELEVATED
    warnAt: 160,      // Above this is WATCH
    description: 'vs. OIS mid-market',
    higherIsBetter: false,
  },
  {
    id: 'repoRate',
    name: 'Overnight Repo Rate',
    shortName: 'Repo Rate',
    unit: '%',
    value: 5.32,
    previousValue: 5.24,
    threshold: 5.50,  // Above this is ELEVATED
    warnAt: 5.20,     // Above this is WATCH
    description: 'GC collateral, USD',
    higherIsBetter: false,
  },
  {
    id: 'stressIndicator',
    name: 'Internal Stress Indicator',
    shortName: 'Stress Index',
    unit: '/10',
    value: 6.8,
    previousValue: 6.4,
    threshold: 7.0,   // Above this is ELEVATED
    warnAt: 6.0,      // Above this is WATCH
    description: 'Composite internal model',
    higherIsBetter: false,
  },
];

/**
 * Returns 'elevated' | 'watch' | 'normal' for a given signal.
 */
export function getSignalLevel(signal) {
  const { value, threshold, warnAt, higherIsBetter } = signal;

  if (higherIsBetter) {
    if (value < threshold) return 'elevated';
    if (value < warnAt)   return 'watch';
    return 'normal';
  } else {
    if (value >= threshold) return 'elevated';
    if (value >= warnAt)    return 'watch';
    return 'normal';
  }
}

/**
 * Returns the signed delta between current and previous value,
 * formatted as a string e.g. "+3.2" or "-0.8".
 */
export function getDelta(signal) {
  const delta = signal.value - signal.previousValue;
  const fixed = Math.abs(delta) < 10
    ? delta.toFixed(2)
    : delta.toFixed(1);
  return delta >= 0 ? `+${fixed}` : `${fixed}`;
}

/**
 * Returns the fill-bar percentage (0–100) for visual display.
 * Normalised so that the threshold sits at ~70% of the bar.
 */
export function getBarPercent(signal) {
  const { value, threshold, higherIsBetter } = signal;
  if (higherIsBetter) {
    const max = threshold * 1.8;
    return Math.min(100, Math.max(0, (value / max) * 100));
  } else {
    const max = threshold * 1.4;
    return Math.min(100, Math.max(0, (value / max) * 100));
  }
}

/**
 * Returns a snapshot of all current signal values.
 * This is frozen and stored alongside every audit decision.
 *
 * TODO (Backend integration): This snapshot should be assembled
 * server-side in the Lambda handler so it cannot be tampered with
 * by the client. The frontend version here is for MVP only.
 */
export function buildSnapshot(signals) {
  return signals.map(s => ({
    id: s.id,
    name: s.name,
    value: s.value,
    unit: s.unit,
    level: getSignalLevel(s),
  }));
}
