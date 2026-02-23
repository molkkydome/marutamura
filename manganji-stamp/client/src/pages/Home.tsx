/**
 * 満願寺 御朱印帳 — メインページ
 * Design: 和紙と墨 (Washi & Sumi)
 * Layout: タブ切り替え（御朱印帳 / 地図 / 一覧）
 */

import { useEffect, useState, useCallback } from 'react';
import { Temple, TempleRecord, getRecords, getVisitedCount } from '@/lib/temples';
import GoshuinchoView from '@/components/GoshuinchoView';
import MapView from '@/components/MapView';
import TempleListView from '@/components/TempleListView';
import StampDialog from '@/components/StampDialog';
import ShareDialog from '@/components/ShareDialog';
import { BookOpen, Map, List, Share2 } from 'lucide-react';

type Tab = 'goshuincho' | 'map' | 'list';

export default function Home() {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [records, setRecords] = useState<Record<number, TempleRecord>>({});
  const [activeTab, setActiveTab] = useState<Tab>('goshuincho');
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [isStampDialogOpen, setIsStampDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // データ読み込み
  useEffect(() => {
    fetch('/temples.json')
      .then(r => r.json())
      .then((data: Temple[]) => setTemples(data));
    setRecords(getRecords());
  }, []);

  const handleRecordUpdate = useCallback(() => {
    setRecords(getRecords());
  }, []);

  const handleTempleSelect = useCallback((temple: Temple) => {
    setSelectedTemple(temple);
    setIsStampDialogOpen(true);
  }, []);

  const visitedCount = getVisitedCount(records);
  const totalCount = temples.length;
  const progressPct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.52 0.22 28)' }}>
              <span className="text-white text-xs font-bold" style={{ fontFamily: "'Noto Serif JP', serif" }}>満</span>
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ fontFamily: "'Noto Serif JP', serif", color: 'oklch(0.18 0.01 60)' }}>
                満願寺 御朱印帳
              </h1>
              <p className="text-xs" style={{ color: 'oklch(0.52 0.22 28)' }}>全国七十七ヶ寺巡礼</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* シェアボタン */}
            <button
              onClick={() => setIsShareDialogOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs transition-opacity hover:opacity-80"
              style={{
                background: 'oklch(0.96 0.02 28)',
                color: 'oklch(0.52 0.22 28)',
                border: '1px solid oklch(0.85 0.08 28)',
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            >
              <Share2 size={13} />
              <span>シェア</span>
            </button>

            {/* 進捗表示 */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs" style={{ color: 'oklch(0.45 0.01 60)' }}>参拝済み</div>
                <div className="text-sm font-bold" style={{ fontFamily: "'Noto Serif JP', serif", color: 'oklch(0.52 0.22 28)' }}>
                  {visitedCount} <span className="text-xs font-normal" style={{ color: 'oklch(0.45 0.01 60)' }}>/ {totalCount}</span>
                </div>
              </div>
              {/* 円形プログレス */}
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(0.85 0.015 75)" strokeWidth="2.5" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="oklch(0.52 0.22 28)" strokeWidth="2.5"
                    strokeDasharray={`${progressPct} ${100 - progressPct}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: 'oklch(0.52 0.22 28)', fontFamily: "'Noto Serif JP', serif" }}>
                  {progressPct}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="container pb-0">
          <div className="flex border-t border-border">
            {([
              { key: 'goshuincho', label: '御朱印帳', icon: BookOpen },
              { key: 'map', label: '地図', icon: Map },
              { key: 'list', label: '一覧', icon: List },
            ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm transition-colors relative"
                style={{
                  color: activeTab === key ? 'oklch(0.52 0.22 28)' : 'oklch(0.55 0.01 60)',
                  fontFamily: activeTab === key ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif",
                  fontWeight: activeTab === key ? 700 : 400,
                  background: 'transparent',
                  border: 'none',
                }}
              >
                <Icon size={15} />
                <span>{label}</span>
                {activeTab === key && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: 'oklch(0.52 0.22 28)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'goshuincho' && (
          <GoshuinchoView
            temples={temples}
            records={records}
            onTempleSelect={handleTempleSelect}
          />
        )}
        {activeTab === 'map' && (
          <MapView
            temples={temples}
            records={records}
            onTempleSelect={handleTempleSelect}
          />
        )}
        {activeTab === 'list' && (
          <TempleListView
            temples={temples}
            records={records}
            onTempleSelect={handleTempleSelect}
          />
        )}
      </main>

      {/* スタンプダイアログ */}
      {selectedTemple && (
        <StampDialog
          temple={selectedTemple}
          record={records[selectedTemple.id]}
          open={isStampDialogOpen}
          onOpenChange={setIsStampDialogOpen}
          onRecordUpdate={handleRecordUpdate}
        />
      )}

      {/* シェアダイアログ */}
      <ShareDialog
        temples={temples}
        records={records}
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </div>
  );
}
