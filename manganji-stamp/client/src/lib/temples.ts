// 満願寺データの型定義とユーティリティ
// 「和紙と墨」デザインシステムに沿ったデータ管理

export interface Temple {
  id: number;
  prefecture: string;
  city: string;
  address: string;
  postal: string;
  lat: number;
  lng: number;
}

export interface TempleRecord {
  templeId: number;
  visitedAt: string; // ISO date string
  memo: string;
  stamped: boolean;
  photo?: string; // Base64 encoded image
}

// ローカルストレージキー
const STORAGE_KEY = 'manganji-records';

// 参拝記録の取得
export function getRecords(): Record<number, TempleRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// 参拝記録の保存
export function saveRecord(record: TempleRecord): void {
  const records = getRecords();
  records[record.templeId] = record;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// 参拝記録の削除
export function deleteRecord(templeId: number): void {
  const records = getRecords();
  delete records[templeId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// 参拝済み数の取得
export function getVisitedCount(records: Record<number, TempleRecord>): number {
  return Object.values(records).filter(r => r.stamped).length;
}

// 都道府県リストの取得
export function getPrefectures(temples: Temple[]): string[] {
  const set = new Set(temples.map(t => t.prefecture));
  return Array.from(set).sort();
}

// 現在地から最寄りのお寺を取得（距離km）
export function getNearestTemples(
  temples: Temple[],
  lat: number,
  lng: number,
  limit = 5
): (Temple & { distance: number })[] {
  return temples
    .map(t => ({
      ...t,
      distance: calcDistance(lat, lng, t.lat, t.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

// ハバーサイン公式で距離計算（km）
export function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
