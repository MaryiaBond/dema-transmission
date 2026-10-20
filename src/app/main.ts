import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { i18n } from './i18n';
import { useExperienceStore } from '@/stores/experience';
import '../../styles.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(i18n);
useExperienceStore(pinia).hydrate();
app.mount('#app');
