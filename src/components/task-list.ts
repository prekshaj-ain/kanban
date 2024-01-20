import { dropTarget } from "../models/drag-drop.js";
import { Task, TaskStatus } from "../models/task.js";
import { Autobind } from "../decorators/Autobind.js";
import { stateInstance } from "../state/state-manager.js";
import { TaskItem } from "./task-item.js";
import { Component } from "./base-component.js";

export class TaskList
  extends Component<HTMLDivElement, HTMLElement>
  implements dropTarget
{
  assignedTasks: Task[];
  constructor(private type: "todo" | "done") {
    super("tasks-list", "board", false, `${type}-tasks`);
    this.assignedTasks = [];
    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] == "text/plain") {
      this.element.classList.add("droppable");
      event.preventDefault();
    }
  }

  @Autobind
  dragLeaveHandler(_: DragEvent): void {
    this.element.classList.remove("droppable");
  }

  @Autobind
  dropHandler(event: DragEvent): void {
    this.element.classList.remove("droppable");

    const taskId = event.dataTransfer?.getData("text/plain")!;
    stateInstance.moveProject(
      taskId,
      this.type === "todo" ? TaskStatus.todo : TaskStatus.done
    );
  }
  protected renderContent(): void {
    let id = `${this.type}-tasks-list`;
    this.element.querySelector("ul")!.id = id;
    this.element.querySelector("p")!.innerText = this.type.toUpperCase();
  }

  protected configure(): void {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    stateInstance.addListener((tasks: Task[]) => {
      let relevantTask = tasks.filter((task) => {
        if (this.type == "todo") {
          return task.status === TaskStatus.todo;
        } else {
          return task.status === TaskStatus.done;
        }
      });
      this.assignedTasks = relevantTask;
      this.renderTasks();
    });
  }

  private renderTasks() {
    let listId = document.getElementById(
      `${this.type}-tasks-list`
    )! as HTMLUListElement;
    listId.innerText = "";
    for (let taskItem of this.assignedTasks) {
      new TaskItem(listId.id, taskItem);
    }
  }
}
