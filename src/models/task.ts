export enum TaskStatus {
  todo,
  done,
}

export class Task {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: TaskStatus
  ) {}
}
