import { useLocalStorage } from "usehooks-ts";
import { useGetWikis } from "../apis/wikiApis";

const SelectWiki = () => {
  const [currentWiki, __] = useLocalStorage("currentWiki", "none");
  const [wikiList, setWikiList] = useLocalStorage<{ [key: string]: any }>(
    "wikiList",
    {}
  );

  useGetWikis((data: any) => setWikiList(data));

  return (
    <>
      {currentWiki === "none"
        ? "Select or Create a Wiki using the Vertical dot menu to the left"
        : `${wikiList[currentWiki]?.site_name} selected`}
    </>
  );
};

export default SelectWiki;
