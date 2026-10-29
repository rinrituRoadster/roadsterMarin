export type EpisodeContent = {
  title?: string;
  description?: string;
};

// Add confirmed episode-specific copy here as titles and summaries become available.
const episodeContent: Record<number, EpisodeContent> = {};

export function getEpisodeContent(number: number): Required<EpisodeContent> {
  const content = episodeContent[number] ?? {};

  return {
    title: content.title ?? `第${number}話`,
    description:
      content.description ??
      `中古車呪縛霊まりんちゃん 第${number}話の4コマ漫画。海夢とご主人の日常を描きます。`
  };
}
