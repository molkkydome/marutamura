/*
 * WiFi Page - Zero Scroll
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Wifi, Copy, Check } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function WiFiPage() {
  const [copiedSSID, setCopiedSSID] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const copyToClipboard = (text: string, type: 'ssid' | 'password') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'ssid') {
        setCopiedSSID(true);
        setTimeout(() => setCopiedSSID(false), 2000);
      } else {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      }
      toast.success('コピーしました');
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 shadow-lg flex-shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://private-us-east-1.manuscdn.com/sessionFile/kKv3tLjbqz5KgxIGW1UkVg/sandbox/JKdGotl5IaTlTwPFHmF3sr-img-1_1771578082000_na1fn_bW9sa2t5LXdvb2QtdGV4dHVyZS1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUva0t2M3RMamJxejVLZ3hJR1cxVWtWZy9zYW5kYm94L0pLZEdvdGw1SWFUbFR3UEZIbUYzc3ItaW1nLTFfMTc3MTU3ODA4MjAwMF9uYTFmbl9iVzlzYTJ0NUxYZHZiMlF0ZEdWNGRIVnlaUzFpWncucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=s9Cx-EZ9RI1UDB1N6BghbpqZC6uCZajTEoOR5lMcel0h44UsITZvl1SzVMCjWZlcD6h4otE6gMBW9qdp7kAo7NXZgF2qNY~coEgjuTESvO8kXJbfrWEhgMEbzs12biid4LKgZxAngLLxzPcMzW1s7JmFh2GYblijzFuUadg7~pngy4IO~tXjQSxcnMsweSorvwvTOqLRM1zMPoAeWp2m2tcwk1Xq-jc9sdivwRKU4CHgO4R0OtogsA8rNhSseCBBgRxF1Dkekn0KNCM5RNMoKtVH9-xz238MzIbchI5RexsD84a3Wr28CMRCxnCD-tLN~JRzm1fQZ4zQwYsyu9bVeg__')] bg-cover"></div>
        <div className="container flex items-center justify-between relative z-10">
          <h1 className="text-lg font-bold">📶 WiFi接続</h1>
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8">
              <Home className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="container">
          <div className="space-y-4">
            {/* WiFi Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Wifi className="w-10 h-10 text-primary" />
              </div>
            </div>

            {/* SSID */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">ネットワーク名</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-2xl font-bold text-foreground">モルックドーム</p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard('モルックドーム', 'ssid')}
                    className="flex-shrink-0 h-9 w-9"
                  >
                    {copiedSSID ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
          </Link>
                </div>
              </CardContent>
            </Card>

            {/* Password */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">パスワード</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-2xl font-bold text-foreground font-mono">50505050</p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard('50505050', 'password')}
                    className="flex-shrink-0 h-9 w-9"
                  >
                    {copiedPassword ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
          </Link>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="border-2 bg-primary/5">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground text-center">
                  施設内全域でご利用いただけます
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
