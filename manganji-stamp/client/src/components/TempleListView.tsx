/**
 * TempleListView — お寺一覧ビュー
 * Design: 和紙と墨 — 検索・フィルタ付きリスト
 */

import { useState, useMemo } from 'react';
import { Temple, TempleRecord, getPrefectures } from '@/lib/temples';
import { Search, CheckCircle, Circle } from 'lucide-react';

interface Props {
  temples: Temple[];
  records: Record<number, TempleRecord>;
  onTempleSelect: (temple: Temple) => void;
}

export default function TempleListView({ temples, records, onTempleSelect }: Props) {
  const [query, setQuery] = useState('');
  const [filterPref, setFilterPref] = useState('');
  const [filterVisited, setFilterVisited] = useState<'all' | 'visited' | 'unvisited'>('all');

  const prefectures = useMemo(() => getPrefectures(temples), [temples]);

  const filtered = useMemo(() => {
    return temples.filter(t => {
      const isVisited = records[t.id]?.stamped;
      if (filterPref && t.prefecture !== filterPref) return false;
      if (filterVisited === 'visited' && !isVisited) return false;
      if (filterVisited === 'unvisited' && isVisited) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          t.prefecture.includes(q) ||
          t.city.includes(q) ||
          t.address.includes(q) ||
          String(t.id).includes(q)
        );
      }
      return true;
    });
  }, [temples, records, filterPref, filterVisited, query]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* 検索・フィルタバー */}
      <div className="p-3 border-b space-y-2" style={{ borderColor: 'oklch(0.85 0.015 75)', background: 'oklch(0.97 0.012 85)' }}>
        {/* 検索 */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'oklch(0.65 0.01 60)' }} />
          <input
            type="text"
            placeholder="都道府県・市区町村で検索..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-sm outline-none"
            style={{
              background: 'oklch(0.99 0.008 85)',
              border: '1px solid oklch(0.85 0.015 75)',
              color: 'oklch(0.18 0.01 60)',
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          />
        </div>

        {/* フィルタ */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterPref}
            onChange={e => setFilterPref(e.target.value)}
            className="flex-1 text-xs py-1.5 px-2 rounded-sm outline-none"
            style={{
              background: 'oklch(0.99 0.008 85)',
              border: '1px solid oklch(0.85 0.015 75)',
              color: 'oklch(0.18 0.01 60)',
              fontFamily: "'Noto Sans JP', sans-serif",
              minWidth: '120px',
            }}
          >
            <option value="">すべての都道府県</option>
            {prefectures.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <div className="flex rounded-sm overflow-hidden" style={{ border: '1px solid oklch(0.85 0.015 75)' }}>
            {([
              { value: 'all', label: 'すべて' },
              { value: 'visited', label: '参拝済み' },
              { value: 'unvisited', label: '未参拝' },
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterVisited(opt.value)}
                className="px-2.5 py-1.5 text-xs transition-colors"
                style={{
                  background: filterVisited === opt.value ? 'oklch(0.52 0.22 28)' : 'oklch(0.99 0.008 85)',
                  color: filterVisited === opt.value ? 'oklch(0.98 0 0)' : 'oklch(0.45 0.01 60)',
                  border: 'none',
                  fontFamily: "'Noto Sans JP', sans-serif",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: 'oklch(0.55 0.01 60)' }}>
          {filtered.length} 件 / 全{temples.length}件
        </p>
      </div>

      {/* リスト */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map(temple => {
          const record = records[temple.id];
          const isVisited = record?.stamped;

          return (
            <button
              key={temple.id}
              onClick={() => onTempleSelect(temple)}
              className="w-full text-left px-4 py-3 border-b flex items-center gap-3 transition-colors hover:bg-opacity-60"
              style={{
                borderColor: 'oklch(0.90 0.010 75)',
                background: isVisited ? 'oklch(0.98 0.008 30)' : 'oklch(0.99 0.008 85)',
              }}
            >
              {/* 参拝状態アイコン */}
              <div className="flex-shrink-0">
                {isVisited ? (
                  <CheckCircle size={20} style={{ color: 'oklch(0.52 0.22 28)' }} />
                ) : (
                  <Circle size={20} style={{ color: 'oklch(0.75 0.01 60)' }} />
                )}
              </div>

              {/* お寺情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'oklch(0.55 0.01 60)' }}>No.{temple.id}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{
                    background: 'oklch(0.93 0.018 80)',
                    color: 'oklch(0.45 0.01 60)',
                  }}>
                    {temple.prefecture}
                  </span>
                </div>
                <p className="font-medium text-sm mt-0.5 truncate" style={{
                  fontFamily: "'Noto Serif JP', serif",
                  color: isVisited ? 'oklch(0.40 0.20 28)' : 'oklch(0.18 0.01 60)',
                }}>
                  {temple.city} 満願寺
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'oklch(0.60 0.01 60)' }}>
                  {temple.address}
                </p>
                {record?.memo && (
                  <p className="text-xs mt-0.5 italic truncate" style={{ color: 'oklch(0.52 0.22 28)' }}>
                    「{record.memo}」
                  </p>
                )}
              </div>

              {/* 参拝日 */}
              {record?.visitedAt && (
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs" style={{ color: 'oklch(0.52 0.22 28)', fontFamily: "'Noto Serif JP', serif" }}>
                    {new Date(record.visitedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span style={{ fontSize: '40px', color: 'oklch(0.80 0.015 75)' }}>寺</span>
            <p className="text-sm" style={{ color: 'oklch(0.55 0.01 60)' }}>該当するお寺が見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}
