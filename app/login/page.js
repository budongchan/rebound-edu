import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] items-center justify-center bg-cream/40 px-5 py-16">
        <Suspense fallback={
          <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
