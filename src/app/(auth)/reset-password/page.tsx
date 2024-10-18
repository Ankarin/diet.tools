"use client";
import { reset } from "@/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";

const FormSchema = z
  .object({
    password: z.string().min(8, { message: "Invalid password" }),
    confirmPassword: z.string().min(8, { message: "Invalid password" }),
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
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: reset,
    onError: (error) => {
      toast({
        variant: "destructive",
        title: error.message,
      });
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    mutate({ password: data.password });
  }

  return (
    <Form {...form}>
      <p className={"font-semibold text-xl"}>Reset Password</p>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full pt-5  space-y-6"
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
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
              <FormLabel>Confirm New Password</FormLabel>
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
          <Button type="submit">Login</Button>
        )}
      </form>
    </Form>
  );
}
