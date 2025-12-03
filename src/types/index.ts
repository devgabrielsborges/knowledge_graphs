export interface Author {
  authorId: string;
  name: string;
  url?: string;
}

export interface Paper {
  paperId: string;
  title: string;
  abstract?: string;
  year?: number;
  venue?: string;
  url?: string;
  authors: Author[];
  citationCount?: number;
  referenceCount?: number;
  openAccessPdf?: {
    url: string;
    status: string;
  };
  fieldsOfStudy?: string[];
  publicationTypes?: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'paper' | 'author';
  val: number; // size
  data?: Paper | Author;
  color?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'citation' | 'reference' | 'authorship';
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
