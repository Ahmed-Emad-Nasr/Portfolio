/* /gallery is now the #art section of the one-page site */
import MovedToSection, { movedMetadata } from "@/app/components/shared/MovedToSection";

export const metadata = movedMetadata;

export default function Page() {
  return <MovedToSection section="art" />;
}
