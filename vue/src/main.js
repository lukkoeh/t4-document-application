import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/index.css';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-bootstrap.css";

const app = createApp(App)
app.component("QuillEditor", QuillEditor)
app.use(ToastPlugin, {
    duration: 8000,
})
app.mount('#app')
