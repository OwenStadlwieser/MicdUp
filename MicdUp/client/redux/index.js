import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware  from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import reducer from './reducers'

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))

const store = createStore(
    reducer,
    composedEnhancer
)

export default store