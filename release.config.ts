import type { GlobalConfig } from "semantic-release";

const config: GlobalConfig = {
  tagFormat: "v${version}",
  repositoryUrl: "https://git.demonkernel.io.vn/FoodSurf/frontend.git",
  branches: [
    "main",
    {
      name: "dev-*",
      prerelease: "${name.replace('dev-', '')}",
      channel: "${name.replace('dev-', '')}",
    },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/npm", { npmPublish: false }],
    [
      "@semantic-release/exec",
      {
        prepareCmd: "node scripts/release.ts ${nextRelease.version} && sed -i 's|image: git.demonkernel.io.vn/foodsurf/frontend:.*|image: git.demonkernel.io.vn/foodsurf/frontend:${nextRelease.version}|g' k8s/k8s.yaml",
      },
    ],
    [
      "@saithodev/semantic-release-gitea",
      {
        giteaUrl: "https://git.demonkernel.io.vn/",
        assets: [
          {
            path: "release.zip",
            name: "Drinkool v${nextRelease.version}.zip",
          },
        ],
      },
    ],
  ],
};

export default config;
