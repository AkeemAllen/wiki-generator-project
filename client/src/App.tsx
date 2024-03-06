import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
import "./App.css";
import MainAppshell from "./components/MainAppshell";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

function App() {
  const [currentWiki, setCurrentWiki] = useLocalStorage("currentWiki", "none");
  const navigate = useNavigate();

  useEffect(() => {
    if (currentWiki === "none") {
      navigate("/select-wiki");
    }
  }, []);

  return (
    <>
      <MantineProvider>
        <Notifications position="top-right" />
        <MainAppshell />
      </MantineProvider>
    </>
  );
}

export default App;
