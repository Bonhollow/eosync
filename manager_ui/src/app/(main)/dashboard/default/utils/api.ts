export async function getAnalytics() {
    const res = await fetch("http://service:8000/analytics/dashboard", {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
}