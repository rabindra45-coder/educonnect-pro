import { useEffect } from "react";

export type PortalKey = "main" | "student" | "parent" | "teacher" | "admin" | "accountant" | "library";

const MANIFEST_BY_PORTAL: Record<PortalKey, string> = {
  main: "/manifest.json",
  student: "/manifest-student.json",
  parent: "/manifest-parent.json",
  teacher: "/manifest-teacher.json",
  admin: "/manifest-admin.json",
  accountant: "/manifest-accountant.json",
  library: "/manifest-library.json",
};

const THEME_BY_PORTAL: Record<PortalKey, string> = {
  main: "#1e3a5f",
  student: "#1e3a5f",
  parent: "#7c2d12",
  teacher: "#065f46",
  admin: "#0f172a",
  accountant: "#854d0e",
  library: "#581c87",
};

const TITLE_BY_PORTAL: Record<PortalKey, string> = {
  main: "Milestone College",
  student: "MIC Student",
  parent: "MIC Parent",
  teacher: "MIC Teacher",
  admin: "MIC Admin",
  accountant: "MIC Accounts",
  library: "MIC Library",
};

/**
 * Swap the linked manifest, theme color and apple title so iOS treats each
 * portal as a distinct installable app on the home screen.
 */
export function useDynamicManifest(portal: PortalKey) {
  useEffect(() => {
    const manifestHref = MANIFEST_BY_PORTAL[portal];
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = manifestHref;

    let theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!theme) {
      theme = document.createElement("meta");
      theme.name = "theme-color";
      document.head.appendChild(theme);
    }
    theme.content = THEME_BY_PORTAL[portal];

    let apple = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
    if (!apple) {
      apple = document.createElement("meta");
      apple.name = "apple-mobile-web-app-title";
      document.head.appendChild(apple);
    }
    apple.content = TITLE_BY_PORTAL[portal];

    return () => {
      // Restore main manifest when leaving portal install page
      if (link) link.href = MANIFEST_BY_PORTAL.main;
      if (theme) theme.content = THEME_BY_PORTAL.main;
      if (apple) apple.content = TITLE_BY_PORTAL.main;
    };
  }, [portal]);
}
