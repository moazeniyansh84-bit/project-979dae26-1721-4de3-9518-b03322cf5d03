import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, productsQuery, type Product } from "@/lib/catalog";
import { AGE_LABELS, GENDER_LABELS, formatPrice, toFa } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "پنل مدیریت | تک شاخ کیدز" },
      { name: "description", content: "مدیریت محصولات، قیمت، تخفیف و موجودی فروشگاه." },
      { property: "og:title", content: "پنل مدیریت | تک شاخ کیدز" },
      { property: "og:description", content: "مدیریت فروشگاه تک شاخ کیدز." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Draft = {
  id?: string;
  name: string;
  description: string;
  category_id: string;
  price: string;
  discount_percent: string;
  stock: string;
  gender: string;
  age_group: string;
  sizes: string;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
};

const emptyDraft: Draft = {
  name: "",
  description: "",
  category_id: "",
  price: "",
  discount_percent: "0",
  stock: "0",
  gender: "girl",
  age_group: "kids",
  sizes: "",
  images: [],
  is_featured: false,
  is_active: true,
};

const inputClass =
  "w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [newCat, setNewCat] = useState("");

  useEffect(() => {
    supabase.rpc("claim_admin").then(({ data }) => setIsAdmin(Boolean(data)));
  }, []);

  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: products = [] } = useQuery(productsQuery);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["products"] });
    void qc.invalidateQueries({ queryKey: ["categories"] });
  };

  if (isAdmin === null) {
    return <p className="py-24 text-center text-sm text-muted-foreground">در حال بارگذاری…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-sm text-foreground">این حساب دسترسی مدیریت ندارد.</p>
        <button
          onClick={signOut}
          className="mt-4 rounded-full border border-border px-5 py-2.5 text-sm"
        >
          خروج از حساب
        </button>
      </div>
    );
  }

  const startEdit = (p: Product) =>
    setDraft({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      category_id: p.category_id ?? "",
      price: String(p.price),
      discount_percent: String(p.discount_percent),
      stock: String(p.stock),
      gender: p.gender,
      age_group: p.age_group,
      sizes: p.sizes.join(", "),
      images: p.images,
      is_featured: p.is_featured,
      is_active: p.is_active,
    });

  const uploadImage = async (file: File) => {
    if (!draft) return;
    setBusy(true);
    setNote(null);
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      setNote("آپلود تصویر انجام نشد.");
      setBusy(false);
      return;
    }
    const { data } = await supabase.storage
      .from("product-images")
      .createSignedUrl(path, 60 * 60 * 24 * 3650);
    if (data?.signedUrl) {
      setDraft({ ...draft, images: [...draft.images, data.signedUrl] });
    }
    setBusy(false);
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setNote(null);
    const payload = {
      name: draft.name,
      description: draft.description || null,
      category_id: draft.category_id || null,
      price: Number(draft.price) || 0,
      discount_percent: Math.min(99, Math.max(0, Number(draft.discount_percent) || 0)),
      stock: Number(draft.stock) || 0,
      gender: draft.gender,
      age_group: draft.age_group,
      sizes: draft.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      images: draft.images,
      is_featured: draft.is_featured,
      is_active: draft.is_active,
    };
    const { error } = draft.id
      ? await supabase.from("products").update(payload).eq("id", draft.id)
      : await supabase.from("products").insert(payload);
    if (error) setNote("ذخیره نشد: " + error.message);
    else {
      setDraft(null);
      refresh();
    }
    setBusy(false);
  };

  const removeProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) setNote("حذف نشد: " + error.message);
    else refresh();
  };

  const addCategory = async () => {
    if (!newCat.trim()) return;
    const slug = "cat-" + Math.random().toString(36).slice(2, 8);
    const { error } = await supabase
      .from("categories")
      .insert({ name: newCat.trim(), slug, sort_order: categories.length + 1 });
    if (error) setNote("دسته اضافه نشد: " + error.message);
    else {
      setNewCat("");
      refresh();
    }
  };

  const removeCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) setNote("حذف دسته انجام نشد: " + error.message);
    else refresh();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold text-foreground">پنل مدیریت</h1>
        <div className="flex items-center gap-2">
          <Link to="/" className="rounded-full border border-border px-4 py-2 text-xs">
            مشاهده فروشگاه
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-1 rounded-full border border-border px-4 py-2 text-xs"
          >
            <LogOut className="size-3.5" /> خروج
          </button>
        </div>
      </div>

      {note && <p className="mt-4 text-xs text-destructive">{note}</p>}

      <section className="mt-6 rounded-3xl border border-border bg-card p-5">
        <h2 className="text-sm font-extrabold text-foreground">دسته‌بندی‌ها</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground"
            >
              {c.name}
              <button onClick={() => removeCategory(c.id)} aria-label="حذف دسته">
                <Trash2 className="size-3.5 text-muted-foreground" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="نام دسته جدید"
            className={inputClass}
          />
          <button
            onClick={addCategory}
            className="shrink-0 rounded-2xl bg-primary px-5 text-xs font-bold text-primary-foreground"
          >
            افزودن
          </button>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-foreground">
            محصولات ({toFa(products.length)})
          </h2>
          <button
            onClick={() => setDraft({ ...emptyDraft })}
            className="flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground"
          >
            <Plus className="size-4" /> محصول جدید
          </button>
        </div>

        {draft && (
          <div className="mt-4 space-y-3 rounded-3xl border border-primary/40 bg-card p-5">
            <p className="text-sm font-extrabold text-foreground">
              {draft.id ? "ویرایش محصول" : "افزودن محصول"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="نام محصول"
                className={inputClass}
              />
              <select
                value={draft.category_id}
                onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
                className={inputClass}
              >
                <option value="">بدون دسته</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={draft.price}
                inputMode="numeric"
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                placeholder="قیمت (تومان)"
                className={inputClass}
              />
              <input
                value={draft.discount_percent}
                inputMode="numeric"
                onChange={(e) => setDraft({ ...draft, discount_percent: e.target.value })}
                placeholder="درصد تخفیف"
                className={inputClass}
              />
              <input
                value={draft.stock}
                inputMode="numeric"
                onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                placeholder="موجودی"
                className={inputClass}
              />
              <input
                value={draft.sizes}
                onChange={(e) => setDraft({ ...draft, sizes: e.target.value })}
                placeholder="سایزها با ویرگول: 4-5, 6-7"
                className={inputClass}
              />
              <select
                value={draft.gender}
                onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                className={inputClass}
              >
                {Object.entries(GENDER_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <select
                value={draft.age_group}
                onChange={(e) => setDraft({ ...draft, age_group: e.target.value })}
                className={inputClass}
              >
                {Object.entries(AGE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="توضیحات محصول"
              rows={3}
              className={inputClass}
            />

            <div className="flex flex-wrap items-center gap-3">
              {draft.images.map((img) => (
                <span key={img} className="relative">
                  <img
                    src={img}
                    alt="تصویر محصول"
                    loading="lazy"
                    width={64}
                    height={64}
                    className="size-16 rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    aria-label="حذف تصویر"
                    onClick={() =>
                      setDraft({ ...draft, images: draft.images.filter((i) => i !== img) })
                    }
                    className="absolute -top-1 -left-1 grid size-5 place-items-center rounded-full bg-destructive text-[10px] text-destructive-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
              <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                <Upload className="size-4" />
                آپلود تصویر
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadImage(f);
                  }}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.is_featured}
                  onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
                />
                پیشنهاد ویژه
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                />
                نمایش در فروشگاه
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={busy || !draft.name}
                className="rounded-full bg-primary px-6 py-3 text-xs font-bold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "در حال ذخیره…" : "ذخیره"}
              </button>
              <button
                onClick={() => setDraft(null)}
                className="rounded-full border border-border px-6 py-3 text-xs"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        <ul className="mt-4 space-y-2">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              {p.images[0] ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  loading="lazy"
                  width={56}
                  height={56}
                  className="size-14 rounded-xl object-cover"
                />
              ) : (
                <div className="size-14 rounded-xl bg-muted" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(p.price)} · تخفیف {toFa(p.discount_percent)}٪ · موجودی{" "}
                  {toFa(p.stock)}
                </p>
              </div>
              <button
                onClick={() => startEdit(p)}
                aria-label="ویرایش"
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => removeProduct(p.id)}
                aria-label="حذف"
                className="rounded-xl p-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
