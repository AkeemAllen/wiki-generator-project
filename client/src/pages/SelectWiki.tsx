import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
import { useGetWikis } from "../apis/wikiApis";

const SelectWiki = () => {
  const [currentWiki, setCurrentWikiLocalstore] = useLocalStorage(
    "currentWiki",
    "none"
  );
  const [wikiList, setWikiList] = useLocalStorage("wikiList", {});

  const [wikiModalOpened, { close, open }] = useDisclosure(false);
  const navigate = useNavigate();

  useGetWikis((data: any) => setWikiList(data));

  const handleWikiSelection = (wiki: string) => {
    setCurrentWikiLocalstore(wiki);
    navigate("/");
  };

  return <></>;
};

export default SelectWiki;
