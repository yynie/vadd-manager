import {SET_DT_CUSTOMER} from '../mutation-types'

const dataTarget = {
    state: {
        customers:[]
    },
    mutations: {
        [SET_DT_CUSTOMER] (state, list) {
            state.customers = list;
            console.log("set dataTarget.customers:"+ JSON.stringify(state.customers));
        },
    }
}

export default dataTarget;