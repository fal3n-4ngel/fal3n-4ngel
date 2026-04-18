export type InteractionType = "github" | "linkedin" | "resume" | "mail" | "project" | null;

export interface CursorState {
  isInteracting: boolean;
  interactionType: InteractionType;
}

export interface LogoStates {
  isGitHubLogo: boolean;
  isLinkedInLogo: boolean;
  isResumeLogo: boolean;
  isMailLogo: boolean;
  isProjImage: boolean;
}
