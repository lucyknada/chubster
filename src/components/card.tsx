import { actions } from 'astro:actions';
import { Show } from 'solid-js';
import style from "./styles/card.module.scss";

async function downloadCard(fullPath: string) {
  const image = await fetch(`https://avatars.charhub.io/avatars/${fullPath}/chara_card_v2.png?nocache=0.4`)
  const imageBlog = await image.blob()
  const imageURL = URL.createObjectURL(imageBlog)
  const link = document.createElement('a')
  link.href = imageURL
  link.download = fullPath.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".png"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function Card(card: any) {
  const description = card.metadata.tagline || card.metadata.description;
  return (
    <>
      <div class={style.card}>
        <div>
          <a href={`https://characterhub.org/characters/${card.metadata.fullPath}`}><img class={style.avatar} src={card.metadata.avatar_url} /></a>
        </div>
        <div class={style.content}>
          <div class={style.header}>
            <div class={style.controls}>
              <button onClick={() => downloadCard(card.metadata.fullPath)}>&DownArrowBar; download</button>

              <Show when={import.meta.env.PUBLIC_BAN_AUTHORS == 1}>
                <button onClick={async () => {
                  if (window.confirm("Do you really want to ignore that author?")) {
                    const {error} = await actions.banAuthor({ author_id: card.metadata.creatorId });
                    if(error) {
                      alert(error);
                    }
                  }
                }}>&#8623; ban author</button>
              </Show>
            </div>
            <div>
              <h3 class={style.title}>{card.metadata.name}</h3>
              <p>{description.substring(0,200).trim() + "..."}</p>
            </div>
          </div>

          <div class={style.tags}>
            {card.metadata.topics.slice(0,15).map((tag: string) => (
              <span class={style.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}