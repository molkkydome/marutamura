/**
 * ShareDialog — SNS共有ダイアログ
 * Design: 和紙と墨
 *
 * 機能:
 * - Canvas で進捗画像を生成（77ヶ寺のスタンプグリッド）
 * - テキスト共有（達成数 + ハッシュタグ）
 * - Web Share API / Twitter / LINE
 */

import { useEffect, useRef, useState } from 'react';
import { Temple, TempleRecord } from '@/lib/temples';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Share2, Download, Twitter, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  temples: Temple[];
  records: Record<number, TempleRecord>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareDialog({ temples, records, open, onOpenChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');

  const visitedCount = Object.values(records).filter(r => r.stamped).length;
  const totalCount = temples.length;
  const progressPct = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  const shareText = `満願寺 御朱印帳\n全国77ヶ所中 ${visitedCount}ヶ所参拝達成！（${progressPct}%）\n#満願寺 #御朱印 #寺巡り`;

  // Canvas で進捗画像を生成
  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800;
    const H = 500;
    canvas.width = W;
    canvas.height = H;

    // 背景（和紙色）
    ctx.fillStyle = '#F5F0E8';
    ctx.fillRect(0, 0, W, H);

    // 和紙テクスチャ風のノイズ（薄いライン）
    ctx.strokeStyle = 'rgba(180, 160, 120, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < H; i += 8) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(W, i);
      ctx.stroke();
    }

    // 左側：朱色の縦帯
    const gradient = ctx.createLinearGradient(0, 0, 120, 0);
    gradient.addColorStop(0, '#8B1A0A');
    gradient.addColorStop(1, '#C0392B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 110, H);

    // 縦帯のタイトル（縦書き風）
    ctx.save();
    ctx.translate(55, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = 'rgba(255, 245, 235, 0.95)';
    ctx.font = 'bold 22px "Noto Serif JP", serif';
    ctx.textAlign = 'center';
    ctx.fillText('満願寺 御朱印帳', 0, 0);
    ctx.restore();

    // メインエリア（右側）
    const mx = 130;
    const mw = W - mx - 30;

    // タイトル
    ctx.fillStyle = '#2C1810';
    ctx.font = 'bold 28px "Noto Serif JP", serif';
    ctx.textAlign = 'left';
    ctx.fillText('全国七十七ヶ寺 巡礼記録', mx, 55);

    // 達成数テキスト
    ctx.fillStyle = '#C0392B';
    ctx.font = 'bold 52px "Noto Serif JP", serif';
    ctx.fillText(`${visitedCount}`, mx, 130);
    ctx.fillStyle = '#5A4A3A';
    ctx.font = '20px "Noto Serif JP", serif';
    ctx.fillText(`/ ${totalCount} ヶ寺参拝達成`, mx + 75, 130);

    // 達成率
    ctx.fillStyle = '#8B5A3A';
    ctx.font = '16px "Noto Sans JP", sans-serif';
    ctx.fillText(`達成率 ${progressPct}%`, mx, 160);

    // プログレスバー
    const barY = 180;
    const barH = 12;
    const barW = mw;
    // 背景
    ctx.fillStyle = '#E8DDD0';
    ctx.beginPath();
    ctx.roundRect(mx, barY, barW, barH, 6);
    ctx.fill();
    // 進捗
    if (visitedCount > 0) {
      const progressGrad = ctx.createLinearGradient(mx, 0, mx + barW, 0);
      progressGrad.addColorStop(0, '#C0392B');
      progressGrad.addColorStop(1, '#E74C3C');
      ctx.fillStyle = progressGrad;
      ctx.beginPath();
      ctx.roundRect(mx, barY, barW * (visitedCount / totalCount), barH, 6);
      ctx.fill();
    }

    // スタンプグリッド（77個の小さな円）
    const gridStartX = mx;
    const gridStartY = 215;
    const cols = 11;
    const cellSize = Math.floor(mw / cols);
    const circleR = Math.floor(cellSize * 0.35);

    temples.forEach((temple, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = gridStartX + col * cellSize + cellSize / 2;
      const cy = gridStartY + row * (cellSize * 0.9) + cellSize / 2;
      const isVisited = records[temple.id]?.stamped;

      if (isVisited) {
        // 参拝済み：朱色の円
        ctx.fillStyle = '#C0392B';
        ctx.beginPath();
        ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
        ctx.fill();
        // 「寺」の文字
        ctx.fillStyle = 'rgba(255, 245, 235, 0.95)';
        ctx.font = `bold ${circleR}px "Noto Serif JP", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('寺', cx, cy);
      } else {
        // 未参拝：薄いグレーの円
        ctx.strokeStyle = '#C8B8A0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // フッター
    ctx.fillStyle = '#8B7A6A';
    ctx.font = '13px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('#満願寺 #御朱印 #寺巡り', W - 30, H - 20);

    // 日付
    ctx.textAlign = 'left';
    ctx.fillText(new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }), mx, H - 20);

    setImageDataUrl(canvas.toDataURL('image/png'));
  }, [open, temples, records, visitedCount, totalCount, progressPct]);

  // 画像ダウンロード
  const handleDownload = () => {
    if (!imageDataUrl) return;
    const a = document.createElement('a');
    a.href = imageDataUrl;
    a.download = `満願寺御朱印帳_${visitedCount}ヶ寺達成.png`;
    a.click();
    toast.success('画像を保存しました');
  };

  // Twitter/X シェア
  const handleTwitterShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(shareText);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  // Web Share API
  const handleNativeShare = async () => {
    if (!navigator.share) {
      // フォールバック: テキストをコピー
      await navigator.clipboard.writeText(shareText + '\n' + window.location.href);
      toast.success('テキストをコピーしました');
      return;
    }
    try {
      // 画像をBlobに変換
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const file = new File([blob], '満願寺御朱印帳.png', { type: 'image/png' });

      await navigator.share({
        title: '満願寺 御朱印帳',
        text: shareText,
        files: [file],
      });
    } catch {
      // ファイル共有不可の場合はテキストのみ
      try {
        await navigator.share({
          title: '満願寺 御朱印帳',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // キャンセルは無視
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md mx-auto rounded-sm p-0 overflow-hidden"
        style={{
          background: 'oklch(0.99 0.008 85)',
          border: '1px solid oklch(0.85 0.015 75)',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        <DialogHeader className="px-5 pt-5 pb-3" style={{ borderBottom: '1px solid oklch(0.90 0.010 75)' }}>
          <DialogTitle style={{ fontFamily: "'Noto Serif JP', serif", color: 'oklch(0.18 0.01 60)', fontSize: '18px' }}>
            巡礼記録をシェアする
          </DialogTitle>
          <p className="text-xs mt-1" style={{ color: 'oklch(0.55 0.01 60)' }}>
            {totalCount}ヶ寺中 <strong style={{ color: 'oklch(0.52 0.22 28)' }}>{visitedCount}ヶ寺</strong> 参拝達成（{progressPct}%）
          </p>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4">
          {/* プレビュー画像 */}
          <div className="rounded-sm overflow-hidden" style={{ border: '1px solid oklch(0.85 0.015 75)' }}>
            <canvas ref={canvasRef} className="w-full h-auto" style={{ display: imageDataUrl ? 'none' : 'block' }} />
            {imageDataUrl && (
              <img src={imageDataUrl} alt="進捗画像" className="w-full h-auto" />
            )}
          </div>

          {/* シェアテキストプレビュー */}
          <div className="px-3 py-2.5 rounded-sm" style={{ background: 'oklch(0.96 0.012 85)', border: '1px solid oklch(0.88 0.015 75)' }}>
            <p className="text-xs whitespace-pre-line" style={{ color: 'oklch(0.35 0.01 60)', lineHeight: '1.8' }}>
              {shareText}
            </p>
          </div>

          {/* シェアボタン群 */}
          <div className="grid grid-cols-3 gap-2">
            {/* 画像保存 */}
            <button
              onClick={handleDownload}
              className="flex flex-col items-center gap-1.5 py-3 rounded-sm transition-opacity hover:opacity-80"
              style={{
                background: 'oklch(0.93 0.018 80)',
                border: '1px solid oklch(0.85 0.015 75)',
                color: 'oklch(0.35 0.01 60)',
              }}
            >
              <Download size={18} />
              <span className="text-xs">画像を保存</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={handleTwitterShare}
              className="flex flex-col items-center gap-1.5 py-3 rounded-sm transition-opacity hover:opacity-80"
              style={{
                background: 'oklch(0.15 0.01 60)',
                border: '1px solid oklch(0.20 0.01 60)',
                color: 'oklch(0.98 0 0)',
              }}
            >
              <X size={18} />
              <span className="text-xs">X でシェア</span>
            </button>

            {/* ネイティブシェア / コピー */}
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 py-3 rounded-sm transition-opacity hover:opacity-80"
              style={{
                background: 'oklch(0.52 0.22 28)',
                border: 'none',
                color: 'oklch(0.98 0 0)',
              }}
            >
              <Share2 size={18} />
              <span className="text-xs">
                {'share' in navigator ? 'シェア' : 'コピー'}
              </span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
