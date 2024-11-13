"use client";
import { signup } from "@/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const FormSchema = z
  .object({
    email: z.string().email({ message: "Must be valid email" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  );

export default function Page() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: signup,
    onError: (error) => {
      toast({
        variant: "destructive",
        title: error.message,
      });
    },
    onSuccess: () => {
      router.replace("/me");
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const origin: string = window.location.origin;
    // @ts-ignore
    mutate({ origin, ...data });
  }

  return (
    <Form {...form}>
      <p className={"font-semibold text-xl"}> Sign Up</p>
      <p className={"pb-4 pt-1"}>
        Already have an account ?{" "}
        <Link href={"/login"} className={"text-blue-600 cursor-pointer"}>
          Sign In
        </Link>
      </p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full pt-5  space-y-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type={"password"} {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type={"password"} {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {isPending ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : (
          <Button type="submit">Sign Up</Button>
        )}
      </form>
    </Form>
  );
}
