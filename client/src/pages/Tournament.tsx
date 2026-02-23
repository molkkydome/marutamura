/*
 * Tournament Page - Image + Entry Buttons for Each Tournament
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ExternalLink } from "lucide-react";
import { Link } from "wouter";

const tournaments = [
  { 
    name: "モルックナイト", 
    emoji: "🌙", 
    time: "19:30～", 
    desc: "仕事終わりにモルック大会",
    entryUrl: "https://liff.line.me/2000028829-Ao0vBP7Q?liff_id=2000028829-Ao0vBP7Q&group_id=58045"
  },
  { 
    name: "平日カップ", 
    emoji: "✨", 
    time: "10:00～", 
    desc: "平日は個人戦の大会",
    entryUrl: "https://liff.line.me/2000028829-Ao0vBP7Q?liff_id=2000028829-Ao0vBP7Q&group_id=107211"
  },
  { 
    name: "ファミリーカップ", 
    emoji: "👨‍👩‍👧‍👦", 
    time: "9:30～", 
    desc: "小学生以下が1名以上",
    entryUrl: "https://liff.line.me/2000028829-Ao0vBP7Q?liff_id=2000028829-Ao0vBP7Q&group_id=58468"
  },
  { 
    name: "モルック体験会", 
    emoji: "🔰", 
    time: "13:00～", 
    desc: "初めての方～初心者対象",
    entryUrl: "https://liff.line.me/2000028829-Ao0vBP7Q?liff_id=2000028829-Ao0vBP7Q&group_id=134923"
  },
  { 
    name: "早朝カップ", 
    emoji: "☀️", 
    time: "6:30～", 
    desc: "日本一朝が早い大会",
    entryUrl: "https://liff.line.me/2000028829-Ao0vBP7Q?liff_id=2000028829-Ao0vBP7Q&group_id=58203"
  },
  { 
    name: "新人カップ", 
    emoji: "🔰", 
    time: "12:30～", 
    desc: "3位以上未経験者限定",
    entryUrl: "https://liff.line.me/2000028829-Ao0vBP7Q?liff_id=2000028829-Ao0vBP7Q&group_id=58304"
  },
  { 
    name: "新人チーム戦", 
    emoji: "🔰", 
    time: "13:00～", 
    desc: "新人戦優勝未経験者",
    entryUrl: "https://liff.line.me/2000028829-Ao0vBP7Q?liff_id=2000028829-Ao0vBP7Q&group_id=160406"
  },
  { 
    name: "マスターズ", 
    emoji: "👴", 
    time: "13:00～", 
    desc: "65歳以上限定",
    entryUrl: "https://liff.line.me/2000028829-Ao0vBP7Q?liff_id=2000028829-Ao0vBP7Q&group_id=114617"
  },
  { 
    name: "満願寺モルック大会2026予選会", 
    emoji: "🏆", 
    time: "", 
    desc: "川西市在住・在学・在勤・出身",
    entryUrl: "https://liff.line.me/2000028829-Ao0vBP7Q?liff_id=2000028829-Ao0vBP7Q&group_id=155040"
  }
];

export default function Tournament() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 shadow-lg flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://private-us-east-1.manuscdn.com/sessionFile/kKv3tLjbqz5KgxIGW1UkVg/sandbox/JKdGotl5IaTlTwPFHmF3sr-img-1_1771578082000_na1fn_bW9sa2t5LXdvb2QtdGV4dHVyZS1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva0t2M3RMamJxejVLZ3hJR1cxVWtWZy9zYW5kYm94L0pLZEdvdGw1SWFUbFR3UEZIbUYzc3ItaW1nLTFfMTc3MTU3ODA4MjAwMF9uYTFmbl9iVzlzYTJ0NUxYZHZiMlF0ZEdWNGRIVnlaUzFpWncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=s9Cx-EZ9RI1UDB1N6BghbpqZC6uCZajTEoOR5lMcel0h44UsITZvl1SzVMCjWZlcD6h4otE6gMBW9qdp7kAo7NXZgF2qNY~coEgjuTESvO8kXJbfrWEhgMEbzs12biid4LKgZxAngLLxzPcMzW1s7JmFh2GYblijzFuUadg7~pngy4IO~tXjQSxcnMsweSorvwvTOqLRM1zMPoAeWp2m2tcwk1Xq-jc9sdivwRKU4CHgO4R0OtogsA8rNhSseCBBgRxF1Dkekn0KNCM5RNMoKtVH9-xz238MzIbchI5RexsD84a3Wr28CMRCxnCD-tLN~JRzm1fQZ4zQwYsyu9bVeg__')] bg-cover"></div>
        <div className="container flex items-center justify-between relative z-10">
          <h1 className="text-lg font-bold">🏆 モルック大会</h1>
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
          <div className="space-y-3">
            {/* Tournament Schedule Image */}
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663365208017/gTBKiyeAKadrKrRZ.jpg"
                alt="定期大会案内"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>

            {/* Tournament List with Entry Buttons */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">大会一覧</h3>
              {tournaments.map((tournament, idx) => (
                <Card key={idx} className="border-2 border-accent/30 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-bold text-xs">
                          {tournament.emoji && <span className="mr-1">{tournament.emoji}</span>}
                          {tournament.name}
                        </div>
                        {tournament.time && (
                          <div className="text-[10px] text-muted-foreground">{tournament.time}</div>
                        )}
                        <div className="text-[10px] text-muted-foreground">{tournament.desc}</div>
                      </div>
                      <a 
                        href={tournament.entryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" className="text-xs py-1 px-2 h-auto">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          エントリー
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
