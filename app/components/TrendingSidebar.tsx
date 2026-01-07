"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function TrendingSidebar() {
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Fetch last 50 posts to calculate "trending"
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        
        const tagCounts: { [key: string]: number } = {};
        
        snap.forEach((doc) => {
          const data = doc.data();
          if (data.hashtags && Array.isArray(data.hashtags)) {
            data.hashtags.forEach((tag: string) => {
              const normalizedTag = tag.toLowerCase(); // Case insensitive
              tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
            });
          }
        });

        const sortedTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5

        setTrendingTags(sortedTags);
      } catch (error) {
        console.error("Error fetching trending tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="hidden lg:block w-80 p-6">
        <div className="glass rounded-2xl p-6 border border-[#F5C26B]/20 animate-pulse">
          <div className="h-6 w-32 bg-[#F5C26B]/20 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full bg-[#F5C26B]/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (trendingTags.length === 0) return null;

  return (
    <div className="hidden lg:block w-80 pl-6 sticky top-24 self-start">
      <div className="glass rounded-2xl p-6 border border-[#F5C26B]/20 shadow-xl shadow-[#F5C26B]/5">
        <h3 className="text-xl font-bold text-[#F5C26B] mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span> Trending
        </h3>
        <div className="space-y-3">
          {trendingTags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/explore?tag=${tag.replace('#', '')}`}
              className="flex items-center justify-between group cursor-pointer"
            >
              <span className="text-zinc-400 group-hover:text-[#FFD56A] transition-colors font-medium">
                {tag}
              </span>
              <span className="text-xs bg-[#F5C26B]/10 text-[#F5C26B] px-2 py-1 rounded-full group-hover:bg-[#F5C26B] group-hover:text-black transition-all">
                {count} posts
              </span>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-[#F5C26B]/10">
          <p className="text-xs text-zinc-500 text-center">
            Topics people are whispering about right now.
          </p>
        </div>
      </div>
    </div>
  );
}
