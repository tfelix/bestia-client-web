export abstract class DataMessage<T> {
  constructor(
    public readonly payload: T
  ) {
  }
}
