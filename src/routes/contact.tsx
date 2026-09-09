import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با ما — تک شاخ کیدز" },
      {
        name: "description",
        content: "راه‌های ارتباطی فروشگاه تک شاخ کیدز: تلفن، آدرس و ساعت پاسخگویی.",
      },
      { property: "og:title", content: "تماس با ما — تک شاخ کیدز" },
      {
        property: "og:description",
        content: "راه‌های ارتباطی فروشگاه تک شاخ کیدز.",
      },
    ],
  }),
  component: ContactPage,
});

const PHONE_E164 = "09227094526";
const PHONE_FA = "۰۹۲۲۷۰۹۴۵۲۶";
const ADDRESS = "تهران، ستارخان، خیابان شادمهر، پلاک ۳۰۳، فروشگاه تک شاخ کیدز";

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-extrabold text-foreground">تماس با ما</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        برای سفارش، پیگیری یا هر سؤال دیگر با ما در تماس باشید.
      </p>

      <div className="space-y-4 rounded-[2rem] border border-border bg-card p-6">
        <a
          href={`tel:${PHONE_E164}`}
          className="flex items-center gap-4 rounded-2xl bg-secondary/60 p-4 transition-colors hover:bg-secondary"
        >
          <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
            <Phone className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">تلفن تماس</p>
            <p className="text-base font-semibold text-foreground ltr:text-right" dir="ltr">
              {PHONE_FA}
            </p>
          </div>
        </a>

        <div className="flex items-start gap-4 rounded-2xl bg-secondary/60 p-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <MapPin className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">آدرس فروشگاه</p>
            <p className="text-sm leading-7 text-muted-foreground">{ADDRESS}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-secondary/60 p-4">
          <p className="text-sm font-bold text-foreground">ساعت پاسخگویی</p>
          <p className="text-sm text-muted-foreground">شنبه تا پنجشنبه، ۱۰ صبح تا ۶ عصر</p>
        </div>
      </div>
    </div>
  );
}
