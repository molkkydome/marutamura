/*
 * Design Philosophy: 「手紙・便箋」スタイル
 * - 和紙テクスチャ背景、荷札タグ、スタンプバッジ
 * - Zen Kurenaido (見出し) / Noto Sans JP (本文) / Caveat (数字)
 * - カラー: オレンジブラウン #C8773A / セージグリーン #7A9E7E / クリーム #FEF9F0
 */

import { useState, useEffect, useRef } from "react";
import { sponsorPlans, type SponsorPlan } from "@/data/sponsors";

// ローカルストレージキー（管理ページと共有）
const STORAGE_KEY = "petit-sponsor-sponsors";

// ローカルストレージからスポンサーデータを読み込む
function loadSponsors(): Record<string, string[]> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  const defaults: Record<string, string[]> = {};
  sponsorPlans.forEach((p) => {
    defaults[p.id] = [...p.sponsors];
  });
  return defaults;
}

// ヒーローバナー画像URL
const HERO_IMAGE_URL =
  "https://private-us-east-1.manuscdn.com/sessionFile/TMtHNJuybMW5agjlntD4SZ/sandbox/t32Gdn5s1oZeSw8lyg0EW9-img-1_1771806183000_na1fn_aGVyby1iYW5uZXI.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVE10SE5KdXliTVc1YWdqbG50RDRTWi9zYW5kYm94L3QzMkdkbjVzMW9aZVN3OGx5ZzBFVzktaW1nLTFfMTc3MTgwNjE4MzAwMF9uYTFmbl9hR1Z5YnkxaVlXNXVaWEkucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=an-ED~gCiDIwE4T1XaaqmM16ZmOXlpmvZQxxyo2ierI18lYbkB6CjlbmvPpiGqKCLNtCnnIzv5kHFnwR5GfNxFoaDKWBYfdkRptTjm0QGYmuiukIgNK9dEbhOhSzdd146TXggPb0EH6uJ7dCHhbbXb2htZrHcM3OnsVBFAGuaGB3OcS-HaeeFOC4bYw~6JwPK6JhYP3QVi82qsA4jVh8mNINJkbtQ-4uKcnnB3odKnHUmwZ69XTMq8eTQDQnQ7DZyd-nCKcUtmLz8TKP6GnBu5CmXnsCQ58HznwzuK3h31IuhVW8jXDoF7wYO5H2U5i51l6x6LwPQPdfQuLuM5iYkg__";

const FLOW_IMAGE_URL =
  "https://private-us-east-1.manuscdn.com/sessionFile/TMtHNJuybMW5agjlntD4SZ/sandbox/t32Gdn5s1oZeSw8lyg0EW9-img-2_1771806192000_na1fn_Zmxvdy1pbGx1c3RyYXRpb24.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVE10SE5KdXliTVc1YWdqbG50RDRTWi9zYW5kYm94L3QzMkdkbjVzMW9aZVN3OGx5ZzBFVzktaW1nLTJfMTc3MTgwNjE5MjAwMF9uYTFmbl9abXh2ZHkxcGJHeDFjM1J5WVhScGIyNC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=JwPmJJ3Fnaq-B19tBLFK6SIJ8-gMFG6xbvXi2JubK02IeKckqyKm6N2lFm4AkAkNoT2p6YEn6zkLr6cESUJLRjADsGsnsre9pYrH-UeMKXWrc2owbkolsdqCnCL96xciHeVry0VKmSfupqkp2kOaag~AQ~iZwFh~52bInFRTlZCm3VcCdItmbhKimXhRHJdhiOOAbiGx4LlAR9opmLs2TTR7sK5u88nQbDlClBYQnRg~ij44xcPu0ad~~sa5VaTSltZdsFd3sgIPAOJh-2WfA2YPNYIxIk9LT7J9ZUO3KHFi5IJeGspOlnrDNmohnMJ7C-wTJXLRPd5xzZ8HR2fj~Q__";

// スクロールアニメーション用フック
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function ScrollReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="scroll-reveal"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// 荷札タグコンポーネント
function LuggageTag({ name }: { name: string }) {
  return <span className="luggage-tag text-xs">{name}のおかげです</span>;
}

// プランカードコンポーネント
function PlanCard({
  plan,
  isSelected,
  onSelect,
  currentSponsors,
}: {
  plan: SponsorPlan;
  isSelected: boolean;
  onSelect: () => void;
  currentSponsors: string[];
}) {
  return (
    <div
      className={`plan-card rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
        isSelected ? "selected" : ""
      }`}
      style={{
        backgroundColor: plan.bgColor,
        borderColor: isSelected ? "#C8773A" : plan.borderColor,
        boxShadow: isSelected
          ? "0 8px 24px rgba(200, 119, 58, 0.25)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onClick={onSelect}
    >
      {/* イラスト */}
      <div
        className="relative pt-4 px-4 flex justify-center"
        style={{ height: "140px" }}
      >
        <img
          src={plan.imageUrl}
          alt={plan.name}
          className="h-full object-contain"
          style={{ maxWidth: "130px" }}
        />
        {/* スタンプバッジ */}
        <div
          className="stamp-badge absolute top-2 right-2"
          style={{ borderColor: plan.tagColor, color: plan.tagColor }}
        >
          <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>5</span>
          <span style={{ fontSize: "0.6rem" }}>マルタ</span>
        </div>
      </div>

      {/* テキスト */}
      <div className="p-3 pt-2">
        <h3
          className="handwritten text-center font-bold mb-1"
          style={{ fontSize: "1.1rem", color: plan.tagColor }}
        >
          {plan.name}
        </h3>
        <p
          className="text-center text-xs"
          style={{ color: "#7A6A58", lineHeight: 1.5 }}
        >
          {plan.description}
        </p>

        {/* スポンサー名タグ */}
        {currentSponsors.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1 justify-center">
            {currentSponsors.map((sponsor, i) => (
              <LuggageTag key={i} name={sponsor} />
            ))}
          </div>
        ) : (
          <div className="mt-3 flex justify-center">
            <span
              className="luggage-tag text-xs opacity-50"
              style={{ fontStyle: "italic" }}
            >
              スポンサー募集中
            </span>
          </div>
        )}
      </div>

      {/* 選択インジケーター */}
      {isSelected && (
        <div
          className="py-2 text-center text-sm font-bold"
          style={{
            backgroundColor: "#C8773A",
            color: "white",
            fontFamily: "'Zen Kurenaido', serif",
          }}
        >
          ✓ このプランを選択中
        </div>
      )}
    </div>
  );
}

// 申し込みフォームコンポーネント
function ApplicationForm({
  selectedPlan,
  onClose,
}: {
  selectedPlan: SponsorPlan | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [period, setPeriod] = useState<"early" | "late" | "">("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !period || !selectedPlan) return;
    setSubmitted(true);
  };

  if (submitted) {
    const [year, mon] = month.split("-");
    const periodLabel = period === "early" ? "上旬（1日〜15日）" : "下旬（16日〜月末）";
    return (
      <div className="text-center py-8 px-4">
        <div
          className="stamp-appear mx-auto mb-6 flex items-center justify-center"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: "4px solid #C8773A",
            color: "#C8773A",
            fontSize: "2.5rem",
          }}
        >
          ✓
        </div>
        <h3
          className="handwritten text-2xl font-bold mb-3"
          style={{ color: "#C8773A" }}
        >
          ありがとうございます！
        </h3>
        <p className="text-sm mb-2" style={{ color: "#7A6A58" }}>
          <strong>{name}</strong> さんの申し込みを受け付けました。
        </p>
        <div
          className="text-sm mb-6 p-3 rounded-xl text-left space-y-1"
          style={{ backgroundColor: "#FFF5E8", color: "#7A6A58" }}
        >
          <p>📦 プラン：{selectedPlan?.name}</p>
          <p>📅 期間：{year}年{mon}月 {periodLabel}</p>
          {message && <p>💬 メッセージ：{message}</p>}
        </div>
        <p
          className="text-xs mb-6 p-3 rounded-xl"
          style={{
            backgroundColor: "#F0F8F0",
            color: "#3A7A3A",
            lineHeight: 1.7,
          }}
        >
          マルタの送り先など詳細については、<br />
          運営からご連絡いたします。
        </p>
        <button
          onClick={onClose}
          className="btn-primary"
          style={{ fontSize: "1rem", padding: "12px 28px" }}
        >
          閉じる
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      {/* 選択プラン表示 */}
      {selectedPlan && (
        <div
          className="rounded-xl p-3 flex items-center gap-3"
          style={{
            backgroundColor: selectedPlan.bgColor,
            border: `1.5px solid ${selectedPlan.borderColor}`,
          }}
        >
          <img
            src={selectedPlan.imageUrl}
            alt={selectedPlan.name}
            className="w-12 h-12 object-contain"
          />
          <div>
            <p className="text-xs" style={{ color: "#7A6A58" }}>
              選択中のプラン
            </p>
            <p
              className="handwritten font-bold"
              style={{ color: selectedPlan.tagColor, fontSize: "1.1rem" }}
            >
              {selectedPlan.name}
            </p>
          </div>
          <div
            className="ml-auto stamp-badge"
            style={{
              borderColor: selectedPlan.tagColor,
              color: selectedPlan.tagColor,
              width: "44px",
              height: "44px",
            }}
          >
            <span style={{ fontSize: "1rem", fontWeight: 700 }}>5</span>
            <span style={{ fontSize: "0.55rem" }}>マルタ</span>
          </div>
        </div>
      )}

      {/* お名前 */}
      <div>
        <label
          className="block text-sm font-bold mb-1.5"
          style={{ color: "#5A4A38" }}
        >
          お名前 <span style={{ color: "#C8773A" }}>*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：田中 太郎"
          required
          className="form-input"
        />
      </div>

      {/* 対象月 */}
      <div>
        <label
          className="block text-sm font-bold mb-1.5"
          style={{ color: "#5A4A38" }}
        >
          対象月 <span style={{ color: "#C8773A" }}>*</span>
        </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
          className="form-input"
        />
      </div>

      {/* 期間選択 */}
      <div>
        <label
          className="block text-sm font-bold mb-2"
          style={{ color: "#5A4A38" }}
        >
          期間 <span style={{ color: "#C8773A" }}>*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPeriod("early")}
            className={`rounded-xl p-3 border-2 transition-all text-center ${
              period === "early"
                ? "border-[#C8773A] bg-[#FFF5E8]"
                : "border-[#E8D8C0] bg-white"
            }`}
          >
            <div
              className="handwritten font-bold text-lg"
              style={{ color: period === "early" ? "#C8773A" : "#7A6A58" }}
            >
              上旬
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#9A8A78" }}>
              1日〜15日
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPeriod("late")}
            className={`rounded-xl p-3 border-2 transition-all text-center ${
              period === "late"
                ? "border-[#C8773A] bg-[#FFF5E8]"
                : "border-[#E8D8C0] bg-white"
            }`}
          >
            <div
              className="handwritten font-bold text-lg"
              style={{ color: period === "late" ? "#C8773A" : "#7A6A58" }}
            >
              下旬
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#9A8A78" }}>
              16日〜月末
            </div>
          </button>
        </div>
      </div>

      {/* メッセージ（任意） */}
      <div>
        <label
          className="block text-sm font-bold mb-1.5"
          style={{ color: "#5A4A38" }}
        >
          ひとことメッセージ{" "}
          <span className="text-xs font-normal" style={{ color: "#9A8A78" }}>
            （任意）
          </span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="応援メッセージなど、なんでも！"
          rows={3}
          className="form-input resize-none"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={!name || !period || !selectedPlan}
        className="btn-primary w-full"
        style={{
          opacity: !name || !period || !selectedPlan ? 0.5 : 1,
          cursor: !name || !period || !selectedPlan ? "not-allowed" : "pointer",
        }}
      >
        申し込む 🌸
      </button>
    </form>
  );
}

// モーダルコンポーネント
function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl overflow-hidden"
        style={{
          backgroundColor: "#FEF9F0",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ハンドル */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: "#D8C8B0" }}
          />
        </div>

        {/* ヘッダー */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: "#E8D8C0" }}
        >
          <h2
            className="handwritten text-xl font-bold"
            style={{ color: "#5A4A38" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: "#F0E8D8", color: "#7A6A58" }}
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="px-5 pb-8 pt-4">{children}</div>
      </div>
    </div>
  );
}

// メインコンポーネント
export default function Home() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sponsorData, setSponsorData] = useState<Record<string, string[]>>(loadSponsors);

  // ローカルストレージの変更を監視（管理ページでの更新を反映）
  useEffect(() => {
    const handleStorage = () => {
      setSponsorData(loadSponsors());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const selectedPlan =
    sponsorPlans.find((p) => p.id === selectedPlanId) ?? null;

  const handleApply = () => {
    if (selectedPlanId) {
      setIsFormOpen(true);
    }
  };

  return (
    <div
      className="washi-bg min-h-screen"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden">
        <img
          src={HERO_IMAGE_URL}
          alt="プチスポンサー制度"
          className="w-full object-cover"
          style={{ maxHeight: "280px", objectPosition: "center" }}
        />
        <div
          className="absolute inset-0 flex flex-col justify-end p-5"
          style={{
            background:
              "linear-gradient(to top, rgba(60,40,20,0.65) 0%, transparent 60%)",
          }}
        >
          <h1
            className="handwritten text-white font-bold leading-tight"
            style={{
              fontSize: "1.8rem",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            プチスポンサー制度
          </h1>
          <p
            className="text-white mt-1"
            style={{
              fontSize: "0.95rem",
              textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              opacity: 0.95,
            }}
          >
            誰かのおかげで、なんかいい。
          </p>
        </div>
      </section>

      {/* イントロセクション */}
      <section className="px-5 py-6">
        <ScrollReveal>
          <div
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: "#FFFBF5",
              borderColor: "#E8D8C0",
              boxShadow: "0 2px 12px rgba(200,119,58,0.08)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="stamp-badge flex-shrink-0"
                style={{ borderColor: "#C8773A", color: "#C8773A" }}
              >
                <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>5</span>
                <span style={{ fontSize: "0.6rem" }}>マルタ</span>
              </div>
              <div>
                <p className="text-sm leading-relaxed" style={{ color: "#5A4A38" }}>
                  <strong>ちょっと良い体験を、あなたの支援で。</strong>
                </p>
                <p
                  className="text-xs mt-1.5 leading-relaxed"
                  style={{ color: "#7A6A58" }}
                >
                  5マルタから始められます。あなたの支援がドームを通じて、みんなが喜ぶ体験に変わります。
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 仕組みセクション */}
      <section className="px-5 pb-6">
        <ScrollReveal>
          <h2
            className="handwritten text-xl font-bold mb-4 text-center"
            style={{ color: "#5A4A38" }}
          >
            こんな仕組みです
          </h2>
          <img
            src={FLOW_IMAGE_URL}
            alt="プチスポンサーの仕組み"
            className="w-full rounded-2xl"
            style={{ border: "1.5px solid #E8D8C0" }}
          />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { icon: "🪙", label: "あなたが\nマルタを支援" },
              { icon: "🏠", label: "ドームが\n素敵なものに変換" },
              { icon: "🎉", label: "みんなが\n喜ぶ体験に" },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center rounded-xl p-2"
                style={{ backgroundColor: "#FFF5E8" }}
              >
                <div style={{ fontSize: "1.4rem" }}>{item.icon}</div>
                <p
                  className="text-xs mt-1 leading-tight"
                  style={{ color: "#7A6A58", whiteSpace: "pre-line" }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* 区切り線 */}
      <div className="wavy-divider mx-5 mb-6" />

      {/* プラン選択セクション */}
      <section className="px-5 pb-6">
        <ScrollReveal>
          <h2
            className="handwritten text-xl font-bold mb-1 text-center"
            style={{ color: "#5A4A38" }}
          >
            プランを選んでください
          </h2>
          <p className="text-xs text-center mb-4" style={{ color: "#9A8A78" }}>
            タップして選択 → 下の「申し込む」ボタンへ
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-3">
          {sponsorPlans.map((plan, i) => (
            <ScrollReveal key={plan.id} delay={i * 80}>
              <PlanCard
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                onSelect={() =>
                  setSelectedPlanId(
                    selectedPlanId === plan.id ? null : plan.id
                  )
                }
                currentSponsors={sponsorData[plan.id] || []}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 申し込みボタン（固定フッター） */}
      <div
        className="sticky bottom-0 px-5 py-4 z-40"
        style={{
          backgroundColor: "rgba(254,249,240,0.95)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid #E8D8C0",
        }}
      >
        <button
          onClick={handleApply}
          disabled={!selectedPlanId}
          className="btn-primary w-full"
          style={{
            opacity: !selectedPlanId ? 0.5 : 1,
            cursor: !selectedPlanId ? "not-allowed" : "pointer",
            fontSize: "1.05rem",
          }}
        >
          {selectedPlanId
            ? `「${selectedPlan?.name}」で申し込む`
            : "プランを選んでください"}
        </button>
      </div>

      {/* スポンサー一覧セクション */}
      <section className="px-5 pt-2 pb-8">
        <div className="wavy-divider mb-6" />
        <ScrollReveal>
          <h2
            className="handwritten text-xl font-bold mb-4 text-center"
            style={{ color: "#5A4A38" }}
          >
            現在のスポンサー
          </h2>
          <div className="space-y-3">
            {sponsorPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl p-3 border"
                style={{
                  backgroundColor: plan.bgColor,
                  borderColor: plan.borderColor,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={plan.imageUrl}
                    alt={plan.name}
                    className="w-8 h-8 object-contain"
                  />
                  <h3
                    className="handwritten font-bold"
                    style={{ color: plan.tagColor, fontSize: "1rem" }}
                  >
                    {plan.name}
                  </h3>
                </div>
                {(sponsorData[plan.id] || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(sponsorData[plan.id] || []).map((sponsor, i) => (
                      <LuggageTag key={i} name={sponsor} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic" style={{ color: "#B0A090" }}>
                    まだスポンサーがいません。最初の一人になりませんか？
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* フッター */}
      <footer
        className="py-6 text-center"
        style={{
          backgroundColor: "#F0E8D8",
          borderTop: "1px solid #E0D0B8",
        }}
      >
        <p
          className="handwritten text-lg font-bold"
          style={{ color: "#8A6A48" }}
        >
          モルックドーム
        </p>
        <p className="text-xs mt-1" style={{ color: "#A08060" }}>
          兵庫県川西市
        </p>
        <a
          href="/admin"
          className="inline-block mt-4 text-xs px-3 py-1.5 rounded-full"
          style={{ backgroundColor: "#E8D8C0", color: "#8A7060" }}
        >
          ⚙ 管理ページ
        </a>
        <p className="text-xs mt-3" style={{ color: "#B0A080" }}>
          © 2026 モルックドーム
        </p>
      </footer>

      {/* 申し込みモーダル */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="プチスポンサー申し込み"
      >
        <ApplicationForm
          selectedPlan={selectedPlan}
          onClose={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
