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

class StateManager {
  private static instance: StateManager;
  private listeners: any[] = [];
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
  addListener(listenerFn: Function): void {
    this.listeners.push(listenerFn);
  }
  addTask(title: string, description: string, numOfPeople: number): void {
    let newTask = new Task(
      new Date().toString(),
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

class TaskList {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLElement;
  assignedTasks: Task[];
  constructor(private type: "todo" | "done") {
    this.assignedTasks = [];
    this.hostElement = document.getElementById("board")! as HTMLDivElement;
    this.templateElement = document.getElementById(
      "tasks-list"
    )! as HTMLTemplateElement;
    const clonedNode = this.templateElement.content.cloneNode(
      true
    )! as DocumentFragment;
    this.element = clonedNode.firstElementChild! as HTMLElement;
    this.element.id = `${this.type}-tasks`;
    stateInstance.addListener((tasks: any[]) => {
      this.assignedTasks = tasks;
      this.renderTasks();
    });
    this.attach();
    this.renderContent();
  }
  private renderContent() {
    let id = `${this.type}-tasks-list`;
    this.element.querySelector("ul")!.id = id;
    this.element.querySelector("p")!.innerText = this.type.toUpperCase();
  }
  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }

  private renderTasks() {
    let listId = document.getElementById(
      `${this.type}-tasks-list`
    )! as HTMLUListElement;
    for (let taskItem of this.assignedTasks) {
      let listItem = document.createElement("li");
      listItem.textContent = taskItem.title;
      listId.appendChild(listItem);
    }
  }
}

class TaskInput {
  hostElement: HTMLDivElement;
  templateElement: HTMLTemplateElement;
  element: HTMLDivElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  constructor() {
    this.hostElement = document.getElementById("root")! as HTMLDivElement;
    this.templateElement = document.getElementById(
      "task-input"
    )! as HTMLTemplateElement;
    const clonedNode = this.templateElement.content.cloneNode(
      true
    ) as DocumentFragment;
    this.element = clonedNode.firstElementChild! as HTMLDivElement;
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
    this.attach();
  }
  private gatherTaskInfo(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;
    const titleValidatable: validatable = {
      value: title,
      required: true,
      minLength: 3,
      maxLength: 20,
    };
    const descriptionValidatable: validatable = {
      value: description,
      required: true,
      minLength: 5,
      maxLength: 40,
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
  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

let taskInput = new TaskInput();
let todoTasks = new TaskList("todo");
let doneTasks = new TaskList("done");
