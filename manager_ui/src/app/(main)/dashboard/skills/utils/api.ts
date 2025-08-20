import axios from "axios";

export async function getSkills() {
  const response = await axios.get("http://localhost:8000/skills");
  return response.data;
}

export async function createSkill(skills: string[]) {
  const response = await axios.post("http://localhost:8000/skills", skills);
  return response.data;
}

export async function editSkill(id: number, payload: { name: string }) {
  const response = await axios.put(
    `http://localhost:8000/skills/${id}`,
    payload,
  );
  return response.data;
}

export async function createSkillsFromFile(file: File) {
  const formData = new FormData();

  formData.append("file", file);
  const response = await axios.post(
    "http://localhost:8000/upload/file/elaborate_skills",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}

export async function deleteSkill(id: number) {
  const response = await axios.delete(`http://localhost:8000/skills/${id}`);
  return response.data;
}
