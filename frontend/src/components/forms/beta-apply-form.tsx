"use client";

import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useBetaApply } from "@/hooks/use-beta-apply";

// 内测申请表单校验规则
const betaApplySchema = z.object({
  name: z.string().min(2, "请填写至少 2 个字符的称呼"),
  email: z.string().email("请输入有效的邮箱地址"),
  device: z.string().optional(),
  message: z.string().max(500, "不超过 500 字").optional(),
});

type BetaApplyFormValues = z.infer<typeof betaApplySchema>;

export function BetaApplyForm({ product = "aicook" }: { product?: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BetaApplyFormValues>({
    resolver: zodResolver(betaApplySchema),
    defaultValues: { name: "", email: "", device: "", message: "" },
  });

  const { mutateAsync, isPending } = useBetaApply();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await mutateAsync({ ...values, product });
      toast.success(
        result.mocked
          ? "申请已记录（演示模式，后端待接入）"
          : "申请提交成功，我们会尽快与你联系"
      );
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "提交失败，请稍后重试");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="称呼" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="怎么称呼你" {...register("name")} />
      </Field>
      <Field label="邮箱" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
        />
      </Field>
      <Field label="设备 / 系统（选填）" htmlFor="device" error={errors.device?.message}>
        <Input id="device" placeholder="如 iPhone 15 / 微信" {...register("device")} />
      </Field>
      <Field label="想说的话（选填）" htmlFor="message" error={errors.message?.message}>
        <Textarea
          id="message"
          rows={4}
          placeholder="期待的功能、使用场景等"
          {...register("message")}
        />
      </Field>
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "提交中…" : "提交申请"}
      </Button>
    </form>
  );
}

// 表单字段容器：统一标签与错误展示
function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
