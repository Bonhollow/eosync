import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "EOSync",
  version: packageJson.version,
  copyright: `© ${currentYear}, EOSync.`,
  meta: {
    title: "EOSync - Project Management Tool",
    description:
      "EOSync is a project management and collaboration tool designed to streamline workflows and enhance team productivity. Built with Next.js, it offers a modern, responsive interface and powerful features for managing tasks, projects, and team communications.",
  },
};
