# Hako — static project site

The homepage contains only three linked product banners. Each project has its own page, following the supplied theme: charcoal navigation, yellow accents and download section, white content, and a gray information sidebar.

## Files

- index.html — banner gallery
- vestaria-saga-i-plus.html — Vestaria Saga I+ detail page
- kichikuou-rance.html — Kichikuou Rance detail page
- renalith-saga.html — Renalith Saga detail page
- projects.js — shared project descriptions, links, versions, banner paths and credits
- style.css — responsive styles (600px and 850px breakpoints)
- app.js — gallery and project rendering
- img/ — locally hosted product images
- dist/ — deployable files
- template-original/ — preserved original template HTML and styles

No framework, packages, build step, remote fonts or CDN dependencies are required. Open index.html directly to view the site. All paths work on GitHub Pages repository subpaths.

## Update project releases

Edit projects.js. Replace an empty downloads URL with a full https:// URL, and update version and releaseNotes. Empty or invalid links remain visibly unavailable. Additional download entries can be added for mirrors or guides.

```js
downloads: [
  { label: "Tải bản vá", url: "https://your-host.example/patch.zip" },
  { label: "Hướng dẫn cài đặt", url: "https://your-host.example/guide" }
]
```

No project-specific version, progress, release date or patch size has been invented.

## Artwork

All three images are real product artwork or a game screenshot, downloaded on 26 October 2026. No AI-generated artwork is used. Images are displayed with object-fit: contain so the original covers remain uncropped. Original game images replace the unrelated Rewrite template image and avatar on the active pages.

| Local file | Image | Source page | Original asset |
| --- | --- | --- | --- |
| img/vestaria-banner.jpg | Vestaria Saga I+ gameplay screenshot, specifically from I+ coverage | https://automaton-media.com/articles/newsjp/20240425-291095/ | https://automaton-media.com/wp-content/uploads/2024/04/20240425-291095-header.jpg |
| img/rance-banner.jpg | Kichikuou Rance original cover art | https://stash.games/games/kichikuou-rance | https://images.igdb.com/igdb/image/upload/t_1080p_2x/co3u55.jpg |
| img/renalith-banner.jpg | Renalith Saga official storefront product image | https://www.dlsite.com/maniax/work/=/product_id/RJ235129.html | https://img.dlsite.jp/modpub/images2/work/doujin/RJ236000/RJ235129_img_main.jpg |

The DLsite asset URL was extracted from the actual product-page HTML. All downloaded images were visually inspected. Artwork remains the property of the respective owners; attribution is included in each project page footer. The image filenames and artwork credit fields are also available in projects.js for maintenance. Changing a project header image requires updating its HTML image tag as well.

## Refresh deployment files

Run in PowerShell from this folder:

```powershell
Copy-Item index.html,vestaria-saga-i-plus.html,kichikuou-rance.html,renalith-saga.html,style.css,app.js,projects.js,.nojekyll -Destination dist -Force
Copy-Item img/*banner.jpg -Destination dist/img -Force
```

To add another project, add its configuration in projects.js, duplicate a project HTML file and update data-project, title, metadata, hero image and attribution. It will automatically appear in the homepage gallery.

## Free hosting

Recommended: GitHub Pages for this small personal/community static archive with public source. Upload the CONTENTS of dist/ to a public repository root, then Settings → Pages → Deploy from a branch → main → /(root). Include .nojekyll. No build command is required. GitHub Free requires a public repository. Keep large game/patch archives on a file host and use download links here; Pages limits include a 1 GB site size and soft 100 GB/month bandwidth limit.

Netlify: drag dist/ into manual deploy, or connect the repository; netlify.toml selects dist. No build command. Its Free plan currently includes 300 shared usage credits/month.

Vercel: framework Other, no build command, output directory dist. Hobby is for personal non-commercial use.

Hosting reference pages (checked 26 October 2026):
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://www.netlify.com/pricing/personal-vs-free/
- https://vercel.com/docs/plans/hobby

No external deployment has been created.

## Validation

Run node --check app.js, node --check projects.js and node verify.cjs. The checks verify banner destinations, one project per page, placeholder downloads, titles, internal anchors, return links, local image existence and matching deployment copies.

All three product images were visually inspected, but browser layout QA remains unverified because the preview browser could not access this local workspace page.

## Screenshot galleries

Each project page now includes a Hình ảnh section. Three Vestaria Saga I+ gameplay screenshots and four Kichikuou Rance gameplay screenshots were selected after visually inspecting the user-supplied JPG files. The two additional title/cover images are retained in img but not listed as gameplay screenshots. Renalith has an empty gallery ready for future images.

Edit the screenshots array for each project in projects.js:

```js
screenshots: [
  { src: "img/my-screenshot.jpg", caption: "Mô tả hình ảnh" }
]
```

Use local image paths under img/. Thumbnails are lazy-loaded and shown without cropping. Click opens the native dialog viewer; previous/next buttons and left/right arrow keys cycle images, Escape closes it, and the browser returns focus to the triggering link. Normal image links are retained as a fallback and for Ctrl/Cmd-click. The homepage remains banners only.

The screenshot files were supplied locally by the maintainer from these posts:
- Kichikuou Rance: https://www.facebook.com/groups/433610481370842/?multi_permalinks=1584243366307542
- Vestaria Saga I+: https://www.facebook.com/groups/942341949117455/?multi_permalinks=29528769886714613

Include screenshot images when refreshing deployment assets:

```powershell
Copy-Item img/*_n.jpg -Destination dist/img -Force
```

For future screenshots with different filenames, copy those files to dist/img as well. Automated checks cover image availability, per-project isolation, dialog opening/closing, cyclic navigation, keyboard arrows and modified-click fallback. Native browser layout and focus behavior have not been visually verified.

## Published release information supplied by the maintainer

Rance is now version 0.8, with the Kichikuou_Rance_Vi_v0.8.zip Drive link, PC extraction / xsystem35.exe instructions, bundled save editor and dungeon keyboard changes. Android instructions link to the xsystem35-sdl2 release page.

Vestaria is now version 1.0, with the Vestaria Saga I Vietnamese.rar Drive link, the supplied hotfix and 21 October 2026 changelog entries (09:00 and 14:51), and all 15 default keyboard bindings. Drive filenames were checked to confirm the link-to-project mapping. Download files themselves were not downloaded or tested.

Edit changelog, installation and controls in projects.js. Changelog entries use a title and items array. Installation entries support title, text and an optional URL/linkLabel. Controls use [setting, action, keys] rows.
