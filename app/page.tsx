import { AppClientShell } from "@/components/layout/AppClientShell";
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
        <main className="flex min-h-screen w-full flex-col items-center bg-black">
          <HeroGhostSection />
          <AchievementsSection />
          <ProjectsSection initialProjects={initialProjects} />
          {/* Footer Curtain: rises from below with a sharp parallax curtain edge covering the projects section */}
          <div
            id="footer-curtain"
            className="relative z-30 w-full bg-black shadow-[0_-50px_140px_rgba(0,0,0,0.98)] border-t border-white/15 -mt-[100vh]"
          >
            <ContactSection />
            <AsciiTextCanvas />
            <Footer />
          </div>
        </main>
      </AppClientShell>
    </div>
  );
}
