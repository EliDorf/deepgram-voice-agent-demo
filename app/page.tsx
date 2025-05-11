"use client";
import { Suspense, useState } from "react";
import { App } from "./components/App";
import { stsConfig } from "./lib/constants";
import Header from "./components/Header";
import { withBasePath } from "./utils/deepgramUtils";
import QuestionnaireManager from "./components/QuestionnaireManager";
import { isMobile } from "react-device-detect";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex flex-col flex-grow">
        <div className="h-[20vh] md:h-auto flex-shrink-0">
          <Suspense>
            <Header logoHref={withBasePath("/")} />
          </Suspense>
        </div>

        <div className="flex flex-col md:flex-row flex-grow gap-8 p-4 md:p-8">
          <div className="flex-1 flex flex-col items-center justify-center">
            <Suspense>
              <App
                defaultStsConfig={stsConfig}
                className="flex-shrink-0 h-auto items-center"
                requiresUserActionToInitialize={isMobile}
              />
            </Suspense>
          </div>
          
          <div className="flex-1">
            <QuestionnaireManager />
          </div>
        </div>
      </div>
    </main>
  );
}