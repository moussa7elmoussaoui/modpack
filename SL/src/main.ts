import './style.css';
import { mountWorkbench } from './workbench';

const cleanup = mountWorkbench(document.querySelector<HTMLDivElement>('#app')!, {
  assetRoot: import.meta.env.BASE_URL,
});
if (import.meta.hot) import.meta.hot.dispose(cleanup);
