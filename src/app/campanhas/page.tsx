import { Suspense } from "react";
import { Metadata } from "next";
import { CampanhasClientPage } from "./components/campanhas-client-page";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Campanhas | Marketing App",
  description: "Gerencie suas campanhas de marketing de forma eficiente",
};

export default function CampanhasPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando campanhas...</p>
        </div>
      </div>
    }>
      <CampanhasClientPage />
    </Suspense>
  );
}

