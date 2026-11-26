import type { SurfaceFamily, ThemeProfileId } from "@alien6-studio/elea-tokens/palette";
import rasance from "../assets/colour-themes/rasance.webp";
import reserve from "../assets/colour-themes/reserve.webp";
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
      note: "Light catches the ridges in Soulages’s black paint. Rasance sets carbon beside ivory for the same jump in brightness, with graphite between them.",
    },
  },
  reserve: {
    src: reserve, alt: "A curved ridge rises from a field of ultramarine pigment.",
    paper: "Porcelain", stock: "primary", ink: "paper",
    reference: {
      title: "Blue Monochrome", artist: "Yves Klein", date: "1961",
      url: "https://www.moma.org/collection/works/80103",
      note: "Klein covers the canvas in ultramarine pigment. Réserve gives that blue the primary role and adds two quieter neighbours, chalk blue and ink violet.",
    },
  },
  braise: {
    src: braise, alt: "Burgundy glass meets a glowing apricot edge.",
    paper: "Madder", stock: "shadow", ink: "paper",
    reference: {
      title: "Walls of Light", artist: "Mark Rothko", date: "2004 exhibition",
      url: "https://www.guggenheim.org/exhibition/mark-rothko-walls-of-light",
      note: "In the Guggenheim Bilbao exhibition, Rothko’s fields of colour seem to glow at their edges. Braise places apricot against deep madder and carries their warmth into dusty rose.",
    },
  },
  "hors-champ": {
    src: horsChamp, alt: "A small red sign stands against a pale blue wall.",
    paper: "Chalk", stock: "paper", ink: "primary",
    reference: {
      title: "Cartes et territoires", artist: "Luigi Ghirri", date: "2019 exhibition",
      url: "https://jeudepaume.org/evenement/luigi-ghirri-2/",
      note: "Ghirri’s photographs at the Jeu de Paume draw the eye to signs in everyday landscapes. In the ELEA study, a vermilion sign interrupts a pale blue wall. Petrol blue anchors the palette.",
    },
  },
  "hors-registre": {
    src: horsRegistre, height: 420, alt: "Two rows of lipstick prints repeat in orange, pink and turquoise, then fade into grey.",
    paper: "Ivory", stock: "primary", ink: "shadow",
    reference: {
      title: "Marilyn Diptych", artist: "Andy Warhol", date: "1962",
      url: "https://www.tate.org.uk/art/artworks/warhol-marilyn-diptych-t03093",
      note: "Orange leads the palette, while pink and turquoise pick out the separate inks in the diptych’s colour panel.",
    },
  },
  echappee: {
    src: echappee, alt: "A red paper kite trails a line towards the shadow of a staircase on a stone wall.",
    paper: "Ivory", stock: "secondary", ink: "paper",
    reference: {
      title: "Girl with Balloon", artist: "Banksy", date: "2002 mural",
      url: "https://www.sothebys.com/en/auctions/ecatalogue/2018/contemporary-art-evening-auction-l18024/lot.67.html",
      note: "The balloon supplies the red for primary actions, the stencil gives the secondary its black, and the wall lends the tertiary its soft grey.",
    },
  },
  "grand-bain": {
    src: grandBain, alt: "A white ripple circles a blue pool beside a yellow ladder and pink paving.",
    paper: "Porcelain", stock: "paper", ink: "shadow",
    reference: {
      title: "A Bigger Splash", artist: "David Hockney", date: "1967",
      url: "https://www.tate.org.uk/art/artworks/hockney-a-bigger-splash-t03254",
      note: "Pool blue carries the primary actions, the warm façade supplies the secondary, and the diving board lends its yellow to small accents.",
    },
  },
  ponctuation: {
    src: ponctuation, alt: "Rows of black perforations curve across a yellow metal sheet against blue-grey.",
    paper: "Ivory", stock: "primary", ink: "secondary",
    reference: {
      title: "Pumpkin", artist: "Yayoi Kusama", date: "1994",
      url: "https://benesse-artsite.jp/en/story/20210611-1661.html",
      note: "Pumpkin yellow and the black of the dots form the two action colours, with a quieter blue-grey drawn from the sea at Naoshima.",
    },
  },
  lisiere: {
    src: lisiere, alt: "Pink fabric floats diagonally across green water beside a bank of reeds.",
    paper: "Porcelain", stock: "primary", ink: "paper",
    reference: {
      title: "Surrounded Islands", artist: "Christo and Jeanne-Claude", date: "1983",
      url: "https://www.pamm.org/en/exhibition/christo-and-jeanne-claude-surrounded-islands-biscayne-bay-greater-miami-florida-1980-83-a-documentary-exhibition/",
      note: "Biscayne Bay sets the primary green, the floating fabric supplies a pink secondary, and the islands’ foliage deepens the tertiary.",
    },
  },
};
