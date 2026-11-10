# Photos: drag and drop here

Every folder in here is one spot on the site that needs a photo, in the same order as the items in the game.

1. **Drop photos into the matching folder.** JPG, PNG, WebP, and iPhone HEIC all work. Any size is fine.
2. **Name each file for what it shows**, for example `Roy and me at the first meetup.jpg`. The name becomes the photo's description for screen readers and search engines. Camera names like `IMG_1234.jpg` still work, they just get a generic description.
3. **Set the order** by starting names with numbers: `1 ...`, `2 ...`, `3 ...`.
4. **Run `npm run photos`** in the project folder (it also runs on its own every time you start `npm run dev`). Then reload the page.

The script shrinks each photo to at most 1600px, converts it to WebP, turns it the right way up, and puts it in `public/media/`. The game panels and the portfolio view pick it up automatically. No code to edit.

## What the folder names mean

- **(1 photo)**: one photo goes here. If you drop more, only the first is used.
- **(2 to 4)**: a small gallery of screenshots or slides. Extra files past 4 are skipped.
- **(any number)** and **(3 or more)**: a gallery; add as many as you like.
- **3 Room decor (optional)**: art drawn inside the game rooms (posters, logos, the photo in the nightstand frame). Simple, bold images read best at that tiny size. These show up after restarting `npm run dev`.

## Good to know

- Your original files stay on your computer only; they are not uploaded to GitHub. The converted copies in `public/media/` are what get committed and published.
- To swap a photo, replace the files in its folder and run `npm run photos` again. That folder's old copies are replaced.
- To remove a photo from the site completely, delete it here **and** delete its copy in `public/media/`, then run `npm run photos`.
- Your resume PDF does not go here. Put it at `public/media/resume/` and set its link in `src/content/profile.ts`.
