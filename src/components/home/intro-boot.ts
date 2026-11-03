export const INTRO_STORAGE_KEY = "bn-intro-seen";

/** Runs before paint so returning visitors never see the intro flash. */
export const introBootScript = `try{if(sessionStorage.getItem("${INTRO_STORAGE_KEY}"))document.documentElement.classList.add("intro-seen")}catch(e){}`;
