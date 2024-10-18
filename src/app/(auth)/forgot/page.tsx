"use client";
import { toast } from "@/components/ui/use-toast";
import { forgot } from "@/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  email: z.string().email({ message: "Must be valid email address" }),
});

export default function Page() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: forgot,
    onError: (error) => {
      toast({
        variant: "destructive",
        title: error.message,
      });
    },
    onSuccess: (res) => {
      toast({
        title: "Check your email for reset link",
        variant: "default",
      });
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const origin: string = window.location.origin;
    mutate({ origin, ...data });
  }

  return (
    <Form {...form}>
      <p className={"font-semibold text-xl"}>Forgot password</p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full pt-5 space-y-6"
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

        {isPending ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : (
          <Button type="submit">Send reset link</Button>
        )}
      </form>
    </Form>
  );
}
