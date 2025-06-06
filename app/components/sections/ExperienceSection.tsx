import FadeUp from "../ui/FadeUp";

export const ExperienceSection = () => (
  <>
    <FadeUp>
      <div className="mt-5 py-4 text-2xl font-semibold text-zinc-700 md:text-[1.5vw]">
        experience
      </div>
    </FadeUp>
    <FadeUp>
      <div className="interactable px-1 py-1">
        <div className="font-semibold">Student Associate</div>
        <a
          href="https://www.equifax.co.in/?ref=adithyakrishnan.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Equifax
        </a>
        <div className="font-sans text-gray-400">Feb 2025 - Present</div>
      </div>
      <div className="interactable px-1 py-1">
        <div className="font-semibold">SDE Intern</div>
        <a
          href="https://www.nissanmotor.jobs/ami/india/ndi/index.html?ref=adithyakrishnan.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Nissan Digital LLP
        </a>
        <div className="font-sans text-gray-400">July 2024 - Dec 2024</div>
      </div>
    </FadeUp>
    <FadeUp>
      <div className="interactable px-1 py-1">
        <div className="font-semibold">Developer Intern</div>
        <a
          href="https://www.oronium.com?ref=adithyakrishnan.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Oronium
        </a>
        <div className="font-sans text-gray-400">April 2024 - July 2024</div>
      </div>
      <div className="interactable px-1 py-1">
        <div className="font-semibold">Student Intern</div>
        <div>UST Global</div>
        <div className="font-sans text-gray-400">April 2023 - May 2023</div>
      </div>
    </FadeUp>
    <FadeUp>
      <div className="interactable px-1 py-1">
        <div className="font-semibold">Google Cloud Facilitator</div>
        <div>GDSC MBCET</div>
        <div className="font-sans text-gray-400">Nov 2022 - Dec 2023</div>
      </div>
      <div className="interactable px-1 py-1">
        <div className="font-semibold">Technical Co Lead</div>
        <div>IEEE MBCET Chapter</div>
        <div className="font-sans text-gray-400">Jan 2023 - Feb 2024</div>
      </div>
    </FadeUp>
  </>
);
