import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServiceClient } from "@/lib/supabase";
import { EDU_SERVICE } from "@/lib/depositService";
import StudentSurveyForm from "./StudentSurveyForm";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `수강생 사전 질문지 · ${id}` };
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

  return data || null;
}

export default async function SurveyPage({ params }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream/40">
        <section className="container-edu max-w-3xl py-12">
          <StudentSurveyForm order={order} />
        </section>
      </main>
      <Footer />
    </>
  );
}
