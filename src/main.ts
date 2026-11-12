import '@fontsource-variable/figtree';
import '@fontsource-variable/red-hat-display';
import './style.css';
import { bindEvents } from './ui/events';
import { startFeed } from './ui/feed';
import { render } from './ui/render';

bindEvents();
render();
startFeed();
