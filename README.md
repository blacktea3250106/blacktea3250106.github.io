# blacktea3250106.github.io

Source for [blacktea3250106.github.io](https://blacktea3250106.github.io): my work, public builds and skills as a pixel-art command-prompt map. A small avatar walks the wires between nodes; a read mode shows the same content as a plain page.

## Edit content

Everything on the page comes from [`src/data/site.json`](src/data/site.json):

- `nodes`: work, builds and archive groups. `parent` places a node under WORK, BUILD or ARCHIVE; `skills` draws its wires; `x` / `y` set its spot on the map.
- `skills`: `[id, label]` pairs, drawn top to bottom in the skill column.

## Run locally

```sh
npm install
npm run dev
```

Pushing to `main` builds and deploys through GitHub Actions (`.github/workflows/deploy.yml`).
