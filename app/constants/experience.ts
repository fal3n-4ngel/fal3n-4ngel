export interface ExperienceItem {
  title: string;
  company: string;
  companyUrl?: string;
  period: string;
}

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    title: "Software Engineer",
    company: "Equifax",
    companyUrl: "https://www.equifax.co.in/?ref=adithyakrishnan.com",
    period: "Feb 2025 - Present",
  },
  {
    title: "SDE Intern",
    company: "Nissan Digital LLP",
    companyUrl: "https://www.nissanmotor.jobs/ami/india/ndi/index.html?ref=adithyakrishnan.com",
    period: "July 2024 - Dec 2024",
  },
  {
    title: "Developer",
    company: "Oronium",
    companyUrl: "https://www.oronium.com?ref=adithyakrishnan.com",
    period: "April 2024 - July 2024",
  },
];
