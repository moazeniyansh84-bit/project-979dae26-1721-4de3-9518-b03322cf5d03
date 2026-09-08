import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "کالاهای تخفیف‌دار | تک شاخ کیدز" },
      {
        name: "description",
        content: "تخفیف‌های ویژه پوشاک و اکسسوری کودک و نوجوان در تک شاخ کیدز.",
      },
      { property: "og:title", content: "کالاهای تخفیف‌دار | تک شاخ کیدز" },
      {
        property: "og:description",
        content: "فرصت خرید محصولات کودک و نوجوان با قیمت ویژه.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery),
  component: OffersPage,
});

function OffersPage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const items = products.filter((p) => p.is_active && p.discount_percent > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-xl font-extrabold text-foreground">کالاهای تخفیف‌دار</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        محصولاتی که همین حالا با قیمت ویژه عرضه می‌شوند.
      </p>
      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          فعلاً محصول تخفیف‌داری نداریم.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
