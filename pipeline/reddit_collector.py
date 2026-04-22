import requests
import pandas as pd
import time
import os
from datetime import datetime

SUBREDDITS = [
    "cats",
    "JEENEETards",
    "Btechtards",
    "depression",
    "mumbai",
    "AITAH",
    "relationship_advice",
    "Fitness",
    "gaming",
    "AskReddit",
]

POSTS_PER_SUB     = 150
COMMENTS_PER_POST = 20
OUTPUT_DIR        = "reddit_data"

# Identify your script politely — Reddit blocks generic/missing user agents
HEADERS = {
    "User-Agent": "reddit-nlp-college-project-dav-course/2.0 (academic research)"
}


def get(url, params=None, retries=3):
    """GET with retry logic for rate limits (429)."""
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, params=params, timeout=15)
            if r.status_code == 429:
                wait = 60 * (attempt + 1)
                print(f"  [rate limited] waiting {wait}s...")
                time.sleep(wait)
                continue
            if r.status_code == 200:
                return r.json()
            print(f"  [warn] HTTP {r.status_code} for {url}")
            return None
        except Exception as e:
            print(f"  [error] {e}")
            time.sleep(5)
    return None


def collect_posts(subreddit_name, limit=250):
    base_url     = f"https://www.reddit.com/r/{subreddit_name}/top.json"
    time_filters = ["year", "all", "month"]
    per_filter   = limit // len(time_filters) + 20

    seen_ids = set()
    posts    = []

    for tf in time_filters:
        if len(posts) >= limit:
            break

        after              = None
        fetched_this_filter = 0

        while fetched_this_filter < per_filter and len(posts) < limit:
            params = {"limit": 100, "t": tf, "raw_json": 1}
            if after:
                params["after"] = after

            data = get(base_url, params=params)
            if not data:
                break

            children = data["data"]["children"]
            if not children:
                break

            for child in children:
                p = child["data"]
                if p["id"] in seen_ids:
                    continue
                seen_ids.add(p["id"])
                posts.append({
                    "post_id":      p["id"],
                    "subreddit":    subreddit_name,
                    "title":        p.get("title", ""),
                    "body":         p.get("selftext", ""),
                    "score":        p.get("score", 0),
                    "upvote_ratio": p.get("upvote_ratio", 0),
                    "num_comments": p.get("num_comments", 0),
                    "created_utc":  datetime.utcfromtimestamp(p["created_utc"]).strftime("%Y-%m-%d %H:%M:%S"),
                    "time_filter":  tf,
                    "permalink":    f"https://reddit.com{p.get('permalink', '')}",
                    "is_self":      p.get("is_self", False),
                })
                fetched_this_filter += 1

            after = data["data"].get("after")
            if not after:
                break

            time.sleep(2)

    return posts[:limit]


def collect_comments(post_permalink, n=20):
    permalink = post_permalink.replace("https://reddit.com", "")
    url  = f"https://reddit.com{permalink}.json"
    data = get(url, params={"limit": n, "depth": 1, "sort": "top", "raw_json": 1})

    if not data or len(data) < 2:
        return []

    comments = []
    for child in data[1]["data"]["children"]:
        c    = child.get("data", {})
        body = c.get("body", "")
        if not body or body in ("[deleted]", "[removed]"):
            continue
        created = c.get("created_utc")
        comments.append({
            "comment_id":  c.get("id", ""),
            "post_id":     c.get("link_id", "").replace("t3_", ""),
            "subreddit":   c.get("subreddit", ""),
            "body":        body,
            "score":       c.get("score", 0),
            "created_utc": datetime.utcfromtimestamp(created).strftime("%Y-%m-%d %H:%M:%S") if created else "",
        })
        if len(comments) >= n:
            break

    return comments


def save(data, filename):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = os.path.join(OUTPUT_DIR, filename)
    pd.DataFrame(data).to_csv(path, index=False, encoding="utf-8")
    print(f"  saved → {path}  ({len(data)} rows)")


def main():
    print("Reddit data collection — no API key needed")
    print(f"Target: {POSTS_PER_SUB} posts × {len(SUBREDDITS)} subreddits\n")

    all_posts    = []
    all_comments = []

    for sub in SUBREDDITS:
        print(f"{'─'*50}")
        print(f"r/{sub}")

        posts = collect_posts(sub, limit=POSTS_PER_SUB)
        print(f"  posts collected: {len(posts)}")
        all_posts.extend(posts)

        comments = []
        for i, post in enumerate(posts):
            permalink = post["permalink"]
            c = collect_comments(permalink, n=COMMENTS_PER_POST)
            comments.extend(c)
            if (i + 1) % 10 == 0:
                print(f"  comments so far: {len(comments)} (from {i+1}/{len(posts)} posts)")
            time.sleep(2)   # polite delay between comment fetches

        print(f"  comments collected: {len(comments)}")
        all_comments.extend(comments)

        save(posts,    f"{sub}_posts.csv")
        save(comments, f"{sub}_comments.csv")

        print(f"  sleeping 5s...")
        time.sleep(5)

    print(f"\n{'─'*50}")
    print("Saving combined files...")
    save(all_posts,    "all_posts.csv")
    save(all_comments, "all_comments.csv")

    posts_df = pd.DataFrame(all_posts)
    print(f"\n{'='*50}")
    print(f"DONE")
    print(f"Total posts:    {len(all_posts)}")
    print(f"Total comments: {len(all_comments)}")
    print(f"\nPosts per subreddit:")
    print(posts_df["subreddit"].value_counts().to_string())
    print(f"\nFiles saved to: ./{OUTPUT_DIR}/")


if __name__ == "__main__":
    main()