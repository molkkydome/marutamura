/**
 * StampDialog — 参拝記録ダイアログ（拡張版）
 * Design: 和紙と墨
 *
 * 機能:
 * - GPS位置確認（半径100m以内でのみ押印可能）
 * - 写真添付（Base64でローカルストレージ保存）
 * - 参拝日・書き置きメモ
 */

import { useState, useEffect, useRef } from 'react';
import { Temple, TempleRecord, saveRecord, deleteRecord, calcDistance } from '@/lib/temples';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Trash2, MapPin, Camera, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const STAMP_SEAL = "https://private-us-east-1.manuscdn.com/sessionFile/sEq68l7NJE3FBHhhULN4Q1/sandbox/UsPwNJqx0UrEwuuQL6Gbjn-img-3_1771778455000_na1fn_bWFuZ2Fuamktc3RhbXAtc2VhbA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvc0VxNjhsN05KRTNGQkhoaFVMTjRRMS9zYW5kYm94L1VzUHdOSnF4MFVyRXd1dVFMNkdiam4taW1nLTNfMTc3MTc3ODQ1NTAwMF9uYTFmbl9iV0Z1WjJGdWFta3RjM1JoYlhBdGMyVmhiQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=px41N2JmidduP9kPXrb1wjhu1C8Qp6cpVDc621TPQ8loc1aUj8HmtATFm9qEZK3-RWKt0gEX2aUtSUGsUbn7~8xovvC2re3nY3TtCX8cYa1nrWwJWU2VXglclDCmm10in~~I-L9IcmyWh6QwDVF8Ruk2aztunRxpoG7~VGBgqGCSK91u2UAdUmkR6l~FbGChJZzjHLIe6UsZLwgfMxd0Mcgz~WB~Njt~EFuJDfH1PZyKy3jT-x1gM~2ZvvWatDum1XRHfNFZaMTMCQZKJewCe0nOyD3Lhsnkfo70r1aDbm9DmjH0eDolzBYSSpENuVSo0fQmapBWzuF0GSTUw4d0Eg__";

const STAMP_RADIUS_M = 100; // 押印可能な半径（メートル）

type GpsStatus = 'idle' | 'checking' | 'near' | 'far' | 'denied' | 'error';

interface Props {
  temple: Temple;
  record?: TempleRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordUpdate: () => void;
}

export default function StampDialog({ temple, record, open, onOpenChange, onRecordUpdate }: Props) {
  const [memo, setMemo] = useState('');
  const [visitedAt, setVisitedAt] = useState('');
  const [isStamped, setIsStamped] = useState(false);
  const [showStampAnim, setShowStampAnim] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ダイアログが開いたときに既存データを読み込む
  useEffect(() => {
    if (open) {
      setMemo(record?.memo ?? '');
      setVisitedAt(record?.visitedAt ? record.visitedAt.split('T')[0] : new Date().toISOString().split('T')[0]);
      setIsStamped(record?.stamped ?? false);
      setShowStampAnim(false);
      setGpsStatus('idle');
      setDistanceM(null);
      setPhoto(record?.photo);
    }
  }, [open, record]);

  // GPS位置確認
  const checkGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = calcDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          temple.lat,
          temple.lng
        ) * 1000; // km → m
        setDistanceM(Math.round(dist));
        if (dist <= STAMP_RADIUS_M) {
          setGpsStatus('near');
        } else {
          setGpsStatus('far');
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
        } else {
          setGpsStatus('error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // スタンプ押印（GPS確認後のみ）
  const handleStamp = () => {
    if (isStamped) return;
    if (gpsStatus !== 'near') {
      toast.error('お寺の近く（半径100m以内）でのみ押印できます', {
        description: 'まず「現在地を確認」ボタンを押してください',
      });
      return;
    }
    setShowStampAnim(true);
    setIsStamped(true);
    setTimeout(() => setShowStampAnim(false), 600);
    toast.success('御朱印を押しました！');
  };

  // 写真選択
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('写真のサイズは5MB以下にしてください');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const newRecord: TempleRecord = {
      templeId: temple.id,
      visitedAt: visitedAt ? new Date(visitedAt).toISOString() : new Date().toISOString(),
      memo,
      stamped: isStamped,
      photo,
    };
    saveRecord(newRecord);
    onRecordUpdate();
    onOpenChange(false);
    toast.success(`${temple.city} 満願寺への参拝を記録しました`);
  };

  const handleDelete = () => {
    deleteRecord(temple.id);
    onRecordUpdate();
    onOpenChange(false);
    toast.info('参拝記録を削除しました');
  };

  // GPS状態に応じたUI
  const gpsButton = () => {
    if (gpsStatus === 'checking') {
      return (
        <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs" style={{ background: 'oklch(0.93 0.018 80)', color: 'oklch(0.55 0.01 60)', border: '1px solid oklch(0.85 0.015 75)' }}>
          <Loader2 size={12} className="animate-spin" /> 確認中...
        </button>
      );
    }
    if (gpsStatus === 'near') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs" style={{ background: 'oklch(0.92 0.05 145)', color: 'oklch(0.35 0.12 145)', border: '1px solid oklch(0.80 0.08 145)' }}>
          <CheckCircle2 size={12} /> 境内にいます（{distanceM}m）
        </div>
      );
    }
    if (gpsStatus === 'far') {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs" style={{ background: 'oklch(0.96 0.02 28)', color: 'oklch(0.52 0.22 28)', border: '1px solid oklch(0.85 0.08 28)' }}>
            <AlertCircle size={12} /> お寺まで約{distanceM !== null ? (distanceM >= 1000 ? `${(distanceM/1000).toFixed(1)}km` : `${distanceM}m`) : '—'}
          </div>
          <button onClick={checkGps} className="text-xs underline text-left" style={{ color: 'oklch(0.55 0.01 60)', background: 'none', border: 'none' }}>再確認する</button>
        </div>
      );
    }
    if (gpsStatus === 'denied') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs" style={{ background: 'oklch(0.96 0.02 28)', color: 'oklch(0.52 0.22 28)', border: '1px solid oklch(0.85 0.08 28)' }}>
          <AlertCircle size={12} /> 位置情報の許可が必要です
        </div>
      );
    }
    if (gpsStatus === 'error') {
      return (
        <button onClick={checkGps} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs" style={{ background: 'oklch(0.96 0.02 28)', color: 'oklch(0.52 0.22 28)', border: '1px solid oklch(0.85 0.08 28)' }}>
          <AlertCircle size={12} /> エラー（再試行）
        </button>
      );
    }
    // idle
    return (
      <button onClick={checkGps} className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs transition-opacity hover:opacity-80" style={{ background: 'oklch(0.93 0.018 80)', color: 'oklch(0.35 0.01 60)', border: '1px solid oklch(0.85 0.015 75)' }}>
        <MapPin size={12} /> 現在地を確認する
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm mx-auto rounded-sm p-0 overflow-hidden"
        style={{
          background: 'oklch(0.99 0.008 85)',
          border: '1px solid oklch(0.85 0.015 75)',
          fontFamily: "'Noto Sans JP', sans-serif",
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* ヘッダー */}
        <DialogHeader className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid oklch(0.90 0.010 75)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'oklch(0.93 0.018 80)', color: 'oklch(0.45 0.01 60)' }}>
              No.{temple.id}
            </span>
            <span className="text-xs" style={{ color: 'oklch(0.55 0.01 60)' }}>{temple.prefecture}</span>
          </div>
          <DialogTitle style={{ fontFamily: "'Noto Serif JP', serif", color: 'oklch(0.18 0.01 60)', fontSize: '18px' }}>
            {temple.city} 満願寺
          </DialogTitle>
          <p className="text-xs mt-1" style={{ color: 'oklch(0.60 0.01 60)' }}>
            〒{temple.postal} {temple.address}
          </p>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* GPS確認 + スタンプエリア */}
          <div className="flex flex-col items-center gap-3">
            {/* GPS状態 */}
            {!isStamped && (
              <div className="w-full">
                <p className="text-xs mb-1.5" style={{ color: 'oklch(0.45 0.01 60)' }}>
                  押印するにはお寺の半径100m以内にいる必要があります
                </p>
                {gpsButton()}
              </div>
            )}

            {/* スタンプ */}
            <div
              className="relative w-28 h-28 flex items-center justify-center rounded-sm select-none"
              style={{
                background: 'oklch(0.96 0.012 85)',
                border: `2px ${isStamped ? 'solid oklch(0.52 0.22 28)' : 'dashed oklch(0.80 0.015 75)'}`,
                cursor: (!isStamped && gpsStatus === 'near') ? 'pointer' : 'default',
                opacity: (!isStamped && gpsStatus !== 'near') ? 0.5 : 1,
              }}
              onClick={handleStamp}
            >
              {isStamped ? (
                <div className={showStampAnim ? 'stamp-animation' : ''}>
                  <img
                    src={STAMP_SEAL}
                    alt="御朱印"
                    className="w-24 h-24 object-contain"
                    style={{ filter: 'drop-shadow(0 2px 6px oklch(0.52 0.22 28 / 0.4))' }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span style={{ fontSize: '32px', color: gpsStatus === 'near' ? 'oklch(0.52 0.22 28)' : 'oklch(0.80 0.015 75)' }}>寺</span>
                  <span className="text-xs text-center" style={{ color: gpsStatus === 'near' ? 'oklch(0.52 0.22 28)' : 'oklch(0.65 0.01 60)', fontSize: '10px' }}>
                    {gpsStatus === 'near' ? 'タップして押印' : '位置確認が必要'}
                  </span>
                </div>
              )}

              {/* リップルエフェクト */}
              {showStampAnim && (
                <div
                  className="stamp-ripple absolute inset-0 rounded-sm"
                  style={{ border: '2px solid oklch(0.52 0.22 28)', pointerEvents: 'none' }}
                />
              )}
            </div>

            {isStamped && (
              <button
                onClick={() => setIsStamped(false)}
                className="text-xs underline"
                style={{ color: 'oklch(0.65 0.01 60)', background: 'none', border: 'none' }}
              >
                スタンプを取り消す
              </button>
            )}
          </div>

          {/* 参拝日 */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'oklch(0.40 0.01 60)' }}>
              参拝日
            </label>
            <input
              type="date"
              value={visitedAt}
              onChange={e => setVisitedAt(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-sm outline-none"
              style={{
                background: 'oklch(0.97 0.008 85)',
                border: '1px solid oklch(0.85 0.015 75)',
                color: 'oklch(0.18 0.01 60)',
                fontFamily: "'Noto Sans JP', sans-serif",
              }}
            />
          </div>

          {/* 写真添付 */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'oklch(0.40 0.01 60)' }}>
              参拝写真
            </label>
            {photo ? (
              <div className="relative rounded-sm overflow-hidden" style={{ border: '1px solid oklch(0.85 0.015 75)' }}>
                <img src={photo} alt="参拝写真" className="w-full h-32 object-cover" />
                <button
                  onClick={() => setPhoto(undefined)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'oklch(0.18 0.01 60 / 0.7)', color: 'white', border: 'none' }}
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-sm flex flex-col items-center gap-1.5 transition-opacity hover:opacity-80"
                style={{
                  background: 'oklch(0.97 0.008 85)',
                  border: '2px dashed oklch(0.80 0.015 75)',
                  color: 'oklch(0.55 0.01 60)',
                }}
              >
                <Camera size={20} style={{ color: 'oklch(0.65 0.01 60)' }} />
                <span className="text-xs">写真を追加する</span>
                <span className="text-xs" style={{ color: 'oklch(0.70 0.01 60)' }}>5MB以下のJPEG/PNG</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>

          {/* 書き置き（メモ） */}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'oklch(0.40 0.01 60)' }}>
              書き置き（メモ）
            </label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="参拝の感想、気づきなどを記録しましょう..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-sm outline-none resize-none"
              style={{
                background: 'oklch(0.97 0.008 85)',
                border: '1px solid oklch(0.85 0.015 75)',
                color: 'oklch(0.18 0.01 60)',
                fontFamily: "'Noto Sans JP', sans-serif",
                lineHeight: '1.7',
              }}
            />
          </div>

          {/* ボタン */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-sm text-sm font-bold transition-opacity hover:opacity-80"
              style={{
                background: 'oklch(0.52 0.22 28)',
                color: 'oklch(0.98 0 0)',
                fontFamily: "'Noto Serif JP', serif",
                border: 'none',
              }}
            >
              記録を保存
            </button>
            {record && (
              <button
                onClick={handleDelete}
                className="px-3 py-2.5 rounded-sm transition-opacity hover:opacity-80"
                style={{
                  background: 'oklch(0.93 0.018 80)',
                  color: 'oklch(0.55 0.01 60)',
                  border: '1px solid oklch(0.85 0.015 75)',
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
