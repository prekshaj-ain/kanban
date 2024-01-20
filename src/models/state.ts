import { Task } from "./task.js";

export interface State {
  tasks: Task[];
}

export type Listener = (items: Task[]) => void;
