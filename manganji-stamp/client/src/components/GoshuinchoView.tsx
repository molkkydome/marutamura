/**
 * GoshuinchoView — 御朱印帳ビュー
 * Design: 和紙と墨 — スタンプグリッドで77ヶ寺を表示
 */

import { Temple, TempleRecord } from '@/lib/temples';

const HERO_IMAGE = "https://private-us-east-1.manuscdn.com/sessionFile/sEq68l7NJE3FBHhhULN4Q1/sandbox/UsPwNJqx0UrEwuuQL6Gbjn-img-1_1771778457000_na1fn_bWFuZ2FuamktaGVybw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvc0VxNjhsN05KRTNGQkhoaFVMTjRRMS9zYW5kYm94L1VzUHdOSnF4MFVyRXd1dVFMNkdiam4taW1nLTFfMTc3MTc3ODQ1NzAwMF9uYTFmbl9iV0Z1WjJGdWFta3RhR1Z5YncuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ISXfOHiNMTp8Aw9msT6g5q2WWG-ntdYPcFYqg0KK3~xQhk9eVt7ASYo4oXOP9iw2zMtqlK1-I97R~3oG6t0KytQjGKtaXPbtcO3RHQsfBfq2uJ~U7a1XKGCnfMacJ5TDQc8S41UtjgEbTbqk-yfnORvaYBt6cGLZwt8cnPLDauiGpj17QqW1ynJV3S~i802d2DMK3wVmqYy1RHLAWda2h~l7FIQwS7WjAOFfimth-tWGJ5Xj-GNQdBbT0uGA4DPjE29p9S6jtvZV7tkm7bgeJNbKZQ9D2ZTKrR8PLxX5PXtzTITEQuMEzAgkfn6NFELfZ8At364hQiXIrsdOL7puOA__";

const STAMP_SEAL = "https://private-us-east-1.manuscdn.com/sessionFile/sEq68l7NJE3FBHhhULN4Q1/sandbox/UsPwNJqx0UrEwuuQL6Gbjn-img-3_1771778455000_na1fn_bWFuZ2Fuamktc3RhbXAtc2VhbA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvc0VxNjhsN05KRTNGQkhoaFVMTjRRMS9zYW5kYm94L1VzUHdOSnF4MFVyRXd1dVFMNkdiam4taW1nLTNfMTc3MTc3ODQ1NTAwMF9uYTFmbl9iV0Z1WjJGdWFta3RjM1JoYlhBdGMyVmhiQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=px41N2JmidduP9kPXrb1wjhu1C8Qp6cpVDc621TPQ8loc1aUj8HmtATFm9qEZK3-RWKt0gEX2aUtSUGsUbn7~8xovvC2re3nY3TtCX8cYa1nrWwJWU2VXglclDCmm10in~~I-L9IcmyWh6QwDVF8Ruk2aztunRxpoG7~VGBgqGCSK91u2UAdUmkR6l~FbGChJZzjHLIe6UsZLwgfMxd0Mcgz~WB~Njt~EFuJDfH1PZyKy3jT-x1gM~2ZvvWatDum1XRHfNFZaMTMCQZKJewCe0nOyD3Lhsnkfo70r1aDbm9DmjH0eDolzBYSSpENuVSo0fQmapBWzuF0GSTUw4d0Eg__";

interface Props {
  temples: Temple[];
  records: Record<number, TempleRecord>;
  onTempleSelect: (temple: Temple) => void;
}

// 都道府県ごとにグループ化
function groupByPrefecture(temples: Temple[]): Record<string, Temple[]> {
  return temples.reduce((acc, t) => {
    if (!acc[t.prefecture]) acc[t.prefecture] = [];
    acc[t.prefecture].push(t);
    return acc;
  }, {} as Record<string, Temple[]>);
}

export default function GoshuinchoView({ temples, records, onTempleSelect }: Props) {
  const grouped = groupByPrefecture(temples);
  const prefectures = Object.keys(grouped);

  return (
    <div className="overflow-y-auto h-full" style={{ background: 'oklch(0.97 0.012 85)' }}>
      {/* ヒーローバナー */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="満願寺巡礼"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, oklch(0.18 0.01 60 / 0.3), oklch(0.18 0.01 60 / 0.6))' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs tracking-widest mb-1" style={{ color: 'oklch(0.90 0.02 28)', fontFamily: "'Noto Serif JP', serif" }}>
            全国七十七ヶ寺
          </p>
          <h2 className="text-2xl font-bold" style={{ color: 'oklch(0.98 0 0)', fontFamily: "'Noto Serif JP', serif", textShadow: '0 2px 8px oklch(0.18 0.01 60 / 0.8)' }}>
            満願寺 御朱印帳
          </h2>
          <p className="text-xs mt-1" style={{ color: 'oklch(0.88 0.01 60)' }}>
            お寺をタップしてスタンプを押しましょう
          </p>
        </div>
      </div>

      {/* 都道府県別スタンプグリッド */}
      <div className="p-4 space-y-6 pb-20">
        {prefectures.map(pref => (
          <div key={pref}>
            {/* 都道府県ヘッダー */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: 'oklch(0.85 0.015 75)' }} />
              <span className="text-xs px-3 py-1 rounded-full" style={{
                background: 'oklch(0.93 0.018 80)',
                color: 'oklch(0.45 0.01 60)',
                fontFamily: "'Noto Serif JP', serif",
                border: '1px solid oklch(0.85 0.015 75)',
              }}>
                {pref}
              </span>
              <div className="h-px flex-1" style={{ background: 'oklch(0.85 0.015 75)' }} />
            </div>

            {/* スタンプグリッド */}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {grouped[pref].map(temple => {
                const record = records[temple.id];
                const isVisited = record?.stamped;

                return (
                  <button
                    key={temple.id}
                    onClick={() => onTempleSelect(temple)}
                    className="goshuincho-card rounded-sm p-2 flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 relative overflow-hidden w-full"
                  >
                    {/* 番号バッジ */}
                    <span className="absolute top-1 left-1.5 text-xs" style={{
                      color: isVisited ? 'oklch(0.52 0.22 28)' : 'oklch(0.65 0.01 60)',
                      fontFamily: "'Noto Serif JP', serif",
                      fontSize: '10px',
                    }}>
                      {temple.id}
                    </span>

                    {/* スタンプ / 未参拝 */}
                    <div className="w-12 h-12 flex items-center justify-center mt-1">
                      {isVisited ? (
                        <div className="stamp-animation w-12 h-12">
                          <img
                            src={STAMP_SEAL}
                            alt="御朱印"
                            className="w-full h-full object-contain"
                            style={{ filter: 'drop-shadow(0 1px 3px oklch(0.52 0.22 28 / 0.4))' }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center" style={{
                          borderColor: 'oklch(0.80 0.015 75)',
                          background: 'oklch(0.95 0.008 85)',
                        }}>
                          <span style={{ color: 'oklch(0.75 0.01 60)', fontSize: '18px' }}>寺</span>
                        </div>
                      )}
                    </div>

                    {/* お寺名（市区町村） */}
                    <span className="text-center leading-tight" style={{
                      fontSize: '10px',
                      color: isVisited ? 'oklch(0.40 0.20 28)' : 'oklch(0.45 0.01 60)',
                      fontFamily: isVisited ? "'Noto Serif JP', serif" : "'Noto Sans JP', sans-serif",
                      fontWeight: isVisited ? 700 : 400,
                    }}>
                      {temple.city}
                    </span>

                    {/* 参拝日 */}
                    {record?.visitedAt && (
                      <span style={{ fontSize: '9px', color: 'oklch(0.52 0.22 28)' }}>
                        {new Date(record.visitedAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
