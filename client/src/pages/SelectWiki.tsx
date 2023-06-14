import { Button, Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
import { useGetWikis } from "../apis/wikiApis";
import NewWikiModal from "../components/NewWikiModal";

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

  return (
    <>
      <Popover withArrow>
        <Popover.Target>
          <Button sx={{ backgroundColor: "rgba(0,0,0,50%)" }}>
            {currentWiki}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          {Object.keys(wikiList).map((wiki, index) => (
            <Button key={index} onClick={() => handleWikiSelection(wiki)}>
              {wiki}
            </Button>
          ))}
        </Popover.Dropdown>
      </Popover>
      <Button mt={20} onClick={open} fullWidth>
        Generate New Wiki
      </Button>
      <NewWikiModal opened={wikiModalOpened} onClose={close} />
    </>
  );
};

export default SelectWiki;
