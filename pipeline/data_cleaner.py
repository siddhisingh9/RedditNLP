import pandas as pd
import re
import os

INPUT_DIR  = "reddit_data"
OUTPUT_DIR = "reddit_data_clean"

def clean_text(text):
    """Basic text cleanup — strip whitespace, normalize spaces."""
    if not isinstance(text, str):
        return ""
    text = text.strip()
    text = re.sub(r"\n+", " ", text)        # newlines → space
    text = re.sub(r"\s+", " ", text)        # multiple spaces → one
    text = text.strip()
    return text

def is_junk(text):
    """Returns True if text is deleted, removed, or just a URL."""
    if not text or len(text) < 3:
        return True
    junk = {"[deleted]", "[removed]", ""}
    if text.strip() in junk:
        return True
    if re.match(r"^https?://\S+$", text.strip()):
        return True
    return False


def clean_posts(df):
    print(f"Posts — raw rows: {len(df)}")

    df = df[["post_id", "subreddit", "title", "body", "score", "created_utc"]].copy()

    df = df.drop_duplicates(subset="post_id")
    print(f"  after dedup: {len(df)}")

    df["title"] = df["title"].apply(clean_text)
    df["body"]  = df["body"].apply(clean_text)

    df["text"] = df.apply(
        lambda r: r["title"] + " " + r["body"] if not is_junk(r["body"]) else r["title"],
        axis=1
    )
    df["text"] = df["text"].apply(clean_text)

    df = df[~df["text"].apply(is_junk)]
    print(f"  after dropping junk text: {len(df)}")

    df = df[df["text"].str.len() >= 10]
    print(f"  after dropping short text: {len(df)}")

    df["created_utc"] = pd.to_datetime(df["created_utc"], errors="coerce")
    df["hour"]        = df["created_utc"].dt.hour

    df = df.drop(columns=["title", "body"])

    df = df[["post_id", "subreddit", "text", "score", "created_utc", "hour"]]

    df = df.reset_index(drop=True)
    print(f"  final rows: {len(df)}")
    return df


def clean_comments(df):
    print(f"Comments — raw rows: {len(df)}")

    df = df[["comment_id", "post_id", "subreddit", "body", "score", "created_utc"]].copy()

    df = df.drop_duplicates(subset="comment_id")
    print(f"  after dedup: {len(df)}")

    df["body"] = df["body"].apply(clean_text)

    df = df[~df["body"].apply(is_junk)]
    print(f"  after dropping junk: {len(df)}")

    df = df[df["body"].str.len() >= 10]
    print(f"  after dropping short comments: {len(df)}")

    df["created_utc"] = pd.to_datetime(df["created_utc"], errors="coerce")
    df["hour"]        = df["created_utc"].dt.hour

    df = df[["comment_id", "post_id", "subreddit", "body", "score", "created_utc", "hour"]]

    df = df.reset_index(drop=True)
    print(f"  final rows: {len(df)}")
    return df

def main():
    posts_path    = os.path.join(INPUT_DIR, "all_posts.csv")
    comments_path = os.path.join(INPUT_DIR, "all_comments.csv")

    # Posts 
    print("=" * 50)
    print("Cleaning posts...")
    posts_raw   = pd.read_csv(posts_path)
    posts_clean = clean_posts(posts_raw)
    out = os.path.join(OUTPUT_DIR, "posts_clean.csv")
    posts_clean.to_csv(out, index=False, encoding="utf-8")
    print(f"  saved → {out}")

    # Comments 
    print("\n" + "=" * 50)
    print("Cleaning comments...")
    comments_raw   = pd.read_csv(comments_path)
    comments_clean = clean_comments(comments_raw)
    out = os.path.join(OUTPUT_DIR, "comments_clean.csv")
    comments_clean.to_csv(out, index=False, encoding="utf-8")
    print(f"  saved → {out}")

    # Summary 
    print("\n" + "=" * 50)
    print("DONE")
    print(f"\nPosts per subreddit (clean):")
    print(posts_clean["subreddit"].value_counts().to_string())
    print(f"\nComments per subreddit (clean):")
    print(comments_clean["subreddit"].value_counts().to_string())
    print(f"\nNew columns added: hour (for time pattern EDA)")

if __name__ == "__main__":
    main()