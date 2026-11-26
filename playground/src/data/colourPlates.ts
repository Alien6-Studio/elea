import type { SurfaceFamily, ThemeProfileId } from "@alien6-studio/elea-tokens/palette";
import rasance from "../assets/colour-themes/rasance.webp";
import reserve from "../assets/colour-themes/reserve-relief.webp";
import braise from "../assets/colour-themes/braise.webp";
import horsChamp from "../assets/colour-themes/hors-champ.webp";
import horsRegistre from "../assets/colour-themes/hors-registre.webp";
import echappee from "../assets/colour-themes/echappee.webp";
import grandBain from "../assets/colour-themes/grand-bain.webp";
import ponctuation from "../assets/colour-themes/ponctuation.webp";
import lisiere from "../assets/colour-themes/lisiere.webp";

export interface ArtworkReference {
  title: string;
  artist: string;
  date: string;
  url: string;
  note: string;
}

type ColourPlate = {
  src: string;
  alt: string;
  height?: number;
  reference: ArtworkReference;
  paper: SurfaceFamily;
  stock: "paper" | "primary" | "secondary" | "shadow";
  ink: "paper" | "primary" | "secondary" | "shadow";
};

export const colourPlates: Record<ThemeProfileId, ColourPlate> = {
  rasance: {
    src: rasance, alt: "A thin band of light crosses a black rock face.",
    paper: "Ivory", stock: "paper", ink: "primary",
    reference: {
      title: "Outrenoir", artist: "Pierre Soulages", date: "from 1979",
      url: "https://www.pierre-soulages.com/document/pierre-soulages-la-lumiere-comme-matiere/",
      note: "Light catches the ridges in Soulages’s black paint. Rasance pairs carbon with ivory and draws two shallow curves across opposite corners of each action.",
    },
  },
  reserve: {
    src: reserve, alt: "An ultramarine sponge relief casts a soft shadow on a white surface.",
    paper: "Porcelain", stock: "primary", ink: "paper",
    reference: {
      title: "L’Arbre, grande éponge bleue", artist: "Yves Klein", date: "1962",
      url: "https://www.centrepompidou.fr/fr/ressources/oeuvre/cpjqdr",
      note: "Klein’s sculpture holds ultramarine pigment in a sponge. The generated ELEA study explores that porous surface. Four unequal curves give actions and selections their own blue imprint.",
    },
  },
  braise: {
    src: braise, alt: "Burgundy glass meets a glowing apricot edge.",
    paper: "Madder", stock: "shadow", ink: "paper",
    reference: {
      title: "Walls of Light", artist: "Mark Rothko", date: "2004 exhibition",
      url: "https://www.guggenheim.org/exhibition/mark-rothko-walls-of-light",
      note: "Rothko’s fields of colour seem to glow along their margins. Braise sets apricot against deep madder and softens its panels with wide, shallow curves.",
    },
  },
  "hors-champ": {
    src: horsChamp, alt: "A small red sign stands against a pale blue wall.",
    paper: "Chalk", stock: "paper", ink: "primary",
    reference: {
      title: "Cartes et territoires", artist: "Luigi Ghirri", date: "2019 exhibition",
      url: "https://jeudepaume.org/evenement/luigi-ghirri-2/",
      note: "Ghirri finds signs within the everyday landscape. Hors champ gives panels the square edges of a photographic frame and gently rounds its small, sign-like controls.",
    },
  },
  "hors-registre": {
    src: horsRegistre, height: 420, alt: "Two rows of lipstick prints repeat in orange, pink and turquoise, then fade into grey.",
    paper: "Ivory", stock: "primary", ink: "shadow",
    reference: {
      title: "Marilyn Diptych", artist: "Andy Warhol", date: "1962",
      url: "https://www.tate.org.uk/art/artworks/warhol-marilyn-diptych-t03093",
      note: "The repeated screenprint places orange, pink and turquoise side by side. Hors registre offsets opposite pairs of corners like successive impressions.",
    },
  },
  echappee: {
    src: echappee, alt: "A red paper kite trails a line towards the shadow of a staircase on a stone wall.",
    paper: "Ivory", stock: "secondary", ink: "paper",
    reference: {
      title: "Girl with Balloon", artist: "Banksy", date: "2002 mural",
      url: "https://www.sothebys.com/en/auctions/ecatalogue/2018/contemporary-art-evening-auction-l18024/lot.67.html",
      note: "The red balloon lifts away from the black stencil. Échappée rounds three corners and leaves the lower left sharp, like the point where a string meets the balloon.",
    },
  },
  "grand-bain": {
    src: grandBain, alt: "A white ripple circles a blue pool beside a yellow ladder and pink paving.",
    paper: "Porcelain", stock: "paper", ink: "shadow",
    reference: {
      title: "A Bigger Splash", artist: "David Hockney", date: "1967",
      url: "https://www.tate.org.uk/art/artworks/hockney-a-bigger-splash-t03254",
      note: "Hockney sets a splash against the straight edges of the pool. Grand bain lifts the upper corners of its blue actions in a shallow arc above a level base.",
    },
  },
  ponctuation: {
    src: ponctuation, alt: "Rows of black perforations curve across a yellow metal sheet against blue-grey.",
    paper: "Ivory", stock: "primary", ink: "secondary",
    reference: {
      title: "Pumpkin", artist: "Yayoi Kusama", date: "1994",
      url: "https://benesse-artsite.jp/en/story/20210611-1661.html",
      note: "Kusama’s black dots follow the curve of a yellow pumpkin. Ponctuation carries those circles into small selections and lengthens them into capsules around action labels.",
    },
  },
  lisiere: {
    src: lisiere, alt: "Pink fabric floats diagonally across green water beside a bank of reeds.",
    paper: "Porcelain", stock: "primary", ink: "paper",
    reference: {
      title: "Surrounded Islands", artist: "Christo and Jeanne-Claude", date: "1983",
      url: "https://www.pamm.org/en/exhibition/christo-and-jeanne-claude-surrounded-islands-biscayne-bay-greater-miami-florida-1980-83-a-documentary-exhibition/",
      note: "Pink fabric follows the irregular shorelines in Biscayne Bay. Lisière wraps its bay-green actions in four unequal curves.",
    },
  },
};
