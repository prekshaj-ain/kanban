import { Listener, State } from "../models/state.js";
import { Task, TaskStatus } from "../models/task.js";

class StateManager {
  private static instance: StateManager;
  private listeners: Listener[] = [];
  private state: State = {
    tasks: [],
  };
  private constructor() {
    this.state = {
      tasks: [],
    };
  }
  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }

    return StateManager.instance;
  }
  addListener(listenerFn: Listener): void {
    this.listeners.push(listenerFn);
  }
  addTask(title: string, description: string, numOfPeople: number): void {
    let newTask = new Task(
      (+new Date()).toString(),
      title,
      description,
      numOfPeople,
      TaskStatus.todo
    );
    this.state.tasks.push(newTask);
    this.notify();
  }

  moveProject(taskId: string, taskStatus: TaskStatus): void {
    const task = this.state.tasks.find((task) => task.id == taskId);
    if (task && task.status !== taskStatus) {
      task.status = taskStatus;
      this.notify();
    }
  }

  private notify(): void {
    for (let listener of this.listeners) {
      listener(this.state.tasks.slice());
    }
  }
}

export const stateInstance = StateManager.getInstance();
