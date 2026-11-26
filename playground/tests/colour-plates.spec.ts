import { expect, test } from "@playwright/test";
import { textContrast } from "./contrast.js";

const works = [
  { id: "rasance", name: "Rasance", artist: "Pierre Soulages", title: "Outrenoir",
    source: "https://www.pierre-soulages.com/document/pierre-soulages-la-lumiere-comme-matiere/" },
  { id: "reserve", name: "Réserve", artist: "Yves Klein", title: "L’Arbre, grande éponge bleue",
    source: "https://www.centrepompidou.fr/fr/ressources/oeuvre/cpjqdr" },
  { id: "braise", name: "Braise", artist: "Mark Rothko", title: "Walls of Light",
    source: "https://www.guggenheim.org/exhibition/mark-rothko-walls-of-light" },
  { id: "hors-champ", name: "Hors champ", artist: "Luigi Ghirri", title: "Cartes et territoires",
    source: "https://jeudepaume.org/evenement/luigi-ghirri-2/" },
  { id: "hors-registre", name: "Hors registre", artist: "Andy Warhol", title: "Marilyn Diptych",
    source: "https://www.tate.org.uk/art/artworks/warhol-marilyn-diptych-t03093" },
  { id: "echappee", name: "Échappée", artist: "Banksy", title: "Girl with Balloon",
    source: "https://www.sothebys.com/en/auctions/ecatalogue/2018/contemporary-art-evening-auction-l18024/lot.67.html" },
  { id: "grand-bain", name: "Grand bain", artist: "David Hockney", title: "A Bigger Splash",
    source: "https://www.tate.org.uk/art/artworks/hockney-a-bigger-splash-t03254" },
  { id: "ponctuation", name: "Ponctuation", artist: "Yayoi Kusama", title: "Pumpkin",
    source: "https://benesse-artsite.jp/en/story/20210611-1661.html" },
  { id: "lisiere", name: "Lisière", artist: "Christo and Jeanne-Claude", title: "Surrounded Islands",
    source: "https://www.pamm.org/en/exhibition/christo-and-jeanne-claude-surrounded-islands-biscayne-bay-greater-miami-florida-1980-83-a-documentary-exhibition/" },
];

function textFitsParent(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const text = range.getBoundingClientRect();
  const parent = element.parentElement!.getBoundingClientRect();
  return text.width > 0 && text.left >= parent.left - 1 && text.right <= parent.right + 1
    && text.top >= parent.top - 1 && text.bottom <= parent.bottom + 1;
}

test("shared theme plates keep their titles legible and identify their artwork on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of works) {
    await test.step(theme.name, async () => {
      await page.goto("/elea/colours/?scheme=" + theme.id);
      const plate = page.getByRole("button", { name: theme.name, exact: true });
      await expect(plate).toHaveAttribute("aria-pressed", "true");
      const credit = plate.locator("small");
      await expect(credit).toContainText(theme.artist);
      await expect(credit).toContainText(theme.title);
      await expect(plate).toHaveAccessibleDescription(new RegExp(theme.artist));
      const atlas = page.getByRole("region", { name: "Colour atlas" });
      await expect(atlas).toContainText(theme.artist);
      const source = atlas.getByRole("link", { name: new RegExp(theme.title, "i") });
      await expect(source).toHaveAttribute("href", theme.source);
      await page.evaluate(() => document.fonts.ready);
      expect(await credit.evaluate(textFitsParent), `The artwork credit fits beside the swatches for ${theme.name}`).toBe(true);
      const title = plate.getByText(theme.name, { exact: true });
      expect(await title.evaluate(textFitsParent), `The full title ${theme.name} fits on its plate`).toBe(true);
      expect(await textContrast(title)).toBeGreaterThanOrEqual(3);
    });
  }
});
