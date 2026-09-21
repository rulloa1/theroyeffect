import { MarkupShell } from "./MarkupShell";
import { HeroMarkup } from "./HeroMarkup";
import { FixedCut } from "./FixedCut";
import { AuditSheet } from "./AuditSheet";
import { StudiesSheet } from "./StudiesSheet";
import { ScheduleSheet } from "./ScheduleSheet";
import { CoverSheet } from "./CoverSheet";

/** The homepage, as six sheets of a proof. */
export function MarkupHome() {
  return (
    <MarkupShell>
      <HeroMarkup />
      <FixedCut />
      <AuditSheet />
      <StudiesSheet />
      <ScheduleSheet />
      <CoverSheet />
    </MarkupShell>
  );
}
