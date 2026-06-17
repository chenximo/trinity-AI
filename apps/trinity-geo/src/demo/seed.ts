import brandJson from "../../mvp/config/brand.json";
import questionsJson from "../../mvp/config/questions.json";
import seedRecords from "../../mvp/data/r1/records.json";
import type { BrandConfig, Question, Record } from "./types";

export const brand = brandJson as BrandConfig;
export const questions = (questionsJson as { questions: Question[] }).questions;
export const seedR1Records = seedRecords as Record[];
