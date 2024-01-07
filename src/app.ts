class TaskInput{
    hostElement : HTMLDivElement;
    templateElement : HTMLTemplateElement;
    element : HTMLDivElement;
    titleInputElement : HTMLInputElement;
    descriptionInputElement : HTMLInputElement;
    peopleInputElement : HTMLInputElement;
    constructor(){
        this.hostElement = document.getElementById("root")! as HTMLDivElement;
        this.templateElement = document.getElementById("task-input")! as HTMLTemplateElement;
        const clonedNode = this.templateElement.content.cloneNode(true) as DocumentFragment;
        this.element = clonedNode.firstElementChild! as HTMLDivElement;
        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

        this.attach();
    }
    private submitHandler(){

    }
    private configure(){
        this.element.addEventListener('submit', this.submitHandler)
    }
    private attach(){
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}

let taskInput = new TaskInput(); 