/* /about is now the #about section of the one-page site */
import MovedToSection, { movedMetadata } from "@/app/components/shared/MovedToSection";

export const metadata = movedMetadata;

export default function Page() {
  return <MovedToSection section="about" />;
}
