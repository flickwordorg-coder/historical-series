import { Container } from "@/components/ui/Container";
import { EpisodeListSkeleton, Skeleton } from "@/components/ui/Skeleton";

/**
 * Route-level loading UI for `/[slug]/`.
 *
 * Mirrors the episode detail layout so the transition into real content does not
 * shift the page. Pure CSS animation, zero JS beyond the App Router boundary.
 */
export default function Loading() {
  return (
    <Container className="py-10 sm:py-14">
      <Skeleton className="h-3 w-48" />

      <Skeleton className="mt-6 h-12 w-3/4 max-w-2xl" />
      <Skeleton className="mt-3 h-12 w-1/2 max-w-xl" />

      <Skeleton className="mt-8 aspect-video w-full rounded-[var(--radius-panel)]" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <EpisodeListSkeleton rows={6} />
        <Skeleton className="h-64 w-full rounded-[var(--radius-panel)]" />
      </div>
    </Container>
  );
}
