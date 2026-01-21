// src/components/Chatbot.tsx

'use client';

import React, { useState } from 'react';
import { MindNode } from '@/types/types';
import { Icons } from '@/constants/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface Props {
  nodes: MindNode[];
}

const Chatbot: React.FC<Props> = ({ nodes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! Ask me about your mind map.', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('explain') || lowerQuery.includes('describe')) {
      const searchTerm = lowerQuery.replace(/^(explain|describe) /, '').trim();
      const matchingNodes = nodes.filter(n => n.text.toLowerCase().includes(searchTerm));
      if (matchingNodes.length === 1) {
        const n = matchingNodes[0];
        const children = nodes.filter(child => child.parentId === n.id).map(c => `${c.text} (${c.type})`);
        const parent = nodes.find(p => p.id === n.parentId);
        let response = `Node: "${n.text}" (${n.type})`;
        if (parent) response += `. Parent: "${parent.text}"`;
        if (children.length) response += `. Sub-nodes: ${children.join(', ')}`;
        return response;
      }
      return 'Please specify which node to explain.';
    }

    if (lowerQuery.includes('summar') || lowerQuery.includes('summary')) {
      const root = nodes.find(n => !n.parentId);
      const conceptCount = nodes.filter(n => n.type === 'concept').length;
      const actionCount = nodes.filter(n => n.type === 'action').length;
      const problemCount = nodes.filter(n => n.type === 'problem').length;
      const solutionCount = nodes.filter(n => n.type === 'solution').length;
      return `Mind map summary: Main topic "${root?.text || 'Untitled'}". Total ${nodes.length} nodes (${conceptCount} concepts, ${actionCount} actions, ${problemCount} problems, ${solutionCount} solutions).`;
    }

    if (lowerQuery.includes('main') || lowerQuery.includes('root') || lowerQuery.includes('topic')) {
      const root = nodes.find(n => !n.parentId);
      return root ? `The main topic is: ${root.text}` : 'No main topic found.';
    }

    if (lowerQuery.includes('concept')) {
      const concepts = nodes.filter(n => n.type === 'concept').map(n => n.text);
      return concepts.length ? `Concepts: ${concepts.join(', ')}` : 'No concepts found.';
    }

    if (lowerQuery.includes('action')) {
      const actions = nodes.filter(n => n.type === 'action').map(n => n.text);
      return actions.length ? `Actions: ${actions.join(', ')}` : 'No actions found.';
    }

    if (lowerQuery.includes('problem')) {
      const problems = nodes.filter(n => n.type === 'problem').map(n => n.text);
      return problems.length ? `Problems: ${problems.join(', ')}` : 'No problems found.';
    }

    if (lowerQuery.includes('solution')) {
      const solutions = nodes.filter(n => n.type === 'solution').map(n => n.text);
      return solutions.length ? `Solutions: ${solutions.join(', ')}` : 'No solutions found.';
    }

    if (lowerQuery.includes('count') || lowerQuery.includes('how many')) {
      return `There are ${nodes.length} nodes in your mind map.`;
    }

    if (lowerQuery.includes('list') || lowerQuery.includes('all')) {
      const list = nodes.map(n => `${n.text} (${n.type})`).join(', ');
      return `All nodes: ${list}`;
    }

    // Search for nodes containing the query, stripping common prefixes
    const searchTerm = lowerQuery.replace(/^(what is|what are|tell me about|show me|find|give me|list|what's|how|why) /, '').trim();
    if (searchTerm.length < 3 || ['it', 'this', 'that', 'them', 'here', 'there'].includes(searchTerm)) {
      return 'Please ask more specifically about your mind map. For example, "what is practical implementation?" or "list all concepts".';
    }
    const matchingNodes = nodes.filter(n => n.text.toLowerCase().includes(searchTerm) || searchTerm.includes(n.text.toLowerCase().split(' ')[0]));
    if (matchingNodes.length > 0) {
      if (matchingNodes.length === 1) {
        const n = matchingNodes[0];
        const children = nodes.filter(child => child.parentId === n.id).map(c => c.text);
        const parent = nodes.find(p => p.id === n.parentId);
        let response = `Node: "${n.text}" (${n.type})`;
        if (parent) response += `. Parent: "${parent.text}"`;
        if (children.length) response += `. Children: ${children.join(', ')}`;
        return response;
      } else {
        return `Found nodes: ${matchingNodes.map(n => `${n.text} (${n.type})`).join(', ')}`;
      }
    }

    return 'I can help with questions about your mind map. Try asking about the main topic, concepts, actions, problems, or solutions, or search for specific terms.';
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };

    const botResponse = generateResponse(input);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot'
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[100] bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg"
      >
        <Icons.Sparkles />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-xl flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-bold">Mind Map Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
          <Icons.X />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg ${
              msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about your mind map..."
          className="flex-1"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
};

export default Chatbot;