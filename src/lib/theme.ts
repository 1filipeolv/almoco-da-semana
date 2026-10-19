import { useEffect, useState } from "react";

const EVT = "tema-change";

export function useTema() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const ler = () => {
      const d = localStorage.getItem("tema") === "dark";
      setDark(d);
      document.documentElement.classList.toggle("dark", d);
    };
    ler();
    window.addEventListener(EVT, ler);
    return () => window.removeEventListener(EVT, ler);
  }, []);
  const toggle = () => {
    localStorage.setItem("tema", dark ? "light" : "dark");
    window.dispatchEvent(new Event(EVT));
  };
  return { dark, toggle };
}
