import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { BetaApplyForm } from "@/components/forms/beta-apply-form";

export const metadata: Metadata = {
  title: "内测申请",
  description: "申请加入 萝卜爱做饭 内测，第一时间体验拍照识别食材推荐菜谱。",
};

export default function BetaPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            内测申请
          </h1>
          <p className="text-muted-foreground">
            萝卜爱做饭 正在内测中。填写下面的信息，我们会尽快邀请你体验。
          </p>
        </header>
        <BetaApplyForm productInterest="aicook" />
        <p className="text-xs text-muted-foreground">
          提交即表示你同意我们通过邮箱与你联系。我们不会泄露你的信息。
        </p>
      </div>
    </Container>
  );
}
