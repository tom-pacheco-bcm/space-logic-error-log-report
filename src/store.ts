

export class Store<T> {

  #subscriptions: Observer<T>[] = []

  dispatch: (action: Action) => void;
  getState: () => T;

  constructor(reducer: Reducer<T>, initialState: T) {
    let state = initialState

    this.getState = () => state

    this.dispatch = (action: Action) => {
      const lastState = state
      state = reducer(state, action)
      if (lastState !== state) {
        this.#subscriptions.forEach(c => c(state))
      }
    }
  }

  subscribe(observer: Observer<T>): () => void {
    this.#subscriptions.push(observer);
    return () => {
      const i = this.#subscriptions.indexOf(observer);
      if (i === -1) {
        return
      }
      this.#subscriptions.splice(i, 1)
    }
  }
}


