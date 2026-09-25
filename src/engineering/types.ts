/**
 * Engineering View data model. One object per project, stored in
 * src/engineering/projects/<slug>.ts and registered in ../registry.ts.
 *
 * Every section is optional and only renders when it has data, so leave a
 * field out (or empty) instead of filling it with anything unverified.
 */

export type ProjectStatus = 'production' | 'active-development' | 'experimental' | 'archived'

export type ArchitectureNode = {
  id: string
  label: string
  /** Technology behind this node, e.g. "Supabase Auth". */
  tech?: string
  /** What the node does; shown when the node is selected. */
  description: string
}

/** One column (desktop) or row (mobile) of the architecture diagram, in request order. */
export type ArchitectureLayer = {
  label: string
  nodes: ArchitectureNode[]
}

export type TechCategory = {
  category: string
  items: string[]
}

export type DataEntity = {
  name: string
  description: string
  /** Who can read/write it, in plain words, e.g. "Public read · admin write". */
  access?: string
}

export type DataRelationship = {
  from: string
  to: string
  kind: string
}

export type DatabaseOverview = {
  engine: string
  summary?: string
  entities: DataEntity[]
  relationships?: DataRelationship[]
}

export type FlowStep = {
  label: string
  detail?: string
}

export type DataFlow = {
  title: string
  steps: FlowStep[]
}

export type EngineeringNote = {
  name: string
  description: string
  tech?: string[]
}

export type EngineeringChallenge = {
  title: string
  challenge: string
  /** Leave out unless the investigation or design process is documented. */
  approach?: string
  solution: string
  impact?: string
}

/** A measured number. All fields are required so no metric appears without a source. */
export type PerformanceMetric = {
  label: string
  value: string
  source: string
  measuredAt: string
}

export type Fact = {
  label: string
  value: string
}

export type Milestone = {
  title: string
  description?: string
  /** Only a real date (e.g. from commit history). */
  date?: string
}

export type ProjectEngineering = {
  status?: ProjectStatus
  /** One-line technical description under the project name. */
  tagline: string
  /** Short engineering overview paragraph. */
  summary: string
  architecture?: ArchitectureLayer[]
  techStack?: TechCategory[]
  database?: DatabaseOverview
  dataFlows?: DataFlow[]
  features?: EngineeringNote[]
  challenges?: EngineeringChallenge[]
  performance?: {
    metrics?: PerformanceMetric[]
    techniques?: EngineeringNote[]
  }
  security?: EngineeringNote[]
  deployment?: {
    steps: FlowStep[]
    facts?: Fact[]
    note?: string
  }
  timeline?: {
    source?: string
    milestones: Milestone[]
  }
  /** Public repositories only; private repositories must never be listed here. */
  repository?: {
    url: string
    visibility: 'public'
    language?: string
  }
}
