import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/app/page-header";

export default function Loading() {
  return (
    <PageContainer aria-busy="true">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <Skeleton className="mt-4 h-48" />
    </PageContainer>
  );
}
