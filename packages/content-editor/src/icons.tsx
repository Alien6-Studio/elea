import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

export const PlusIcon = (props: IconProps) => <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>;
export const PencilIcon = (props: IconProps) => <Icon {...props}><path d="m4 16-1 5 5-1L20 8a2.8 2.8 0 0 0-4-4L4 16ZM14 6l4 4M13 21h8" /></Icon>;
export const TrashIcon = (props: IconProps) => <Icon {...props}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></Icon>;
export const BoldIcon = (props: IconProps) => <Icon {...props}><path d="M7 4h7a4 4 0 0 1 0 8H7zM7 12h8a4 4 0 0 1 0 8H7z" /></Icon>;
export const ItalicIcon = (props: IconProps) => <Icon {...props}><path d="M19 4h-9M14 20H5M15 4 9 20" /></Icon>;
export const UnderlineIcon = (props: IconProps) => <Icon {...props}><path d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" /></Icon>;
export const LinkIcon = (props: IconProps) => <Icon {...props}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></Icon>;
export const EraserIcon = (props: IconProps) => <Icon {...props}><path d="m7 21-4-4a2 2 0 0 1 0-3L14 3a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-9 9M22 21H7M5 12l7 7" /></Icon>;
export const QuoteIcon = (props: IconProps) => <Icon {...props}><path d="M4 16h5V9H5a4 4 0 0 1 4-4M13 16h5V9h-4a4 4 0 0 1 4-4" /></Icon>;
export const ListIcon = (props: IconProps) => <Icon {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Icon>;
export const OrderedListIcon = (props: IconProps) => <Icon {...props}><path d="M10 7h11M10 17h11M3 5l2-1v6M3 10h4M3 15a2 2 0 0 1 4 0c0 1-1 2-4 5h4" /></Icon>;
export const HeadingIcon = (props: IconProps) => <Icon {...props}><path d="M6 4v16M18 4v16M6 12h12" /></Icon>;
export const PilcrowIcon = (props: IconProps) => <Icon {...props}><path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13" /></Icon>;
export const ImageIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></Icon>;
export const VideoIcon = (props: IconProps) => <Icon {...props}><path d="m22 8-6 4 6 4V8z" /><rect x="2" y="6" width="14" height="12" rx="2" /></Icon>;
export const PaperclipIcon = (props: IconProps) => <Icon {...props}><path d="m21 12-8.5 8.5a5 5 0 0 1-7-7l9-9a3 3 0 0 1 4.5 4.5l-9 9a1.5 1.5 0 0 1-2-2L16 8" /></Icon>;
export const CheckIcon = (props: IconProps) => <Icon {...props}><path d="M20 6 9 17l-5-5" /></Icon>;
export const CloseIcon = (props: IconProps) => <Icon {...props}><path d="M18 6 6 18M6 6l12 12" /></Icon>;
export const CopyIcon = (props: IconProps) => <Icon {...props}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Icon>;
export const ScissorsIcon = (props: IconProps) => <Icon {...props}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" /></Icon>;
export const GripIcon = (props: IconProps) => <Icon {...props}><circle cx="9" cy="6" r="1.2" /><circle cx="15" cy="6" r="1.2" /><circle cx="9" cy="12" r="1.2" /><circle cx="15" cy="12" r="1.2" /><circle cx="9" cy="18" r="1.2" /><circle cx="15" cy="18" r="1.2" /></Icon>;
export const UndoIcon = (props: IconProps) => <Icon {...props}><path d="m9 4-5 5 5 5M4 9h10a6 6 0 0 1 0 12h-2" /></Icon>;
export const RedoIcon = (props: IconProps) => <Icon {...props}><path d="m15 4 5 5-5 5m5-5H10a6 6 0 0 0 0 12h2" /></Icon>;
export const CropIcon = (props: IconProps) => <Icon {...props}><path d="M6 3v13a2 2 0 0 0 2 2h13M3 6h13a2 2 0 0 1 2 2v13" /></Icon>;
export const UploadIcon = (props: IconProps) => <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></Icon>;

export const blockTypeIcons: Record<string, (props: IconProps) => React.JSX.Element> = {
  paragraph: PilcrowIcon,
  header: HeadingIcon,
  list: ListIcon,
  quote: QuoteIcon,
  image: ImageIcon,
  video: VideoIcon,
  attachment: PaperclipIcon,
};
