import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Sparkles, Truck, ShieldCheck } from "lucide-react";
import bannerSummer from "@/assets/banner-summer.jpg.asset.json";
import bannerSale from "@/assets/banner-sale.jpg.asset.json";
import { categoriesQuery, productsQuery } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تک شاخ کیدز | فروشگاه پوشاک و اکسسوری کودک" },
      {
        name: "description",
        content:
          "خرید آنلاین لباس کودک و نوجوان، کیف، کش مو و اکسسوری با طرح‌های شاد و قیمت مناسب در تک شاخ کیدز.",
      },
      { property: "og:title", content: "تک شاخ کیدز | فروشگاه پوشاک و اکسسوری کودک" },
      {
        property: "og:description",
        content: "لباس، کیف و اکسسوری کودک و نوجوان با بهترین کیفیت.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]);
  },
  component: Home,
});

function Home() {
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);

  const featured = products.filter((p) => p.is_featured).slice(0, 8);
  const discounted = products.filter((p) => p.discount_percent > 0).slice(0, 4);

  return (
    <div>
      <section className="px-4 pt-6">
        <div
          className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] p-6 sm:p-10"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-3 py-1 text-xs font-bold text-foreground">
                <Sparkles className="size-3.5" /> کالکشن جدید تابستان
              </span>
              <h1 className="text-2xl leading-relaxed font-extrabold text-foreground sm:text-4xl sm:leading-relaxed">
                لباس‌های شاد و باکیفیت برای کودک و نوجوان
              </h1>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                از تیشرت و ست تابستانی تا کیف مدرسه، کش مو و اکسسوری‌های بامزه — همه با تم
                محبوب تک شاخ.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/products"
                  className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  شروع خرید
                </Link>
                <Link
                  to="/offers"
                  className="rounded-full border border-border bg-background px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
                >
                  کالاهای تخفیف‌دار
                </Link>
              </div>
            </div>
            <img
              src={bannerSummer.url}
              alt="کالکشن تابستان تک شاخ کیدز"
              width={1200}
              height={600}
              className="w-full rounded-3xl object-cover shadow-sm"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-3 px-4 sm:grid-cols-3">
        {[
          { icon: Truck, title: "ارسال سریع", text: "به سراسر ایران" },
          { icon: ShieldCheck, title: "ضمانت کیفیت", text: "پارچه نخی و استاندارد" },
          { icon: Sparkles, title: "طرح‌های به‌روز", text: "کالکشن فصلی" },
        ].map((f) => (
          <div
            key={f.title}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <f.icon className="size-5 text-primary" />
            <div>
              <p className="text-sm font-bold text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-4">
        <h2 className="mb-4 text-lg font-extrabold text-foreground">دسته‌بندی‌ها</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ cat: c.slug }}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto mt-12 max-w-6xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-foreground">پیشنهادهای ویژه</h2>
            <Link to="/products" className="text-sm text-primary">
              همه محصولات
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-12 max-w-6xl px-4">
        <img
          src={bannerSale.url}
          alt="حراج تک شاخ کیدز"
          loading="lazy"
          width={1920}
          height={1080}
          className="w-full rounded-3xl object-cover"
        />
      </section>

      {discounted.length > 0 && (
        <section className="mx-auto mt-12 max-w-6xl px-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-foreground">کالاهای تخفیف‌دار</h2>
            <Link to="/offers" className="text-sm text-primary">
              مشاهده همه
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {discounted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
