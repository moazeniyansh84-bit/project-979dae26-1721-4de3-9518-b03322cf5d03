import { Link } from "@tanstack/react-router";
import { MapPin, Phone } from "lucide-react";

const PHONE_E164 = "09227094526";
const PHONE_FA = "۰۹۲۲۷۰۹۴۵۲۶";
const ADDRESS = "تهران، ستارخان، خیابان شادمهر، پلاک ۳۰۳، فروشگاه تک شاخ کیدز";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-2">
          <p className="text-base font-extrabold text-foreground">تک شاخ کیدز</p>
          <p className="text-sm leading-6 text-muted-foreground">
            لباس، کیف و اکسسوری کودک و نوجوان با بهترین کیفیت و قیمت مناسب.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-bold text-foreground">دسترسی سریع</p>
          <Link to="/products" className="block text-muted-foreground hover:text-foreground">
            همه محصولات
          </Link>
          <Link to="/offers" className="block text-muted-foreground hover:text-foreground">
            کالاهای تخفیف‌دار
          </Link>
          <Link to="/cart" className="block text-muted-foreground hover:text-foreground">
            سبد خرید
          </Link>
          <Link to="/contact" className="block text-muted-foreground hover:text-foreground">
            تماس با ما
          </Link>
          <Link to="/admin" className="block text-muted-foreground hover:text-foreground">
            ورود مدیر
          </Link>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="font-bold text-foreground">ارتباط با ما</p>
          <a
            href={`tel:${PHONE_E164}`}
            className="flex items-center gap-2 text-foreground hover:underline"
          >
            <Phone className="size-4" />
            <span dir="ltr">{PHONE_FA}</span>
          </a>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>{ADDRESS}</span>
          </p>
          <p>پاسخگویی: شنبه تا پنجشنبه، ۱۰ تا ۱۸</p>
        </div>
      </div>
      <p className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © تک شاخ کیدز — تمام حقوق محفوظ است.
      </p>
    </footer>
  );
}

