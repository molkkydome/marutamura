/*
 * Activities Page - Zero Scroll
 * Removed: BBQコンロ15台, WiFi完備, ナイター照明, ビーズクッション, 2階VIPルーム, 即興ライブ
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Link } from "wouter";

export default function Activities() {
  const activities = [
    "モルック", "スラックライン", "バドミントン", "桶っと卓球",
    "ピックルボール", "ペタンク", "川あそび", "トランポリン",
    "ジップライン", "ミニ電気自動車", "変わり種自転車", "スケボー",
    "ランバイク", "くじゃく観察", "BBQ", "麻雀全自動卓",
    "TVゲーム", "ボードゲーム", "ボッチャ", "ジャグリング",
    "ガーデンエリア", "たき火ストーブ", "キッズスペース", "カホン",
    "ドラム", "ピアノ", "ウクレレ"
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 shadow-lg flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://private-us-east-1.manuscdn.com/sessionFile/kKv3tLjbqz5KgxIGW1UkVg/sandbox/JKdGotl5IaTlTwPFHmF3sr-img-1_1771578082000_na1fn_bW9sa2t5LXdvb2QtdGV4dHVyZS1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva0t2M3RMamJxejVLZ3hJR1cxVWtWZy9zYW5kYm94L0pLZEdvdGw1SWFUbFR3UEZIbUYzc3ItaW1nLTFfMTc3MTU3ODA4MjAwMF9uYTFmbl9iVzlzYTJ0NUxYZHZiMlF0ZEdWNGRIVnlaUzFpWncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=s9Cx-EZ9RI1UDB1N6BghbpqZC6uCZajTEoOR5lMcel0h44UsITZvl1SzVMCjWZlcD6h4otE6gMBW9qdp7kAo7NXZgF2qNY~coEgjuTESvO8kXJbfrWEhgMEbzs12biid4LKgZxAngLLxzPcMzW1s7JmFh2GYblijzFuUadg7~pngy4IO~tXjQSxcnMsweSorvwvTOqLRM1zMPoAeWp2m2tcwk1Xq-jc9sdivwRKU4CHgO4R0OtogsA8rNhSseCBBgRxF1Dkekn0KNCM5RNMoKtVH9-xz238MzIbchI5RexsD84a3Wr28CMRCxnCD-tLN~JRzm1fQZ4zQwYsyu9bVeg__')] bg-cover"></div>
        <div className="container flex items-center justify-between relative z-10">
          <h1 className="text-lg font-bold">🎪 遊ぶ</h1>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Content - Zero Scroll */}
      <main className="flex-1 overflow-hidden">
        <div className="container h-full py-3">
          <div className="h-full flex flex-col">
            {/* Activities Grid - Fills remaining space */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                {activities.map((item) => (
                  <Card key={item} className="border-2 border-accent/30 bg-card/80 backdrop-blur-sm skittle-button">
                    <CardContent className="p-2 text-center flex items-center justify-center min-h-[60px]">
                      <p className="text-foreground font-medium text-xs leading-tight">{item}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
