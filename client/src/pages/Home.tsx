/*
 * Design Philosophy: Mölkky-Inspired Intuitive Interface
 * - Skittle-shaped buttons for tactile feel
 * - Wood and forest color palette
 * - Minimal text, maximum visual communication
 * - Designed for Aoi (24F, cafe worker, illustrator aspirant, intuitive thinker)
 */

import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - Wood texture */}
      <header className="bg-primary text-primary-foreground py-2.5 shadow-lg flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://private-us-east-1.manuscdn.com/sessionFile/kKv3tLjbqz5KgxIGW1UkVg/sandbox/JKdGotl5IaTlTwPFHmF3sr-img-1_1771578082000_na1fn_bW9sa2t5LXdvb2QtdGV4dHVyZS1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva0t2M3RMamJxejVLZ3hJR1cxVWtWZy9zYW5kYm94L0pLZEdvdGw1SWFUbFR3UEZIbUYzc3ItaW1nLTFfMTc3MTU3ODA4MjAwMF9uYTFmbl9iVzlzYTJ0NUxYZHZiMlF0ZEdWNGRIVnlaUzFpWncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=s9Cx-EZ9RI1UDB1N6BghbpqZC6uCZajTEoOR5lMcel0h44UsITZvl1SzVMCjWZlcD6h4otE6gMBW9qdp7kAo7NXZgF2qNY~coEgjuTESvO8kXJbfrWEhgMEbzs12biid4LKgZxAngLLxzPcMzW1s7JmFh2GYblijzFuUadg7~pngy4IO~tXjQSxcnMsweSorvwvTOqLRM1zMPoAeWp2m2tcwk1Xq-jc9sdivwRKU4CHgO4R0OtogsA8rNhSseCBBgRxF1Dkekn0KNCM5RNMoKtVH9-xz238MzIbchI5RexsD84a3Wr28CMRCxnCD-tLN~JRzm1fQZ4zQwYsyu9bVeg__')] bg-cover"></div>
        <div className="container relative z-10">
          <h1 className="text-base font-bold text-center tracking-wide">🌲 モルックドーム 🌲</h1>
        </div>
      </header>

      {/* WiFi Info - Compact */}
      <section className="bg-accent/15 py-1.5 border-b-2 border-accent/30 flex-shrink-0 backdrop-blur-sm">
        <div className="container">
          <div className="flex items-center justify-center gap-2 text-[10px] text-accent-foreground">
            <span className="font-semibold">📶 WiFi</span>
            <span className="font-mono bg-accent/20 px-1.5 py-0.5 rounded">molkkydome</span>
            <span className="text-muted-foreground">|</span>
            <span className="font-mono font-bold bg-accent/20 px-1.5 py-0.5 rounded">50505050</span>
          </div>
        </div>
      </section>

      {/* Main Menu Grid - 3x3 Skittle Buttons */}
      <section className="flex-1 py-2 min-h-0">
        <div className="container h-full flex flex-col gap-1.5">
          {/* 3x3 Grid - Skittle shaped buttons */}
          <div className="grid grid-cols-3 gap-2 flex-1">
            {/* Molkky */}
            <Link href="/molkky">
              <div className="skittle-button cursor-pointer h-full flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-0.5">🎯</div>
                <h2 className="text-[11px] font-bold text-foreground">モルック</h2>
              </div>
            </Link>

            {/* Board Games */}
            <Link href="/boardgames">
              <div className="skittle-button cursor-pointer h-full flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-0.5">🎲</div>
                <h2 className="text-[11px] font-bold text-foreground">ボードゲーム</h2>
              </div>
            </Link>

            {/* Play */}
            <Link href="/activities">
              <div className="skittle-button cursor-pointer h-full flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-0.5">🎪</div>
                <h2 className="text-[11px] font-bold text-foreground">遊ぶ</h2>
              </div>
            </Link>

            {/* Food */}
            <Link href="/food">
              <div className="skittle-button cursor-pointer h-full flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-0.5">🍛</div>
                <h2 className="text-[11px] font-bold text-foreground">食べる</h2>
              </div>
            </Link>

            {/* BBQ */}
            <Link href="/bbq">
              <div className="skittle-button cursor-pointer h-full flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-0.5">🔥</div>
                <h2 className="text-[11px] font-bold text-foreground">BBQ</h2>
              </div>
            </Link>

            {/* Marta */}
            <Link href="/marta">
              <div className="skittle-button cursor-pointer h-full flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-0.5">🪙</div>
                <h2 className="text-[11px] font-bold text-foreground">マルタ</h2>
              </div>
            </Link>

            {/* Tournament */}
            <Link href="/tournament">
              <div className="skittle-button cursor-pointer h-full flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-0.5">🏆</div>
                <h2 className="text-[11px] font-bold text-foreground">モルック大会</h2>
              </div>
            </Link>

            {/* History */}
            <Link href="/history">
              <div className="skittle-button cursor-pointer h-full flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-0.5">📖</div>
                <h2 className="text-[11px] font-bold text-foreground">歴史</h2>
              </div>
            </Link>

            {/* More */}
            <Link href="/more">
              <div className="skittle-button cursor-pointer h-full flex flex-col items-center justify-center p-2 text-center">
                <div className="text-2xl mb-0.5">✨</div>
                <h2 className="text-[11px] font-bold text-foreground">もっと</h2>
              </div>
            </Link>
          </div>

          {/* FAQ/Contact - Bottom Row */}
          <div className="flex-shrink-0">
            <Link href="/faq">
              <Card className="hover-lift border-2 border-accent/30 cursor-pointer bg-accent/10 backdrop-blur-sm">
                <CardContent className="flex items-center justify-center gap-1.5 p-2">
                  <span className="text-base">❓</span>
                  <h2 className="text-[11px] font-bold text-foreground">よくある質問・お問い合わせ</h2>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Decorative forest silhouette at bottom */}
      <div className="h-16 flex-shrink-0 bg-gradient-to-t from-accent/20 to-transparent relative overflow-hidden">
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 bg-bottom bg-no-repeat opacity-30"
          style={{
            backgroundImage: "url('https://private-us-east-1.manuscdn.com/sessionFile/kKv3tLjbqz5KgxIGW1UkVg/sandbox/JKdGotl5IaTlTwPFHmF3sr-img-3_1771578079000_na1fn_bW9sa2t5LWZvcmVzdC1wYXR0ZXJu.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva0t2M3RMamJxejVLZ3hJR1cxVWtWZy9zYW5kYm94L0pLZEdvdGw1SWFUbFR3UEZIbUYzc3ItaW1nLTNfMTc3MTU3ODA3OTAwMF9uYTFmbl9iVzlzYTJ0NUxXWnZjbVZ6ZEMxd1lYUjBaWEp1LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=aasJHYJ30CurtMuwFcLM~FH9vMrHJ9Tiq-JPtrisbn1RFjRiXT7FRie5mw5fQDt4ApINdFd2KkaAqv4ABm8kNQGHDkIu0hZnm1fWtQmDuyaw~EO1i~NT3oefa2XaGSsrUJ2ahOwuNqUVDo2J0YbEFv~88~WX5kFIpWjG6UfM51uqdRsTNJKCR3ZYVTTH9xE1K7InxGDv383KWoTNGCemsihVtSRNHVjKdGA9Z1oxbGtplNjy84f0UZRz8NDn~75WI1VlWVJkp9fu6fS56u2AUXsJhDdKCMMOR4Kd0KtiuQ9Wu1rjsV0eHVrqes9X8cfbF6Ln-21Nqby78ZOgqEhhlw__')",
            backgroundSize: 'cover'
          }}
        ></div>
      </div>
    </div>
  );
}
