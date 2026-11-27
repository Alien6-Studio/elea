import { Select } from "@alien6-studio/elea-ui";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";
import { featuredColourThemes, type StudioThemeId } from "../pages/brandTheme.js";

export const siteProfileOptions = featuredColourThemes.map(value => {
  const { name, colours } = colorThemes[value];
  return {
    value,
    label: <span className="site-profile-option">
      <span className="site-profile-option__swatches" aria-hidden="true">
        {(["primary", "secondary", "tertiary"] as const).map(role =>
          <span key={role} style={{ backgroundColor: colours[role] }} />)}
      </span>
      <span>{name}</span>
    </span>,
  };
});

export interface SiteProfileProps {
  profile?: StudioThemeId | null;
  onProfileChange?: (id: StudioThemeId) => void;
}

export function SiteProfileSelect({ profile = "reserve", onProfileChange }: Readonly<SiteProfileProps>) {
  return <Select
    id="site-profile"
    label="Site theme"
    size="sm"
    className="site-profile-select"
    options={siteProfileOptions}
    value={profile}
    placeholder="Custom theme"
    onChange={value => {
      const option = siteProfileOptions.find(option => option.value === value);
      if (option) onProfileChange?.(option.value);
    }}
  />;
}
