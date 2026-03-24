import { createStore } from "redux";
import rootReducer from './reducer'

const store = createStore(
    rootReducer
);
export type RootState = ReturnType<typeof rootReducer>;

export { store }