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
import type { BetaApplicationPayload } from "@/lib/api/beta";

// 校验规则：联系方式按类型校验邮箱 / QQ
const schema = z
  .object({
    contactType: z.enum(["email", "qq"]),
    contactValue: z.string().min(1, "请填写联系方式"),
    useCase: z
      .string()
      .min(5, "简单描述下使用场景（至少 5 字）")
      .max(500, "不超过 500 字"),
    note: z.string().max(500, "不超过 500 字").optional(),
  })
  .refine(
    (d) =>
      d.contactType !== "email" ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contactValue),
    { message: "请输入有效的邮箱地址", path: ["contactValue"] }
  )
  .refine(
    (d) => d.contactType !== "qq" || /^[1-9]\d{4,11}$/.test(d.contactValue),
    { message: "请输入有效的 QQ 号", path: ["contactValue"] }
  );

type FormValues = z.infer<typeof schema>;

export function BetaApplyForm({
  productInterest = "aicook",
}: {
  productInterest?: BetaApplicationPayload["productInterest"];
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contactType: "email",
      contactValue: "",
      useCase: "",
      note: "",
    },
  });

  const contactType = watch("contactType");
  const { mutateAsync, isPending } = useBetaApply();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await mutateAsync({
        productInterest,
        contactType: values.contactType,
        contactValue: values.contactValue.trim(),
        useCase: values.useCase.trim(),
        note: values.note?.trim() || undefined,
        sourcePage:
          typeof window !== "undefined" ? window.location.pathname : undefined,
      });
      toast.success(
        result.mailStatus === "sent"
          ? "申请提交成功，确认邮件已发出，请注意查收"
          : "申请提交成功，我们会尽快与你联系"
      );
      reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "提交失败，请稍后重试"
      );
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="联系方式" htmlFor="contactValue" error={errors.contactValue?.message}>
        <div className="flex gap-2">
          <select
            aria-label="联系方式类型"
            className="h-8 shrink-0 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            {...register("contactType")}
          >
            <option value="email">邮箱</option>
            <option value="qq">QQ</option>
          </select>
          <Input
            id="contactValue"
            type={contactType === "email" ? "email" : "text"}
            inputMode={contactType === "qq" ? "numeric" : "email"}
            placeholder={contactType === "email" ? "you@example.com" : "你的 QQ 号"}
            {...register("contactValue")}
          />
        </div>
      </Field>

      <Field label="使用场景" htmlFor="useCase" error={errors.useCase?.message}>
        <Textarea
          id="useCase"
          rows={3}
          placeholder="你打算用它做什么？比如：管理家庭菜谱、按冰箱里的食材推荐做菜……"
          {...register("useCase")}
        />
      </Field>

      <Field label="备注（选填）" htmlFor="note" error={errors.note?.message}>
        <Textarea id="note" rows={2} placeholder="其它想说的" {...register("note")} />
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
