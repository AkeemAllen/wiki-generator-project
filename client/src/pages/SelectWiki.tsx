import { useLocalStorage } from "usehooks-ts";
import { useGetWikis } from "../apis/wikiApis";
import { useUpdateEffect } from "../hooks/useUpdateEffect";

const SelectWiki = () => {
  const [currentWiki, __] = useLocalStorage("currentWiki", "none");
  const [wikiList, setWikiList] = useLocalStorage<{ [key: string]: any }>(
    "wikiList",
    {}
  );

  const { data } = useGetWikis();

  useUpdateEffect(() => {
    setWikiList(data);
  }, [data]);

  return (
    <>
      {currentWiki === "none"
        ? "Select or Create a Wiki using the Vertical dot menu to the left"
        : `${wikiList[currentWiki]?.site_name} selected`}
    </>
  );
};

export default SelectWiki;
