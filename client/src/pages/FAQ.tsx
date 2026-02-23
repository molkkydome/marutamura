/*
 * FAQ Page - Zero Scroll, Mölkky Design
 * WiFi removed (shown on home page)
 * Staff guidance added
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function FAQ() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 shadow-lg flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://private-us-east-1.manuscdn.com/sessionFile/kKv3tLjbqz5KgxIGW1UkVg/sandbox/JKdGotl5IaTlTwPFHmF3sr-img-1_1771578082000_na1fn_bW9sa2t5LXdvb2QtdGV4dHVyZS1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva0t2M3RMamJxejVLZ3hJR1cxVWtWZy9zYW5kYm94L0pLZEdvdGw1SWFUbFR3UEZIbUYzc3ItaW1nLTFfMTc3MTU3ODA4MjAwMF9uYTFmbl9iVzlzYTJ0NUxYZHZiMlF0ZEdWNGRIVnlaUzFpWncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=s9Cx-EZ9RI1UDB1N6BghbpqZC6uCZajTEoOR5lMcel0h44UsITZvl1SzVMCjWZlcD6h4otE6gMBW9qdp7kAo7NXZgF2qNY~coEgjuTESvO8kXJbfrWEhgMEbzs12biid4LKgZxAngLLxzPcMzW1s7JmFh2GYblijzFuUadg7~pngy4IO~tXjQSxcnMsweSorvwvTOqLRM1zMPoAeWp2m2tcwk1Xq-jc9sdivwRKU4CHgO4R0OtogsA8rNhSseCBBgRxF1Dkekn0KNCM5RNMoKtVH9-xz238MzIbchI5RexsD84a3Wr28CMRCxnCD-tLN~JRzm1fQZ4zQwYsyu9bVeg__')] bg-cover"></div>
        <div className="container flex items-center gap-2 relative z-10">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">よくある質問</h1>
        </div>
      </header>

      {/* Content - Zero Scroll */}
      <main className="flex-1 overflow-hidden">
        <div className="container h-full py-3 flex flex-col gap-2">
          {/* FAQ Cards - Compact */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            {/* Toilet */}
            <Card className="border-2 border-accent/30 bg-card/80 backdrop-blur-sm flex-1">
              <CardContent className="p-3 h-full flex flex-col justify-center">
                <div className="flex items-start gap-2">
                  <div className="text-2xl flex-shrink-0">🚻</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold mb-1 text-foreground">トイレの位置</h3>
                    <p className="text-xs text-muted-foreground">ステージの裏側にあります</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shop */}
            <Card className="border-2 border-accent/30 bg-card/80 backdrop-blur-sm flex-1">
              <CardContent className="p-3 h-full flex flex-col justify-center">
                <div className="flex items-start gap-2">
                  <div className="text-2xl flex-shrink-0">🏪</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold mb-1 text-foreground">売店</h3>
                    <p className="text-xs text-muted-foreground">左奥（セルフレジ）</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Help */}
            <Card className="border-2 border-primary/40 bg-primary/5 backdrop-blur-sm flex-1">
              <CardContent className="p-3 h-full flex flex-col justify-center">
                <div className="flex items-start gap-2">
                  <div className="text-2xl flex-shrink-0">👔</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold mb-1 text-foreground">お困りの際は</h3>
                    <p className="text-xs text-muted-foreground">
                      VIVSベストを着用したスタッフまでお気軽にお声掛けください
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      スタッフが見当たらない場合は、受付にあるボタンを押してください
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
