/**
 * Board Games Page - Mobile Optimized with Individual Video Links
 * Each game card has a "Watch Video" button linking to specific YouTube video
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

// Video link mapping for each board game
const videoLinks: Record<string, string> = {
  "ツッコミカルタ": "https://www.youtube.com/watch?v=iAwqJIVsaPM",
  "BOMB BUSTERS": "https://www.youtube.com/watch?v=KkC-4xKN0cY&t=284s",
  "ポーカー": "https://www.youtube.com/watch?v=DAwPp6zWTvw",
  "ブラックジャック": "https://www.youtube.com/watch?v=xC_JuBcCGSg",
  "バカラ": "https://www.youtube.com/watch?v=4Rfr67eOm-o",
  "人生ゲーム 平成版IV": "https://www.youtube.com/watch?v=A8qvXKaxsZY",
  "人狼カード": "https://www.youtube.com/watch?v=Ny2FWploxTM",
  "TAGIRON": "https://www.youtube.com/watch?v=9M0wTktMMFw",
  "将棋": "https://www.youtube.com/watch?v=4StgYbdoKgU",
  "WINGSPAN": "https://www.youtube.com/watch?v=LQB5c9tbgFs",
  "枯山水": "https://www.youtube.com/watch?v=a2zikiUPG8Q",
  "QUORIDOR": "https://www.youtube.com/watch?v=r6cD5iQB7hQ",
  "ウボンゴ": "https://www.youtube.com/watch?v=kcppXOAlpxc",
  "KLOAK": "https://www.youtube.com/watch?v=qriJkM9g2Ow",
  "お邪魔者": "https://www.youtube.com/watch?v=3RWjEiUWyFY",
  "天才画家ボン": "https://www.youtube.com/watch?v=r2KdNpVhVEA",
  "バトルライン": "https://www.youtube.com/watch?v=OEa9TfSmx1M",
  "カタン": "https://www.youtube.com/watch?v=q0NH-Wa_70E",
  "ソノトキボクハ": "https://www.youtube.com/watch?v=UvxxJQMH-DY",
  "UNO": "https://youtu.be/BAWr8J9LBmA?si=C9fHMjdWybO2lwKU",
  "DOS": "http://youtube.com/watch?v=nGzM8ZXu8VU",
  "ハゲタカのえじき": "https://www.youtube.com/watch?v=v97PP5AHF5w",
  "ブロックス": "https://www.youtube.com/watch?v=WANCMfcl3hQ",
  "大富豪 大貧民": "https://www.youtube.com/watch?v=JdsIakSyFaU",
  "狩歌": "https://www.youtube.com/watch?v=ilDV_5F-pOk",
  "ワードバスケット": "https://www.youtube.com/watch?v=oOclX058PR8",
  "オートリオ": "https://www.youtube.com/watch?v=SQzqcfaWfvI",
  "ジェンガ": "https://www.youtube.com/watch?v=qd0ZKHGHcxg",
  "リバーシ": "https://www.youtube.com/watch?v=0T0dPoCB2wA",
  "トマトマト": "https://www.youtube.com/watch?v=DEbhSpIrEpw",
  "人のせいにするな": "https://www.youtube.com/watch?v=nYonSVRGcWA",
  "人生ゲーム +令和版": "https://www.youtube.com/watch?v=J7sxeIew74w",
  "黒ひげ危機一発": "https://www.youtube.com/watch?v=bzHx-yAGLpo",
  "ワニワニパニック": "https://www.youtube.com/watch?v=aa382K6jJjY",
  "ナンジャモンジャ": "https://www.youtube.com/watch?v=e-DnYGrgdEo",
  "ルドーフィア": "https://www.youtube.com/watch?v=7Vl2iewL6Mo",
  "ヤニブ": "https://www.youtube.com/watch?v=WxIfgBXSlQU&t=2s",
  "ナポレオン": "https://www.youtube.com/watch?v=lr-YZohR4KE",
  "ヨット": "https://www.youtube.com/watch?v=3zYrlliw_wM",
  "囲いこみ": "https://www.youtube.com/watch?v=xYOwaZP2k10&list=PLDDD1oEiVey6Yuy-kUMl-sQeE4BXjJzo4&index=39",
  "OK PLAY": "https://www.youtube.com/watch?v=JADciI6Phz4"
};

// Board games data organized by age
const boardGames = {
  "12歳以上": [
    "ツッコミカルタ",
    "BOMB BUSTERS",
    "ポーカー",
    "ブラックジャック",
    "バカラ",
    "人生ゲーム 平成版IV"
  ],
  "10歳以上": [
    "人狼カード",
    "TAGIRON",
    "将棋",
    "WINGSPAN",
    "枯山水"
  ],
  "8歳以上": [
    "QUORIDOR",
    "ウボンゴ",
    "KLOAK",
    "お邪魔者",
    "天才画家ボン",
    "バトルライン",
    "カタン"
  ],
  "7歳以上": [
    "ソノトキボクハ",
    "UNO",
    "DOS",
    "ハゲタカのえじき",
    "ブロックス",
    "大富豪 大貧民"
  ],
  "6歳以上": [
    "狩歌",
    "ワードバスケット",
    "オートリオ",
    "ジェンガ",
    "リバーシ",
    "トマトマト",
    "人のせいにするな",
    "人生ゲーム +令和版",
    "OK PLAY"
  ],
  "6歳未満": [
    "黒ひげ危機一発",
    "ワニワニパニック",
    "ナンジャモンジャ",
    "ルドーフィア"
  ],
  "トランプ": [
    "ヤニブ",
    "ナポレオン",
    "ヨット",
    "囲いこみ"
  ]
};

export default function BoardGames() {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 shadow-lg flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://private-us-east-1.manuscdn.com/sessionFile/kKv3tLjbqz5KgxIGW1UkVg/sandbox/JKdGotl5IaTlTwPFHmF3sr-img-1_1771578082000_na1fn_bW9sa2t5LXdvb2QtdGV4dHVyZS1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva0t2M3RMamJxejVLZ3hJR1cxVWtWZy9zYW5kYm94L0pLZEdvdGw1SWFUbFR3UEZIbUYzc3ItaW1nLTFfMTc3MTU3ODA4MjAwMF9uYTFmbl9iVzlzYTJ0NUxYZHZiMlF0ZEdWNGRIVnlaUzFpWncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=s9Cx-EZ9RI1UDB1N6BghbpqZC6uCZajTEoOR5lMcel0h44UsITZvl1SzVMCjWZlcD6h4otE6gMBW9qdp7kAo7NXZgF2qNY~coEgjuTESvO8kXJbfrWEhgMEbzs12biid4LKgZxAngLLxzPcMzW1s7JmFh2GYblijzFuUadg7~pngy4IO~tXjQSxcnMsweSorvwvTOqLRM1zMPoAeWp2m2tcwk1Xq-jc9sdivwRKU4CHgO4R0OtogsA8rNhSseCBBgRxF1Dkekn0KNCM5RNMoKtVH9-xz238MzIbchI5RexsD84a3Wr28CMRCxnCD-tLN~JRzm1fQZ4zQwYsyu9bVeg__')] bg-cover"></div>
        <div className="container flex items-center justify-between relative z-10">
          <h1 className="text-lg font-bold">🎲 ボードゲーム</h1>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-3">
          {!selectedAge ? (
            // Age Selection Grid
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(boardGames).map((age) => (
                <Button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className="h-20 text-base font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-2xl shadow-md"
                >
                  {age}
                </Button>
              ))}
            </div>
          ) : (
            // Game List with Video Links
            <div className="space-y-3">
              <Button
                onClick={() => setSelectedAge(null)}
                variant="outline"
                className="w-full mb-2"
              >
                ← 年齢選択に戻る
              </Button>
              
              <div className="grid grid-cols-1 gap-3">
                {boardGames[selectedAge as keyof typeof boardGames].map((game) => (
                  <Card key={game} className="border-2 bg-card shadow-md">
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="font-medium text-sm">{game}</span>
                      {videoLinks[game] && (
                        <a
                          href={videoLinks[game]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2"
                        >
                          <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 rounded-xl"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            動画
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
