import Vue from 'vue'
import App from './App'
import cuCustom from './colorui/components/cu-custom.vue';
import uView from '@/uni_modules/uview-ui';
import msg from '@/components/msg/msg.vue';
import inputBox from '@/components/inputBox/inputBox.vue';
import MescrollBody from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-uni.js";
Vue.use(uView)
Vue.component('cu-custom', cuCustom)
Vue.component('msg', msg);
Vue.component('inputBox', inputBox);
Vue.component('MescrollBody', MescrollBody);
Vue.config.productionTip = false
Vue.prototype.$EventBus = new Vue()

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()