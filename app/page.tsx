import { AppClientShell } from "@/components/layout/AppClientShell";
import { HeroGhostSection } from "@/components/sections/HeroGhostSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { AsciiTextCanvas } from "@/components/features/AsciiTextCanvas";
import { Footer } from "@/components/layout/Footer";
import { getAwards, getExperiences, getProjects } from "@/lib/integrations/notion";
import { Project } from "@/types/projects";

export default async function Home() {
  const [initialProjects, initialExperiences, initialAwards] = await Promise.all([
    getProjects().catch(() => []),
    getExperiences().catch(() => []),
    getAwards().catch(() => []),
  ]);

  return (
    <div className="h-full min-h-screen w-full bg-black text-white selection:bg-white selection:text-black">
      <AppClientShell>
        <main className="flex min-h-screen w-full flex-col items-center bg-black">
          <HeroGhostSection />
          <AchievementsSection
            initialExperiences={initialExperiences ?? []}
            initialAwards={initialAwards ?? []}
          />
          <ProjectsSection initialProjects={initialProjects ?? []} />
          {/* Footer & Contact Section */}
          <div
            id="footer-curtain"
            className="relative z-30 w-full bg-black border-t border-white/10"
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
