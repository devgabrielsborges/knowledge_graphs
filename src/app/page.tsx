'use client';

import { useState, useCallback } from 'react';
import { Paper, GraphData, GraphNode, GraphLink, Author } from '@/types';
import Search from '@/components/Search';
import GraphVisualization from '@/components/GraphVisualization';
import { getPaperConnections } from '@/lib/api';
import { Loader2, ExternalLink, Trash2, Network } from 'lucide-react';

export default function Home() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [expanding, setExpanding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addPaperToGraph = useCallback((paper: Paper) => {
    console.log('Adding paper to graph:', paper.title);
    setGraphData((prev) => {
      const newNodes = [...prev.nodes];
      const newLinks = [...prev.links];

      // Add paper node if not exists
      if (!newNodes.find((n) => n.id === paper.paperId)) {
        newNodes.push({
          id: paper.paperId,
          label: paper.title,
          type: 'paper',
          val: 20,
          data: paper,
          color: '#3b82f6'
        });
      }

      // Add author nodes and links
      const authors = paper.authors || [];
      authors.forEach((author) => {
        // Use authorId if available, otherwise create a consistent ID from name
        const authorId = author.authorId || `author-${author.name.toLowerCase().trim().replace(/\s+/g, '-')}`;
        
        // Check if author node already exists by ID or by matching name
        const existingAuthor = newNodes.find((n) => 
          n.id === authorId || 
          (n.type === 'author' && n.label.toLowerCase().trim() === author.name.toLowerCase().trim())
        );
        
        const finalAuthorId = existingAuthor ? existingAuthor.id : authorId;
        
        if (!existingAuthor) {
          newNodes.push({
            id: finalAuthorId,
            label: author.name,
            type: 'author',
            val: 10,
            data: { ...author, authorId: finalAuthorId },
            color: '#ef4444'
          });
        }

        // Link author to paper (authorship)
        // Check if link exists - handle both string IDs and link objects
        const linkExists = newLinks.find((l) => {
          const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
          const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
          return (
            (sourceId === finalAuthorId && targetId === paper.paperId) || 
            (sourceId === paper.paperId && targetId === finalAuthorId)
          );
        });

        if (!linkExists) {
          newLinks.push({
            source: finalAuthorId,
            target: paper.paperId,
            type: 'authorship'
          });
        }
      });

      return { nodes: newNodes, links: newLinks };
    });
  }, []);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const removeNode = (nodeId: string) => {
    setGraphData((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      links: prev.links.filter((l) => {
        const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return sourceId !== nodeId && targetId !== nodeId;
      })
    }));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const expandPaper = async (paperId: string) => {
    setExpanding(true);
    try {
      const { citations, references } = await getPaperConnections(paperId);
      
      // Add citations (papers that cite this paper)
      // Link: Citation -> This Paper
      citations.forEach((citation: any) => {
        const citingPaper = citation.citingPaper;
        if (!citingPaper) return;

        addPaperToGraph({
            ...citingPaper,
            authors: citingPaper.authors || [] 
        } as Paper);
        
        setGraphData(prev => {
            const linkExists = prev.links.find(l => {
              const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
              const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
              return sourceId === citingPaper.paperId && targetId === paperId;
            });
            if (!linkExists) {
                return {
                    ...prev,
                    links: [...prev.links, { source: citingPaper.paperId, target: paperId, type: 'citation' }]
                };
            }
            return prev;
        });
      });

      // Add references (papers this paper cites)
      // Link: This Paper -> Reference
      references.forEach((reference: any) => {
        const citedPaper = reference.citedPaper;
        if (!citedPaper) return;

        addPaperToGraph({
            ...citedPaper,
            authors: citedPaper.authors || []
        } as Paper);

        setGraphData(prev => {
            const linkExists = prev.links.find(l => {
              const sourceId = typeof l.source === 'object' ? (l.source as any).id : l.source;
              const targetId = typeof l.target === 'object' ? (l.target as any).id : l.target;
              return sourceId === paperId && targetId === citedPaper.paperId;
            });
            if (!linkExists) {
                return {
                    ...prev,
                    links: [...prev.links, { source: paperId, target: citedPaper.paperId, type: 'reference' }]
                };
            }
            return prev;
        });
      });

    } catch (error) {
      console.error("Failed to expand paper", error);
    } finally {
      setExpanding(false);
    }
  };

  return (
    <main className="flex h-screen w-full bg-gray-50 dark:bg-neutral-950 overflow-hidden relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2.5 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {sidebarOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar with mobile responsive behavior */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Search onAddPaper={addPaperToGraph} />
      </div>
      
      <div className="flex-1 flex flex-col relative min-w-0">
        <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 p-3 pl-14 lg:pl-4 flex justify-between items-center shadow-sm z-10">
          <h1 className="text-base lg:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 truncate">
            <Network className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-500 flex-shrink-0" />
            <span className="truncate">Knowledge Graph Explorer</span>
          </h1>
          <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2 flex-shrink-0">
            {graphData.nodes.length}N • {graphData.links.length}L
          </div>
        </header>
        
        <div className="flex-1 relative">
          <GraphVisualization data={graphData} onNodeClick={handleNodeClick} />
        </div>
      </div>

      {selectedNode && (
        <div className="fixed lg:relative right-0 top-0 bottom-0 w-full sm:w-80 max-w-full lg:max-w-80 bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 overflow-y-auto p-4 shadow-lg z-50">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 break-words">
              {selectedNode.type === 'paper' ? 'Paper Details' : 'Author Details'}
            </h2>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Label</label>
              <p className="text-sm text-gray-900 dark:text-gray-200">{selectedNode.label}</p>
            </div>

            {selectedNode.type === 'paper' && (
              <>
                {selectedNode.data && (selectedNode.data as Paper).year && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Year</label>
                    <p className="text-sm text-gray-900 dark:text-gray-200">{(selectedNode.data as Paper).year}</p>
                  </div>
                )}
                {selectedNode.data && (selectedNode.data as Paper).venue && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Venue</label>
                    <p className="text-sm text-gray-900 dark:text-gray-200">{(selectedNode.data as Paper).venue}</p>
                  </div>
                )}
                {selectedNode.data && (selectedNode.data as Paper).abstract && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Abstract</label>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 max-h-40 overflow-y-auto leading-relaxed">
                      {(selectedNode.data as Paper).abstract}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => expandPaper(selectedNode.id)}
                    disabled={expanding}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {expanding ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                    Expand Graph
                  </button>
                  {(selectedNode.data as Paper).url && (
                    <a
                      href={(selectedNode.data as Paper).url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </>
            )}

            {selectedNode.type === 'author' && (
               <>
                 {selectedNode.data && (selectedNode.data as Author).url && (
                    <a
                      href={(selectedNode.data as Author).url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-neutral-700 w-full transition-colors"
                    >
                      View Profile <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
               </>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
              <button
                onClick={() => removeNode(selectedNode.id)}
                className="flex items-center justify-center w-full px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove from Graph
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
