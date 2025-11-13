import "./index.css";
import style from "./App.module.css";

import { render } from "solid-js/web";

import App from "./App";

function dropzone() {

    document.body.ondragover = function (e) {
        e.preventDefault();
        e.stopPropagation();

        document.body.classList.add(style.dragging);
        e.dataTransfer!.dropEffect = "copy";
    }


    document.body.ondragleave = function (e) {
        e.preventDefault();
        e.stopPropagation();

        document.body.classList.remove(style.dragging);
    }

    document.body.ondrop = function (e) {
        e.preventDefault();
        e.stopPropagation();

        document.body.classList.remove(style.dragging);

        const files = e.dataTransfer!.files;
        console.log("Files dropped:", files);
    }
}

const win = nw.Window.get()
win.on('new-win-policy', function (frame, url, policy) {
    console.log(url);
    nw.Shell.openExternal(url!);
    policy?.ignore(); // This prevents the new window from opening
});
const root = document.createElement("div") as HTMLElement;
dropzone();
document.body.appendChild(root);

render(() => <App />, root);

if (import.meta.env.DEV) {
    win.showDevTools();
    console.log("DevTools opened");
    nw.Window.getAll(function ([win]) {
        setTimeout(function () {
            win.focus();
        }, 1500);
    });

}
