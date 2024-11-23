export interface Project {
  url1: string;
  name: string;
  type: string;
  event: string;
  date: string;
  view: string;
  description: string;
}

export interface GitProject {
  url1: number;
  name: string;
  type: string;
  event: string;
  date: string;
  view: string;
}

export interface ProjectBoxProps extends Project {
  onVisible: () => void;
}

export interface GitProjectBoxProps extends GitProject {
  onVisible: () => void;
}
export type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string;
  created_at: string;
  fork: boolean;
  stargazers_count: number;
};
