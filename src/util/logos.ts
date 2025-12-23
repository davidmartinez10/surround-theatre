const dolby_atmos
  = document.createElementNS("http://www.w3.org/2000/svg", "svg");

dolby_atmos.setAttribute("width", "64");
dolby_atmos.setAttribute("height", "64");
dolby_atmos.setAttribute("viewBox", "0 0 32 8");
dolby_atmos.setAttribute("pointer-events", "bounding-box");
dolby_atmos.setAttribute("stroke", "currentColor");
dolby_atmos.setAttribute("fill", "currentColor");
dolby_atmos.setAttribute("stroke-width", "1");
dolby_atmos.setAttribute("stroke-linecap", "round");
dolby_atmos.setAttribute("stroke-linejoin", "round");
dolby_atmos.setAttribute("stroke-miterlimit", "10");
dolby_atmos.setAttribute("stroke-dasharray", "0");
dolby_atmos.setAttribute("stroke-dashoffset", "0");
dolby_atmos.setAttribute("stroke-opacity", "1");

const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
path1.setAttribute(
  "d",
  "M269.23,.01V189.29h-27.92c-52.14,0-94.64-42.5-94.64-94.64S189.17,.01,241.31,.01h27.92Z");
dolby_atmos.appendChild(path1);

const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
path2.setAttribute(
  "d",
  "M27.92,.01C80.06,.01,122.56,42.51,122.56,94.65s-42.5,94.64-94.64,94.64H0V.01H27.92Z");
dolby_atmos.appendChild(path2);

export {dolby_atmos};
