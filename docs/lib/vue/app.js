//basic embed of VueJS app as functional component
// can expand the scope of the VueJS app as we build out

const App = Vue.component('app', {
    functional: true,
    props: ['myprop'],
    render: (createElement, context) => {
        context.parent.$root.myprop = context.props.myprop;
        return createElement('div', context.data, context.children);
    }
});

// can't avoid a build when using .vue files 
// import DefaultFooter from "./DefaultFooter.vue.js";

new Vue({
    el: '#app',
    data: {
        myprop: ''
    },
    components: [App]
});