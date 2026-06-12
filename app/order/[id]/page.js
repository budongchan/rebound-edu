import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderStatusClient from "./OrderStatusClient";
import { BANK } from "@/lib/company";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";
import { mergeStoredGuidance } from "@/lib/courseGuidance";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `주문완료 · ${id}` };
}

async function getOrder(orderId) {
  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from(EDU_SERVICE.targetTable)
    .select(EDU_SERVICE.targetSelect)
    .eq(EDU_SERVICE.orderIdColumn, orderId)
    .limit(1)
    .maybeSingle();

  return data ? { ...data, guidance: mergeStoredGuidance(data) } : null;
}

export default async function OrderPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream/40">
        <section className="container-edu py-12">
          <Link href="/courses" className="text-[13px] font-semibold text-ink-soft hover:text-ink">
            ← 강의 목록으로
          </Link>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_380px]">
            <OrderStatusClient
              initialOrder={order}
              bank={{
                name: BANK.name,
                account: BANK.account,
                holder: BANK.holder,
              }}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
