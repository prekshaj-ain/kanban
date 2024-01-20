export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
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
