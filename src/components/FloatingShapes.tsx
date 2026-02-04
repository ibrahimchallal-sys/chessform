import { cn } from "@/lib/utils";

type Shape = {
  className: string;
  delay: number;
  duration: number;
};

const SHAPES: Shape[] = [
  {
    className: "left-[-6rem] top-[-6rem] h-72 w-72 bg-primary/20",
    delay: 0,
    duration: 18,
  },
  {
    className: "right-[-7rem] top-24 h-80 w-80 bg-secondary/35",
    delay: 1.5,
    duration: 22,
  },
  {
    className: "left-10 bottom-[-7rem] h-64 w-64 bg-accent/40",
    delay: 0.8,
    duration: 20,
  },
  {
    className: "right-10 bottom-[-5rem] h-56 w-56 bg-primary/10",
    delay: 2.2,
    duration: 26,
  },
];

export function FloatingShapes({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {SHAPES.map((shape, idx) => (
        <div
          key={idx}
          className={cn(
            "absolute rounded-full blur-3xl",
            "motion-safe:animate-float",
            "[animation-timing-function:ease-in-out]",
            shape.className,
          )}
          style={{
            animationDelay: `${shape.delay}s`,
            animationDuration: `${shape.duration}s`,
          }}
        />
      ))}

      {/* Subtle soft squares for depth */}
      <div
        className={cn(
          "absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-3xl",
          "bg-secondary/15 blur-2xl",
          "motion-safe:animate-float",
        )}
        style={{ animationDelay: "0.6s", animationDuration: "24s" }}
      />
      <div
        className={cn(
          "absolute left-[15%] top-[55%] h-28 w-28 rotate-12 rounded-2xl",
          "bg-accent/18 blur-2xl",
          "motion-safe:animate-float",
        )}
        style={{ animationDelay: "1.9s", animationDuration: "28s" }}
      />
    </div>
  );
}
