import { debounce } from "@solid-primitives/scheduled";
import { actions } from 'astro:actions';
import { createEffect, createResource, createSignal, Show } from "solid-js";
import { Card } from "./card";
import style from "./styles/gallery.module.scss";

export function Gallery() {
  const [page, setPage] = createSignal(1);
  const [searchText, setSearchText] = createSignal("");
  const [nodes,  {refetch}] = createResource(async () => {
    const body = await fetch(`https://api.chub.ai/search?first=100&excludetopics=&page=${page()}&namespace=*&search=${searchText()}&include_forks=false&nsfw=true&nsfw_only=false&require_custom_prompt=false&require_images=false&require_expressions=false&nsfl=false&asc=false&min_tokens=50&max_tokens=100000&chub=true&require_lore=false&exclude_mine=true&require_lore_embedded=false&require_lore_linked=false&sort=last_activity_at&topics=&venus=true`);

    const result = (await body.json())
    return result?.data?.nodes || result.nodes
  });

  const [filteredAuthors] = createResource(async () => {
    if(import.meta.env.PUBLIC_BAN_AUTHORS !== 1) return []
    const { data, error } = await actions.getBannedAuthors();
    if(error) {
      alert(`getFilteredAuthors: ${error}`)
      return
    }
    return data
  });

  createEffect(() => {
    setPage(1);
    searchText();
  });

  const updateGallery = debounce(() => refetch(), 250);

  return (
    <>
      <div class={style.wrapper}>
        <div class={style.navigation}>
          <div class={style.navigationButtons}>
            <button disabled={nodes.loading} onclick={() => {
              if(page() == 1) return
              setPage(Math.max(page() - 1,1))
              refetch()
            }}>&larrb;</button>
            <span>{page()}</span>
            <button disabled={nodes.loading} onclick={() => {
              setPage(page() + 1)
              refetch()
            }}>&rarrb;</button>
          </div>
          <div>
            <input type="text" value={searchText()} onChange={(e) => {
              setSearchText(e.target.value);
              updateGallery();
            }} class={style.search} placeholder="search" />
          </div>
        </div>
        <Show when={nodes.loading}>
          loading..
        </Show>
        <Show when={!nodes.loading && !filteredAuthors.loading}>
          <div class={style.gallery}>
            {nodes() && nodes().map((card: any) => {
              const filteredTags: string[] = JSON.parse(import.meta.env.PUBLIC_BAN_AUTHORS) || [];
              const filteredTagsExactMatch: string[] = JSON.parse(import.meta.env.PUBLIC_EXACT_FILTERED_TAGS ) || [];
              const description = card.tagline || card.description;
              if(description.split(" ").length < 5) return;
              if(filteredAuthors && !filteredAuthors()?.loading && (filteredAuthors() as unknown as number[]).includes(card.creatorId)) return;
              if(card.topics.some((tag: string) => filteredTagsExactMatch.some(filteredTag => tag.toLowerCase() == filteredTag.toLowerCase()))) return;
              if(card.topics.some((tag: string) => filteredTags.some(filteredTag => tag.toLowerCase().includes(filteredTag.toLowerCase())))) return;
              return <Card metadata={card} />
            })}
          </div>
        </Show>
      </div>
    </>
  );
}