import { Autobind } from "../decorators/Autobind.js";
import { validatable } from "../models/validatable.js";
import { validate } from "../utils/validation.js";
import { stateInstance } from "../state/state-manager.js";
import { Component } from "./base-component.js";

export class TaskInput extends Component<HTMLDivElement, HTMLDivElement> {
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
