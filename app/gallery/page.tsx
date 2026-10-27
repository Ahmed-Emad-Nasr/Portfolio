/* /gallery is now the #art section of the home page */
import MovedToSection, { movedMetadata } from "@/components/ui/MovedToSection";

export const metadata = movedMetadata;

export default function Page() {
  return <MovedToSection section="art" />;
}
