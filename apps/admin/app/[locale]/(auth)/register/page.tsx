"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Input } from "@workspace/ui/components/input"

import { Link, useRouter } from "@/i18n/navigation"
import { signUp } from "@/lib/auth-client"
import { registerSchema, type RegisterInput } from "@/lib/validation/auth"

export default function RegisterPage() {
  const t = useTranslations()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(values: RegisterInput) {
    setSubmitting(true)
    const { error } = await signUp.email(values)
    setSubmitting(false)

    if (error) {
      toast.error(error.message ?? t("auth.signUpFailed"))
      return
    }
    toast.success(t("auth.accountCreated"))
    router.replace("/dashboard")
    router.refresh()
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>
          <h1>{t("auth.registerTitle")}</h1>
        </CardTitle>
        <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.name")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="name"
                      placeholder="Ada Lovelace"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.password")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? t("common.creating") : t("common.createAccount")}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-foreground">
            {t("auth.signInLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
