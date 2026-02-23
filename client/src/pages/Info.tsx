/*
 * Info Page - Zero Scroll
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, HelpCircle, Clock, Car } from "lucide-react";
import { Link } from "wouter";

export default function Info() {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-3 shadow-md flex-shrink-0">
        <div className="container flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">その他情報</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="container">
          <div className="space-y-4">
            {/* Help */}
            <Card className="border-2 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1 text-foreground">お困りの際は</h3>
                    <p className="text-sm text-muted-foreground">
                      スタッフまでお気軽にお声がけください
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1 text-foreground">営業時間</h3>
                    <p className="text-sm text-muted-foreground">
                      24時間営業（全天候型施設）
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parking */}
            <Card className="border-2">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-1 text-foreground">駐車場</h3>
                    <p className="text-sm text-muted-foreground">
                      50台（無料）
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="border-2 bg-accent/5">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  ゴミは分別 / ボードゲームは元の場所へ<br />
                  他のお客様へのご配慮をお願いします
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
