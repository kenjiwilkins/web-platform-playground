import {
  categoryLabels,
  loadPlaygrounds,
  parseOrigin,
  type Category,
  type Playground,
} from '@wpp/schema';
import webFeatures from 'web-features/data.json' with { type: 'json' };

export { categoryLabels };
export type { Category, Playground };

export const sandboxOrigin = parseOrigin(
  import.meta.env.PUBLIC_SANDBOX_ORIGIN,
  'PUBLIC_SANDBOX_ORIGIN',
  'http://localhost:4322',
);

let cache: Playground[] | undefined;
export const getPlaygrounds = () => (cache ??= loadPlaygrounds());

export type BaselineStatus = 'widely' | 'newly' | 'limited' | 'unknown';

interface FeatureEntry {
  kind: string;
  name?: string;
  status?: {
    baseline: 'high' | 'low' | false;
    baseline_low_date?: string;
    baseline_high_date?: string;
  };
}

/** web-features のデータから Baseline の状態を引く */
export function baselineOf(pg: Playground): { status: BaselineStatus; since?: string | undefined } {
  const id = pg.meta.webFeature;
  const entry = id ? (webFeatures.features as Record<string, FeatureEntry>)[id] : undefined;
  if (!entry || entry.kind !== 'feature' || !entry.status) return { status: 'unknown' };
  const { baseline, baseline_high_date, baseline_low_date } = entry.status;
  if (baseline === 'high') return { status: 'widely', since: baseline_high_date };
  if (baseline === 'low') return { status: 'newly', since: baseline_low_date };
  return { status: 'limited' };
}

export const baselineLabels: Record<BaselineStatus, string> = {
  widely: 'Widely available',
  newly: 'Newly available',
  limited: 'Limited availability',
  unknown: '状態不明',
};

export const mdnUrl = (slug: string) => `https://developer.mozilla.org/ja/docs/${slug}`;
