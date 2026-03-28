import { cn } from "@/lib/utils";

export function PageIntro({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {eyebrow ? <p className="medify-pill">{eyebrow}</p> : null}
      <h2 className="max-w-4xl text-4xl font-semibold leading-[0.95] text-[#24304d] dark:text-[#edf3ff] md:text-5xl">{title}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[#68779b] dark:text-[#aab8d8] md:text-base">{description}</p>
    </div>
  );
}
