import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SiteHeader, SiteFooter } from "../components/site-chrome";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="rise-in max-w-md text-center">
        <p className="text-eyebrow">lost thread</p>
        <h1 className="mt-5 font-serif text-6xl font-light text-rose-deep">404</h1>
        <h2 className="mt-5 text-3xl italic">this page slipped away.</h2>
        <p className="text-lede mx-auto mt-5 max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-9">
          <Link to="/" className="btn-base btn-primary">
            back home ♡
          </Link>
        </div>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="rise-in max-w-md text-center">
        <p className="text-eyebrow">a small snag</p>
        <h1 className="mt-5 text-4xl italic">this page didn't load.</h1>
        <p className="text-lede mx-auto mt-5 max-w-xs">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-base btn-primary"
          >
            try again
          </button>
          <a href="/" className="btn-base btn-quiet">
            go home
          </a>
        </div>
      </div>
    </div>
  );

}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "rewearie ♡ — give your clothes another little life" },
      {
        name: "description",
        content:
          "An AI-assisted circular fashion companion that helps you rewear, repair, upcycle, resell, donate or recycle the clothes you no longer wear.",
      },
      { property: "og:title", content: "rewearie ♡" },
      {
        property: "og:description",
        content: "give your clothes another little life.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
