import { cn } from "@/lib/utils";

/**
 * Responsive page gutter + max width.
 *
 * The single definition of horizontal rhythm — every page, rail and hero uses
 * it, which is why nothing ever misaligns between sections.
 */
export function Container({
  className,
  as: Tag = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "article" | "header" | "footer" | "main" }) {
  return <Tag className={cn("container-page", className)} {...props} />;
}