import React from "react";
import {createRoot} from 'react-dom/client';
import "tachyons";
import "./index.css";
import "./routeros.css";
import App from "./App";
import { unregister } from "./registerServiceWorker";

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render( <App />);
unregister();