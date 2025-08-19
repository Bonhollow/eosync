import axios from "axios";

export async function getAnalytics() {
    const res = await fetch("http://service:8000/analytics/dashboard", {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
}

export async function getEmployeeSchedule(viewDate?: Date) {
    const url = new URL("http://service:8000/analytics/employee-schedule");

    if (viewDate) {
        const formattedDate = viewDate.toISOString().split('T')[0];
        url.searchParams.append("view_date", formattedDate);
    }

    const res = await fetch(url.toString(), {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch employee schedule");
    return res.json();
}

export async function getEmployeeScheduleClient(viewDate?: Date) {
    const url = new URL("http://localhost:8000/analytics/employee-schedule");

    if (viewDate) {
        const formattedDate = viewDate.toISOString().split("T")[0];
        url.searchParams.append("view_date", formattedDate);
    }

    try {
        const res = await axios.get(url.toString(), {
        headers: {
            "Cache-Control": "no-cache",
        },
        });
        return res.data;
    } catch (error) {
        console.error("Failed to fetch employee schedule", error);
        throw error;
    }
}