import axios from "axios";

export async function getSkills() {
    const response = await axios.get("http://localhost:8000/skills");
    return response.data;
}

export async function postSkill(name: string) {
    const response = await axios.post("http://localhost:8000/skills", { name });
    return response.data;
}

export async function deleteSkill(id: number) {
    const response = await axios.delete(`http://localhost:8000/skills/${id}`);
    return response.data;
}
