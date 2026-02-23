/*
 * 管理ページ: スポンサー名の手動更新UI
 * Design Philosophy: 「手紙・便箋」スタイル
 * アクセス: /admin
 */

import { useState } from "react";
import { sponsorPlans, type SponsorPlan } from "@/data/sponsors";

// ローカルストレージキー
const STORAGE_KEY = "petit-sponsor-sponsors";

// ローカルストレージからスポンサーデータを読み込む
function loadSponsors(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // デフォルト: sponsorPlansのデータを使用
  const defaults: Record<string, string[]> = {};
  sponsorPlans.forEach((p) => {
    defaults[p.id] = [...p.sponsors];
  });
  return defaults;
}

// ローカルストレージにスポンサーデータを保存する
function saveSponsors(data: Record<string, string[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function Admin() {
  const [sponsorData, setSponsorData] = useState<Record<string, string[]>>(loadSponsors);
  const [newNames, setNewNames] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const handleAdd = (planId: string) => {
    const name = (newNames[planId] || "").trim();
    if (!name) return;
    const updated = {
      ...sponsorData,
      [planId]: [...(sponsorData[planId] || []), name],
    };
    setSponsorData(updated);
    setNewNames({ ...newNames, [planId]: "" });
    saveSponsors(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemove = (planId: string, index: number) => {
    const updated = {
      ...sponsorData,
      [planId]: sponsorData[planId].filter((_, i) => i !== index),
    };
    setSponsorData(updated);
    saveSponsors(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const plan = (id: string): SponsorPlan =>
    sponsorPlans.find((p) => p.id === id)!;

  return (
    <div className="washi-bg min-h-screen" style={{ maxWidth: "480px", margin: "0 auto" }}>
      {/* ヘッダー */}
      <div
        className="sticky top-0 z-40 px-5 py-4 border-b"
        style={{
          backgroundColor: "rgba(254,249,240,0.95)",
          backdropFilter: "blur(8px)",
          borderColor: "#E8D8C0",
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="handwritten text-xl font-bold" style={{ color: "#5A4A38" }}>
            スポンサー管理
          </h1>
          <a
            href="/"
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "#F0E8D8", color: "#7A6A58" }}
          >
            ← サイトへ戻る
          </a>
        </div>
        {saved && (
          <div
            className="mt-2 text-xs text-center py-1.5 rounded-lg"
            style={{ backgroundColor: "#E8F5E8", color: "#3A7A3A" }}
          >
            ✓ 保存しました
          </div>
        )}
      </div>

      {/* 説明 */}
      <div className="px-5 py-4">
        <div
          className="rounded-xl p-3 text-xs leading-relaxed"
          style={{ backgroundColor: "#FFF5E8", color: "#7A6A58", border: "1px solid #F0D8B8" }}
        >
          <p className="font-bold mb-1" style={{ color: "#C8773A" }}>📝 使い方</p>
          <p>各プランにスポンサー名を追加・削除できます。変更はこのデバイスのブラウザに保存されます。</p>
          <p className="mt-1 text-xs" style={{ color: "#A08060" }}>
            ※ 恒久的に反映するには <code className="px-1 rounded" style={{ backgroundColor: "#F0E0C0" }}>src/data/sponsors.ts</code> の sponsors 配列を直接編集してください。
          </p>
        </div>
      </div>

      {/* プランリスト */}
      <div className="px-5 pb-8 space-y-4">
        {sponsorPlans.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl overflow-hidden border"
            style={{ backgroundColor: p.bgColor, borderColor: p.borderColor }}
          >
            {/* プランヘッダー */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: p.borderColor }}
            >
              <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-contain" />
              <h2
                className="handwritten font-bold text-lg"
                style={{ color: p.tagColor }}
              >
                {p.name}
              </h2>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: p.tagColor, color: "white" }}
              >
                {(sponsorData[p.id] || []).length}人
              </span>
            </div>

            {/* スポンサーリスト */}
            <div className="px-4 py-3">
              {(sponsorData[p.id] || []).length === 0 ? (
                <p className="text-xs italic text-center py-2" style={{ color: "#B0A090" }}>
                  まだスポンサーがいません
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {(sponsorData[p.id] || []).map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                      style={{ backgroundColor: "white", border: `1.5px solid ${p.borderColor}` }}
                    >
                      <span style={{ color: "#5A4A38" }}>{name}</span>
                      <button
                        onClick={() => handleRemove(p.id, i)}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-xs ml-1"
                        style={{ backgroundColor: "#F0D8C8", color: "#C8773A" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 追加フォーム */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNames[p.id] || ""}
                  onChange={(e) =>
                    setNewNames({ ...newNames, [p.id]: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAdd(p.id)}
                  placeholder="スポンサー名を追加"
                  className="form-input flex-1 text-sm"
                  style={{ padding: "8px 12px" }}
                />
                <button
                  onClick={() => handleAdd(p.id)}
                  disabled={!(newNames[p.id] || "").trim()}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    backgroundColor: p.tagColor,
                    color: "white",
                    opacity: !(newNames[p.id] || "").trim() ? 0.5 : 1,
                  }}
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* コードスニペット */}
      <div className="px-5 pb-8">
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#2D2A25", color: "#E8D8B8" }}
        >
          <p className="text-xs mb-2" style={{ color: "#A09080" }}>
            📁 src/data/sponsors.ts に直接書く場合：
          </p>
          <pre className="text-xs leading-relaxed overflow-x-auto" style={{ fontFamily: "monospace" }}>
{`sponsors: [
  "田中さん",
  "山田さん",
  // ← ここに追加
],`}
          </pre>
        </div>
      </div>
    </div>
  );
}
