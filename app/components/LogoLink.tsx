import type { FC } from "react";
import { withBasePath } from "../utils/deepgramUtils";

interface Props {
  href: string;
}

const LogoLink: FC<Props> = ({ href }) => (
  <a className="flex items-center text-gray-25 text-xl font-favorit" href={href}>
    Voice Intake
  </a>
);

export default LogoLink;