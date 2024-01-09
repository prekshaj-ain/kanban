// decorator
function Autobind(_ : any, _2 : string, descriptor : PropertyDescriptor){
    let originalMethod = descriptor.value;
    let adjustedDescriptor : PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjustedDescriptor;
}




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
        this.configure();
        this.attach();
    }
    private gatherTaskInfo() : [string,string,number] | void{
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = this.peopleInputElement.value;
        if(title.trim().length == 0 || description.trim().length == 0 || people.trim().length == 0){
            alert('Input is not valid');
            return;
        }else{
            return [title,description,+people];
        }
    }
    @Autobind
    private submitHandler(event : Event){
        event.preventDefault();
        const info = this.gatherTaskInfo();
        if(Array.isArray(info)){
            console.log(info);
        }
        
    }
    private configure(){
        this.element.addEventListener('submit', this.submitHandler)
    }
    private attach(){
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}

let taskInput = new TaskInput(); 