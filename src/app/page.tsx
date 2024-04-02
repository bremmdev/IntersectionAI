import TranslationForm from "@/components/TranslationForm";
import { auth } from "@clerk/nextjs/server";
import TranslationHistory from "@/components/TranslationHistory";

export default function Home() {
  const { userId } = auth();
  if (!userId) {
    return (
      <div className="text-center">
        <h2 className="text-lg">Sign in to translate.</h2>
      </div>
    );
  }

  return (
    <>
      <TranslationForm />
      <TranslationHistory />
    </>
  );
}
