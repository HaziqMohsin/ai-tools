import Parser from "rss-parser";

const parser = new Parser();

export async function fetchRSSArticles(feedUrl: string) {
    const feed = await parser.parseURL(feedUrl);
    return feed.items.map((item) => ({
        title: item.title ?? "",
        link: item.link ?? "",
        pubDate: item.pubDate ?? "",
    }));
}
