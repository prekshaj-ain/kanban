// interfaces
interface validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}
interface State {
  tasks: Task[];
}

// drag and drop interface
interface draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface dropTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// validation function
function validate(validatableInput: validatable): boolean {
  let isValid: boolean = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value == "string"
  ) {
    isValid =
      isValid && validatableInput.value.length < validatableInput.maxLength;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value == "string"
  ) {
    isValid =
      isValid && validatableInput.value.length > validatableInput.minLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value == "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value == "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  let originalMethod = descriptor.value;
  let adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustedDescriptor;
}
enum TaskStatus {
  todo,
  done,
}

class Task {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: TaskStatus
  ) {}
}

type Listener = (items: Task[]) => void;

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
    for (let listener of this.listeners) {
      listener(this.state.tasks.slice());
    }
  }
}

const stateInstance = StateManager.getInstance();

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  constructor(
    private templateId: string,
    private hostElementId: string,
    private insertAtBegin: boolean,
    private newElementId?: string
  ) {
    this.hostElement = document.getElementById(this.hostElementId)! as T;
    this.templateElement = document.getElementById(
      this.templateId
    )! as HTMLTemplateElement;
    const clonedNode = this.templateElement.content.cloneNode(
      true
    )! as DocumentFragment;
    this.element = clonedNode.firstElementChild! as U;
    if (typeof this.newElementId == "string") {
      this.element.id = this.newElementId;
    }
    this.attach(this.insertAtBegin);
  }

  private attach(insertAtBegin: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBegin ? "afterbegin" : "beforeend",
      this.element
    );
  }
  protected abstract configure(): void;
  protected abstract renderContent(): void;
}

class TaskItem
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
    console.log(event);
  }
  @Autobind
  dragEndHandler(event: DragEvent): void {
    console.log(event);
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

class TaskList extends Component<HTMLDivElement, HTMLElement> {
  assignedTasks: Task[];
  constructor(private type: "todo" | "done") {
    super("tasks-list", "board", false, `${type}-tasks`);
    this.assignedTasks = [];
    this.configure();
    this.renderContent();
  }
  protected renderContent(): void {
    let id = `${this.type}-tasks-list`;
    this.element.querySelector("ul")!.id = id;
    this.element.querySelector("p")!.innerText = this.type.toUpperCase();
  }

  protected configure(): void {
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

class TaskInput extends Component<HTMLDivElement, HTMLDivElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  constructor() {
    super("task-input", "root", true);
    this.titleInputElement = this.element.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    )! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    )! as HTMLInputElement;
    this.configure();
  }
  private gatherTaskInfo(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;
    const titleValidatable: validatable = {
      value: title,
      required: true,
      minLength: 3,
      maxLength: 40,
    };
    const descriptionValidatable: validatable = {
      value: description,
      required: true,
      minLength: 5,
      maxLength: 50,
    };
    const peopleValidatable: validatable = {
      value: +people,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Input is not valid");
      return;
    } else {
      return [title, description, +people];
    }
  }
  private clearInfo(): void {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }
  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const info = this.gatherTaskInfo();
    if (Array.isArray(info)) {
      let [title, description, people] = info;
      stateInstance.addTask(title, description, people);
      this.clearInfo();
    }
  }

  protected renderContent(): void {}

  protected configure(): void {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

let taskInput = new TaskInput();
let todoTasks = new TaskList("todo");
let doneTasks = new TaskList("done");
