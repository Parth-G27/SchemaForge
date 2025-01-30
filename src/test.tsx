// import './App.css';
// import React, { useState, useCallback, useRef } from "react";
// import ReactFlow, {
//   Controls,
//   Background,
//   MiniMap,
//   addEdge,
//   applyNodeChanges,
//   applyEdgeChanges,
//   Connection,
//   Edge,
//   Node,
//   NodeChange,
//   EdgeChange,
//   Handle,
//   Position,
//   ReactFlowInstance,
//   getRectOfNodes,
//   getTransformForBounds,
// } from "reactflow";
// import "reactflow/dist/style.css";
// import { v4 as uuidv4 } from "uuid";
// import html2canvas from "html2canvas";
// import { toPng } from 'html-to-image';

// // ... rest of your imports and TableNode component remain the same ...

// export default function SchemaCanvas() {
//   // ... other state declarations remain the same ...
//   const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
//   const flowRef = useRef<HTMLDivElement>(null);

//   // ... other functions remain the same ...

//   const onInit = (instance: ReactFlowInstance) => {
//     setReactFlowInstance(instance);
//   };

//   const downloadImage = async () => {
//     if (!reactFlowInstance || !flowRef.current) {
//       console.error('Flow instance or ref not found');
//       return;
//     }

//     try {
//       // Get nodes and viewport
//       const nodesBounds = getRectOfNodes(reactFlowInstance.getNodes());
//       const transform = getTransformForBounds(
//         nodesBounds,
//         nodesBounds.width,
//         nodesBounds.height,
//         0.5
//       );

//       // Get flow element
//       const element = flowRef.current.querySelector('.react-flow__viewport') as HTMLElement;
//       if (!element) {
//         console.error('Viewport not found');
//         return;
//       }

//       // Use html-to-image for better compatibility
//       const dataUrl = await toPng(element, {
//         backgroundColor: '#ffffff',
//         width: nodesBounds.width,
//         height: nodesBounds.height,
//         style: {
//           transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
//         },
//         quality: 1,
//         pixelRatio: 2,
//       });

//       // Create download link
//       const link = document.createElement('a');
//       link.href = dataUrl;
//       link.download = `schema-${new Date().toISOString().split('T')[0]}.png`;
//       link.click();
//     } catch (error) {
//       console.error('Error exporting image:', error);
//       alert('Failed to export image. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//       <div className="text-center">
//           <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
//             Database Schema Designer
//           </h1>
//           <p className="text-gray-600 mb-6">Design your database schema visually</p>
//         </div>
//         <div className="flex justify-center gap-4 mb-6">
//           <button
//             onClick={addTable}
//             className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
//           >
//             <span>➕</span>
//             Add Table
//           </button>
//           <button
//             onClick={downloadImage}
//             className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
//           >
//             <span>⬇</span>
//             Export Image
//           </button>
//         </div>

//         <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 h-[70vh] overflow-hidden">
//           <div ref={flowRef} className="w-full h-full">
//             <ReactFlow
//               nodes={nodes}
//               edges={edges}
//               onNodesChange={onNodesChange}
//               onEdgesChange={onEdgesChange}
//               onConnect={onConnect}
//               onNodeClick={(event, node) => handleTableSelect(node)}
//               nodeTypes={nodeTypes}
//               onInit={onInit}
//               fitView
//               minZoom={0.1}
//               maxZoom={1.5}
//               defaultEdgeOptions={{
//                 type: 'smoothstep',
//                 style: { strokeWidth: 2 },
//                 animated: true,
//               }}
//             >
//               <MiniMap
//                 className="bg-white rounded-lg shadow-lg border border-gray-200"
//                 nodeColor={(node) => '#6366f1'}
//                 maskColor="rgba(255, 255, 255, 0.8)"
//               />
//               <Controls className="bg-white rounded-lg shadow-lg border border-gray-200" />
//               <Background color="#e2e8f0" gap={16} size={1} />
//             </ReactFlow>
//           </div>
//         </div>

//         {/* ... rest of your component remains the same ... */}
//       </div>
//     </div>
//   );
// }