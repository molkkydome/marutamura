/**
 * MapView — 地図ビュー
 * Design: 和紙と墨 — Google Maps で77ヶ寺を表示
 * 参拝済み：朱色ピン / 未参拝：グレーピン
 */

import { useEffect, useRef, useState } from 'react';
import { Temple, TempleRecord } from '@/lib/temples';
import { MapView as GoogleMapView } from '@/components/Map';

interface Props {
  temples: Temple[];
  records: Record<number, TempleRecord>;
  onTempleSelect: (temple: Temple) => void;
}

export default function MapView({ temples, records, onTempleSelect }: Props) {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [selectedInfo, setSelectedInfo] = useState<Temple | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    mapInstanceRef.current = map;
    setMapReady(true);
  };

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || temples.length === 0) return;
    const map = mapInstanceRef.current;

    // 既存マーカーを削除
    markersRef.current.forEach(m => {
      if (m && typeof (m as unknown as google.maps.marker.AdvancedMarkerElement).map !== 'undefined') {
        (m as unknown as google.maps.marker.AdvancedMarkerElement).map = null;
      } else {
        (m as google.maps.Marker).setMap(null);
      }
    });
    markersRef.current = [];

      temples.forEach(temple => {
        const isVisited = records[temple.id]?.stamped;

        // AdvancedMarkerElement 用のカスタムDOM
        const pin = document.createElement('div');
        pin.style.cssText = [
          `width:${isVisited ? 18 : 12}px`,
          `height:${isVisited ? 18 : 12}px`,
          `border-radius:50%`,
          `background:${isVisited ? '#C0392B' : '#8B8680'}`,
          `border:${isVisited ? '2px solid #8B1A0A' : '1px solid #5A5550'}`,
          `opacity:${isVisited ? '0.9' : '0.6'}`,
          `cursor:pointer`,
          `box-shadow:${isVisited ? '0 1px 4px rgba(192,57,43,0.5)' : 'none'}`,
        ].join(';');

        const marker = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: temple.lat, lng: temple.lng },
          map,
          title: `${temple.prefecture} ${temple.city} 満願寺`,
          content: pin,
        });

        marker.addListener('click', () => {
          setSelectedInfo(temple);
        });

        markersRef.current.push(marker as unknown as google.maps.Marker);
      });
  }, [mapReady, temples, records]);

  const visitedCount = Object.values(records).filter(r => r.stamped).length;

  return (
    <div className="relative flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* 地図凡例 */}
      <div className="absolute top-3 left-3 z-10 flex gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs shadow-sm" style={{
          background: 'oklch(0.99 0.008 85 / 0.95)',
          border: '1px solid oklch(0.85 0.015 75)',
          color: 'oklch(0.18 0.01 60)',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}>
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#C0392B' }} />
          参拝済み ({visitedCount})
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs shadow-sm" style={{
          background: 'oklch(0.99 0.008 85 / 0.95)',
          border: '1px solid oklch(0.85 0.015 75)',
          color: 'oklch(0.18 0.01 60)',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}>
          <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#8B8680' }} />
          未参拝 ({temples.length - visitedCount})
        </div>
      </div>

      {/* Google Maps */}
      <GoogleMapView
        onMapReady={handleMapReady}
        initialCenter={{ lat: 36.5, lng: 136.5 }}
        initialZoom={5}
        className="w-full h-full"
      />

      {/* 選択されたお寺の情報パネル */}
      {selectedInfo && (
        <div
          className="absolute bottom-4 left-4 right-4 rounded-sm p-4 shadow-lg"
          style={{
            background: 'oklch(0.99 0.008 85)',
            border: '1px solid oklch(0.85 0.015 75)',
            borderLeft: '4px solid oklch(0.52 0.22 28)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-1.5 py-0.5 rounded" style={{
                  background: 'oklch(0.93 0.018 80)',
                  color: 'oklch(0.45 0.01 60)',
                  fontSize: '10px',
                }}>
                  No.{selectedInfo.id}
                </span>
                {records[selectedInfo.id]?.stamped && (
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{
                    background: 'oklch(0.96 0.02 28)',
                    color: 'oklch(0.52 0.22 28)',
                    fontSize: '10px',
                  }}>
                    参拝済み
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm" style={{ fontFamily: "'Noto Serif JP', serif", color: 'oklch(0.18 0.01 60)' }}>
                {selectedInfo.prefecture} {selectedInfo.city} 満願寺
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.01 60)' }}>
                〒{selectedInfo.postal} {selectedInfo.address}
              </p>
              {records[selectedInfo.id]?.memo && (
                <p className="text-xs mt-1 italic" style={{ color: 'oklch(0.45 0.01 60)' }}>
                  「{records[selectedInfo.id].memo}」
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onTempleSelect(selectedInfo)}
                className="px-3 py-1.5 rounded-sm text-xs font-bold transition-opacity hover:opacity-80"
                style={{
                  background: 'oklch(0.52 0.22 28)',
                  color: 'oklch(0.98 0 0)',
                  fontFamily: "'Noto Serif JP', serif",
                  border: 'none',
                }}
              >
                {records[selectedInfo.id]?.stamped ? '記録を見る' : '参拝する'}
              </button>
              <button
                onClick={() => setSelectedInfo(null)}
                className="px-3 py-1.5 rounded-sm text-xs transition-opacity hover:opacity-80"
                style={{
                  background: 'oklch(0.93 0.018 80)',
                  color: 'oklch(0.45 0.01 60)',
                  border: '1px solid oklch(0.85 0.015 75)',
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
