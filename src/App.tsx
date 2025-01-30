import './App.css';
import React, { useState, useCallback, useRef } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import html2canvas from "html2canvas";

// Custom Node Component
const TableNode = ({ data }: { data: { label: string; fields: string[] } }) => (
  <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-t-lg">
      <div className="text-white font-semibold text-lg truncate">{data.label}</div>
    </div>
    <div className="p-3 space-y-2">
      {data.fields.filter(field => field.trim() !== "").map((field, index) => (
        <div key={index} className="text-gray-700 text-sm py-1 px-2 bg-gray-50 rounded border border-gray-100 flex items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
          {field}
        </div>
      ))}
    </div>
    <Handle type="target" position={Position.Left} className="w-3 h-3 border-2" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 border-2" />
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
  const flowRef = useRef<HTMLDivElement>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

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
      position: { x: Math.random() * 600, y: Math.random() * 400 },
      data: { label: `New Table`, fields: [] },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleTableSelect = (node: Node) => {
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

  const exportImage = async () => {
    if (!flowRef.current) return;

    try {
      const flowElement = flowRef.current;
      const originalBackground = flowElement.style.background;
      flowElement.style.background = 'white';

      const canvas = await html2canvas(flowElement, {
        backgroundColor: '#ffffff',
        useCORS: true,
        scale: 2,
        logging: false,
      });

      flowElement.style.background = originalBackground;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `schema-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            Database Schema Designer
          </h1>
          <p className="text-gray-600 mb-6">Design your database schema visually</p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={addTable}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>➕</span>
            Add Table
          </button>
          <button
            onClick={exportImage}
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
              onNodeClick={(event, node) => handleTableSelect(node)}
              nodeTypes={nodeTypes}
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