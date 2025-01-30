import './App.css';
import  { useState, useCallback, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  Handle,
  Position,
  ReactFlowInstance,
  getRectOfNodes,
  getTransformForBounds,
  // Panel
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import { toPng } from 'html-to-image';

import ProjectTitle from './components/projectTitle';



// Custom Node Component with adjusted sizing
const TableNode = ({ data }: { data: { label: string; fields: string[] } }) => (
  <div className="node-container" style={{ width: '160px', margin: '-8px' }}>  {/* Negative margin to fit within ReactFlow bounds */}
    <div className="bg-white rounded-md shadow-sm border border-gray-200">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-1.5 rounded-t-md">
        <div className="text-white font-medium text-xs truncate px-1">{data.label}</div>
      </div>
      <div className="p-1.5 space-y-1">
        {data.fields.filter(field => field.trim() !== "").map((field, index) => (
          <div key={index} className="text-gray-700 text-xs py-0.5 px-1.5 bg-gray-50 rounded border border-gray-100 flex items-center truncate">
            <span className="w-1 h-1 bg-green-400 rounded-full mr-1.5 flex-shrink-0"></span>
            <span className="truncate">{field}</span>
          </div>
        ))}
      </div>
    </div>
    <Handle 
      type="target" 
      position={Position.Left} 
      className="!w-2 !h-2 !-left-1 !border-2" 
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      className="!w-2 !h-2 !-right-1 !border-2" 
    />
  </div>
);


const nodeTypes = {
  default: TableNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function SchemaCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [tableName, setTableName] = useState("");
  const [fields, setFields] = useState<string[]>([""]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const flowRef = useRef<HTMLDivElement>(null);


  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onInit = (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
    };

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: uuidv4(),
        label: "FK",
        source: connection.source || '',
        target: connection.target || '',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    []
  );

  const addTable = () => {
    const newNode: Node = {
      id: uuidv4(),
      type: "default",
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: { label: `New Table`, fields: [] },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleTableSelect = (node: Node) => {
    console.log(reactFlowInstance);
    setSelectedNode(node);
    setTableName(node.data.label);
    setFields(node.data.fields || [""]);
  };

  const updateTable = () => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, label: tableName, fields } }
          : node
      )
    );
    setSelectedNode(null);
    setTableName("");
    setFields([""]);
  };

  const downloadImage = async () => {
    if (!reactFlowInstance || !flowRef.current) {
      console.error('Flow instance or ref not found');
      return;
    }
  
    try {
      // Get the flow element
      const flowElement = flowRef.current;
  
      // Get the viewport element
      const viewportElement = flowElement.querySelector('.react-flow__viewport');
      if (!viewportElement) {
        console.error('Viewport element not found');
        return;
      }
  
      // Calculate bounds
      const nodes = reactFlowInstance.getNodes();
      // const edges = reactFlowInstance.getEdges();
      const nodesBounds = getRectOfNodes(nodes);
      
      // Add padding to the bounds
      const padding = 50;
      const width = nodesBounds.width + padding * 2;
      const height = nodesBounds.height + padding * 2;
  
      // Get the transform for the bounds
      const transform = getTransformForBounds(
        nodesBounds,
        width,
        height,
        0.5,
        padding
      );
  
      // Configure html-to-image options
      const options = {
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
        quality: 2,
        pixelRatio: 2,
        skipAutoScale: true,
        fontEmbedCSS: '',
      };
  
      // First, modify the viewport for capture
      const originalTransform = (viewportElement as HTMLElement).style.transform;
      const originalWidth = (viewportElement as HTMLElement).style.width;
      const originalHeight = (viewportElement as HTMLElement).style.height;
  
      (viewportElement as HTMLElement).style.width = `${width}px`;
      (viewportElement as HTMLElement).style.height = `${height}px`;
      (viewportElement as HTMLElement).style.transform = `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`;
  
      // Capture the image
      const dataUrl = await toPng(viewportElement as HTMLElement, options);
  
      // Restore original viewport styles
      (viewportElement as HTMLElement).style.transform = originalTransform;
      (viewportElement as HTMLElement).style.width = originalWidth;
      (viewportElement as HTMLElement).style.height = originalHeight;
  
      // Create and trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `schema-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectTitle/>
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={addTable}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>➕</span>
            Add Table
          </button>
          <button
            onClick={downloadImage}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>⬇</span>
            Export Image
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 h-[70vh] overflow-hidden">
          <div ref={flowRef} className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => handleTableSelect(node)}
              nodeTypes={nodeTypes}
              onInit={onInit}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
              defaultEdgeOptions={{
                type: 'smoothstep',
                style: { strokeWidth: 2 },
                animated: true,
              }}
            >
              <MiniMap
                className="bg-white rounded-lg shadow-lg border border-gray-200"
                nodeColor={() => '#6366f1'}
                maskColor="rgba(255, 255, 255, 0.8)"
              />
              <Controls className="bg-white rounded-lg shadow-lg border border-gray-200" />
              <Background color="#e2e8f0" gap={16} size={1} />
            </ReactFlow>
          </div>
        </div>

        {/* Edit Panel - Same as before */}
        {selectedNode && (
          <div className="fixed top-24 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-96 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Table</h2>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <input
              className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Table Name"
            />
            
            <h3 className="text-lg font-medium text-gray-700 mb-2">Fields</h3>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={field}
                    onChange={(e) => {
                      const newFields = [...fields];
                      newFields[index] = e.target.value;
                      setFields(newFields);
                    }}
                    placeholder={`Field ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newFields = fields.filter((_, i) => i !== index);
                      setFields(newFields.length ? newFields : ['']);
                    }}
                    className="p-3 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 mt-4">
              <button
                onClick={() => setFields([...fields, ""])}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Add Field
              </button>
              <button
                onClick={updateTable}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}