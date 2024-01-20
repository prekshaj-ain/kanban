import { draggable } from "../models/drag-drop.js";
import { Task } from "../models/task.js";
import { Autobind } from "../decorators/Autobind.js";
import { Component } from "./base-component.js";

export class TaskItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements draggable
{
  private task: Task;
  constructor(hostId: string, task: Task) {
    super("single-task", hostId, false, task.id);
    this.task = task;
    this.configure();
    this.renderContent();
  }
  @Autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.task.id);
    event.dataTransfer!.effectAllowed = "move";
    (<Element>event.target).classList.add("draggable");
  }
  @Autobind
  dragEndHandler(event: DragEvent): void {
    (<Element>event.target).classList.remove("draggable");
  }

  protected configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }
  protected renderContent(): void {
    this.element.querySelector(".task-title")!.textContent = this.task.title;
    this.element.querySelector(".task-people")!.textContent =
      this.task.people.toString();
    this.element.querySelector(".task-description")!.textContent =
      this.task.description;
  }
}
