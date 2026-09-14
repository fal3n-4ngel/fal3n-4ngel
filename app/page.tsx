import { AppClientShell } from "@/components/layout/AppClientShell";
import { StickySubHeader } from "@/components/layout/StickySubHeader";
import { HeroGhostSection } from "@/components/sections/HeroGhostSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { AsciiTextCanvas } from "@/components/features/AsciiTextCanvas";
import { Footer } from "@/components/layout/Footer";
import { getProjects } from "@/lib/integrations/notion";
import { Project } from "@/types/projects";

export default async function Home() {
  let initialProjects: Project[] = [];
  try {
    initialProjects = (await getProjects()) ?? [];
  } catch {
    initialProjects = [];
  }

  return (
    <div className="h-full min-h-screen w-full bg-black text-white selection:bg-white selection:text-black">
      <AppClientShell>
        <StickySubHeader />
        <main className="flex min-h-screen w-full flex-col items-center bg-black">
          <HeroGhostSection />
          <AchievementsSection />
          <ProjectsSection initialProjects={initialProjects} />
          <ContactSection />
          <AsciiTextCanvas />
          <Footer />
        </main>
      </AppClientShell>
    </div>
  );
}
