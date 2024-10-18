import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const rainbowButtonVariants = cva(
  "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      colorScheme: {
        black: [
          "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
          "text-white",
        ],
        white: [
          "bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
          "text-black",
        ],
        green: [
          "bg-[linear-gradient(#093028,#093028),linear-gradient(#093028_50%,rgba(9,48,40,0.6)_80%,rgba(9,48,40,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
          "text-white",
        ],
      },
    },
    defaultVariants: {
      colorScheme: "green",
    },
  },
);

export interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rainbowButtonVariants> {}

const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, colorScheme, ...props }, ref) => {
    return (
      <button
        className={cn(rainbowButtonVariants({ colorScheme }), className)}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{props.children}</span>
        <span
          className="absolute bottom-[-20%] left-1/2 z-0 h-1/5 w-3/5 -translate-x-1/2 animate-rainbow bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] bg-[length:200%]"
          style={{ filter: "blur(calc(0.8*1rem))" }}
        />
      </button>
    );
  },
);
RainbowButton.displayName = "RainbowButton";

export { rainbowButtonVariants };
export default RainbowButton;
