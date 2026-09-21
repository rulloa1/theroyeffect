/**
 * What the Selected Work grid shows: the three concept studies from
 * work-studies.ts. They are invented businesses; keep that visible wherever
 * this data is rendered, and never attach results or numbers to them.
 */
import { WORK_STUDIES } from "@/lib/work-studies";

export interface StudyCard {
  slug: string;
  index: string;
  name: string;
  sector: string;
  summary: string;
  image: string;
  imageAlt: string;
}

export const STUDY_CARDS: StudyCard[] = WORK_STUDIES.map((study) => ({
  slug: study.slug,
  index: study.index,
  name: study.name,
  sector: study.sector,
  summary: study.summary,
  image: study.image,
  imageAlt: study.imageAlt,
}));

export const STUDIES_NOTE =
  "Concept studies: invented Houston businesses, used to show how the work runs from the first note to the finished site.";
