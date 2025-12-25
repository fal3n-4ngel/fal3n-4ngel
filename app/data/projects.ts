import { Project } from "../types/projects";
import {
  DiJava,
  DiPython,
  DiJavascript,
  DiMongodb,
  DiFirebase,
  DiReact,
  DiAndroid,
} from "react-icons/di";
import {
  SiDotnet,
  SiAngular,
  SiTypescript,
  SiTailwindcss,
  SiFramer,
  SiKotlin,
  SiCsharp,
  SiFlutter,
  SiC,
  SiPostgresql,
  SiMysql,
  SiGraphql,
  SiNextdotjs,
  SiBlockchaindotcom,
  SiSolidity,
  SiIpfs,
  SiTauri,
} from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";
import { IconType } from "react-icons";
import { BsDistributeHorizontal } from "react-icons/bs";
import { CgServerless } from "react-icons/cg";
import { FaBrain } from "react-icons/fa";

// Constants
const GITHUB_BASE = "https://github.com";
const PROJECT_TYPES = {
  DESKTOP: "Desktop App",
  WEBSITE: "Website",
  MOBILE: "Mobile App",
  JAVA_SWING: "Java | Swing App",
} as const;

const EVENT_TYPES = {
  COLLEGE: "College Project",
  SIDE: "Side Project",
  HACKATHON: "Hackathon",
  BLOCKHASH: "BlockHash",
} as const;

// Skill Icons Configuration
export const skillIcons: Record<string, IconType> = {
  "Next.js": TbBrandNextjs,
  "Angular.js": SiAngular,
  "React.js": DiReact,
  "AI/ML": FaBrain,
  Flutter: SiFlutter,
  "Tailwind CSS": SiTailwindcss,
  TypeScript: SiTypescript,
  ".NET": SiDotnet,
  Python: DiPython,
  "Stable Diffusion": SiGraphql,
  Blockchain: SiBlockchaindotcom,
  Solidity: SiSolidity,
  Tauri: SiTauri,
  "Peer to Peer": BsDistributeHorizontal,
  Serverless: CgServerless,
  Ipfs: SiIpfs,
  Ethereum: SiBlockchaindotcom,
  C: SiC,
  Java: DiJava,
  "C#": SiCsharp,
  MongoDB: DiMongodb,
  PostgreSQL: SiPostgresql,
  MySQL: SiMysql,
  Firebase: DiFirebase,
  Kotlin: SiKotlin,
};

// Common skill combinations
const WEB_STACK = ["Next.js", "TypeScript", "Tailwind CSS"];
const BLOCKCHAIN_STACK = ["Blockchain", "Solidity", "Firebase", "Ethereum"];
const AI_STACK = ["Python", "AI/ML"];

// Project Skills Mapping
export const projectSkills: Record<string, string[]> = {
  DASH: [...WEB_STACK, "Tauri", "Python", "Serverless", "Peer to Peer"],
  "FLASH DRIVE": [...WEB_STACK, "Firebase", ...AI_STACK, "Stable Diffusion"],
  Tuples: [...WEB_STACK, "Firebase", ...AI_STACK],
  "STREAM OWN YOUR OWN": WEB_STACK,
  "SMART CERTIFY": [...WEB_STACK, ...BLOCKCHAIN_STACK, "Ipfs"],
  "BETTER FUNDS": [...WEB_STACK, ...BLOCKCHAIN_STACK],
  "SUS GOALS": [...WEB_STACK, "Firebase"],
  DRISHTI: ["Flutter", "Firebase", "MongoDB"],
  "C-TRACKER": ["Java", "MySQL"],
};

// Project Data
export const projects: Project[] = [
  {
    url1: "/dash.png",
    name: "DASH",
    type: PROJECT_TYPES.DESKTOP,
    event: EVENT_TYPES.COLLEGE,
    date: "2024",
    view: `${GITHUB_BASE}/Chackoz/Dash-Desktop`,
    description:
      "DASH - Distributed Adaptive Serverless Hosting offers a peer-to-peer, cost-effective, and efficient alternative for hosting serverless functions. It delivers a streamlined solution designed with developers in mind, providing simplicity and effectiveness without compromising performance.",
  },
  {
    url1: "/Flash1.png",
    name: "FLASH DRIVE",
    type: PROJECT_TYPES.WEBSITE,
    event: EVENT_TYPES.SIDE,
    date: "2023",
    view: "https://flashdrive-f2an.vercel.app/",
    description:
      "A Next.js web platform featuring an AI image generator with custom-trained Stable Diffusion model and arcade games. Built with Firebase and EpicRealism image model, it evolved from a DBMS course project into a playground for implementing advanced web technologies.",
  },
  {
    url1: "/Tuples.png",
    name: "Tuples",
    type: PROJECT_TYPES.WEBSITE,
    event: EVENT_TYPES.SIDE,
    date: "2024",
    view: `${GITHUB_BASE}/Chackoz/Tuples`,
    description:
      "A community platform designed exclusively for students at MBCET. It enables users to find friend matches based on shared interests, create and join projects, and engage in collaborative chats and topic-based community groups. Created as a B.Tech mini project.",
  },
  {
    url1: "/SOYO.png",
    name: "STREAM OWN YOUR OWN",
    type: PROJECT_TYPES.WEBSITE,
    event: EVENT_TYPES.SIDE,
    date: "2024",
    view: `${GITHUB_BASE}/fal3n-4ngel/SOYO`,
    description:
      "A Next.js-powered local streaming solution that turns your computer into a personal media server. Built to solve the problem of limited mobile storage, SOYO lets you stream your video library across all devices on your network through a clean, modern interface.",
  },
  {
    url1: "/smartcertify.png",
    name: "SMART CERTIFY",
    type: PROJECT_TYPES.WEBSITE,
    event: EVENT_TYPES.BLOCKHASH,
    date: "2023",
    view: `${GITHUB_BASE}/Deflated-Pappadam/Smart-Certify`,
    description:
      "A blockchain-based certification platform that uniquely identifies organizations through secure wallet IDs and authenticates users via AADHAR integration, ensuring tamper-proof documentation. This project secured the winning spot at BlockHash 2023 by the Kerala Blockchain Academy.",
  },
  {
    url1: "/betterfunds.png",
    name: "BETTER FUNDS",
    type: PROJECT_TYPES.WEBSITE,
    event: EVENT_TYPES.HACKATHON,
    date: "2024",
    view: "https://better-funds.vercel.app/",
    description:
      "Developed in a 24-hour hackathon (Zilckathon - HFT), Better Funds is a blockchain-based incentivized crowdfunding platform. Contributors earn tokens proportional to their contributions, which can be redeemed in a marketplace.",
  },
  {
    url1: "/Sustaina1.png",
    name: "SUS GOALS",
    type: PROJECT_TYPES.WEBSITE,
    event: EVENT_TYPES.SIDE,
    date: "2023",
    view: "https://sus-goals.vercel.app/",
    description:
      "A college project centered on promoting sustainable development goals (SDGs). SUS Goals provides users with daily tasks to complete and maintains a global counter of completed tasks, helping SDGs through an engaging digital experience.",
  },
  {
    url1: "/Drish.png",
    name: "DRISHTI",
    type: PROJECT_TYPES.MOBILE,
    event: EVENT_TYPES.HACKATHON,
    date: "2022",
    view: `${GITHUB_BASE}/fal3n-4ngel/Drishti-Client`,
    description:
      "Drishti simplifies hazard reporting and notifications, focusing on incidents like snapped powerlines or broken pipelines. Developed for Define Hack 2022, it enables users to report hazards, receive alerts, and track report status, while admins manage responses through a web service.",
  },
  {
    url1: "/Ctrack.png",
    name: "C-TRACKER",
    type: PROJECT_TYPES.JAVA_SWING,
    event: EVENT_TYPES.COLLEGE,
    date: "2023",
    view: `${GITHUB_BASE}/fal3n-4ngel/CTracker`,
    description:
      "A Java Swing GUI application tailored as an academic-themed task manager. C-Tracker employs SQLite for efficient database management and features tools for adding, editing, deleting, and tracking academic tasks.",
  },
];
