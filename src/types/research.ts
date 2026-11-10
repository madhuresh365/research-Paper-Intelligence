export interface PaperMetadata {
  title: string;
  url: string;
  authors: string[];
  publicationDate?: string;
  venueOrCategory?: string;
  arxivId?: string;
  githubRepoUrl?: string;
  retrievalSource: string;
  retrievalStatus: 'full' | 'abstract_only' | 'unsupported_fallback';
  retrievalNotes?: string;
}

export interface CoreConceptExtraction {
  summary: string; // Under 300 words
  wordCount: number;
  problemSolved: string;
  primaryMethodology: string;
  mathematicalOrAlgorithmicBreakthroughs: string[];
  csStudentKeyTakeaway: string;
}

export interface ArchitecturalFlowchart {
  mermaidCode: string; // Starts with graph TD
  systemInputs: string[];
  dataPreprocessing: string[];
  keyComponents: string[];
  systemOutputs: string[];
}

export interface FutureWorkOpportunity {
  id: string;
  projectTitle: string;
  exactTechnicalExtension: string;
  paperPartModified: string;
  targetPerformanceMetric: string;
  expectedImprovement: string;
  recommendedTechStack: string[];
  whyTechnicallyMeaningful: string;
}

export interface PaperExtendedReport {
  abstract?: string;
  introduction?: string;
  problemStatement?: string;
  methodology?: string;
  keyFindings?: string[];
  advantages?: string[];
  limitations?: string[];
  conclusion?: string;
  references?: string[];
}

export interface ResearchPaperAnalysis {
  id: string;
  analyzedAt: string;
  metadata: PaperMetadata;
  coreConcept: CoreConceptExtraction;
  architecture: ArchitecturalFlowchart;
  futureWorkOpportunities: FutureWorkOpportunity[];
  extendedReport?: PaperExtendedReport;
}

export interface ExamplePaper {
  title: string;
  category: string;
  year: string;
  url: string;
  description: string;
}
